import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Instancia perezosa de Gemini SDK (Lazy Initialization para evitar fallos si falta la clave al inicio)
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Endpoint de verificación de salud
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Decoelectric AI & Services API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint para guardar o actualizar preferencias de cookies en el servidor
app.post('/api/cookies/preferences', (req: Request, res: Response) => {
  try {
    const { consent, preferences } = req.body;
    // Guardamos la cookie HTTP de consentimiento
    res.cookie('decoelectric_consent', consent ? 'accepted' : 'rejected', {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
      httpOnly: false, // Accesible por cliente para sincronización
      sameSite: 'lax',
    });

    if (preferences) {
      res.cookie('decoelectric_preferences', JSON.stringify(preferences), {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    res.json({ success: true, message: 'Preferencias de cookies guardadas correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Error al guardar cookies' });
  }
});

// Endpoint principal para el Chatbot Gemini con soporte de Grounding (Google Search & Google Maps)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, toolsConfig, userLocation } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Se requiere el campo "message" como texto.' });
      return;
    }

    const ai = getGeminiClient();

    // Selección de modelo según la velocidad y profundidad solicitada
    // Se usa gemini-3.8-flash para tareas generales y gemini-3.1-flash-lite para respuestas ultra rápidas
    const model = toolsConfig?.fastMode ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const systemInstruction = `Eres "DecoBot", el Asistente Técnico y Asesor Especializado de Decoelectric en Santo Domingo Este, República Dominicana.
Decoelectric es una empresa dominicana especializada en:
1. Paneles decorativos de PVC para techos y paredes: estilos modernos, machihembrados, perfiles de terminación, aislamiento y protección contra humedad.
2. Electricidad Residencial y Comercial: cableados certificados, balanceo de cargas, instalación de breakers y paneles de distribución, tomacorrientes seguros, interruptores y reparación de averías.
3. Iluminación LED & Domótica: perfiles de aluminio para tiras LED COB, ojos de buey (spots), luces indirectas, lámparas decorativas y ventiladores de techo.
4. Mantenimiento y asesoría técnica.
Zona de servicio: Santo Domingo Este (Ensanche Ozama, Alma Rosa I y II, Invivienda, San Isidro, Lucerna, Las Américas, Los Frailes, San Luis, etc.) y zonas aledañas del Gran Santo Domingo.
Contacto oficial: Teléfono 809-303-1730 y WhatsApp 809-303-1738.

Pautas de tu rol:
- Sé siempre cortés, amable, técnico pero accesible y enfocado en la seguridad del hogar o negocio.
- Si el usuario pide cotización o precios, proporciona un rango estimado orientativo en Pesos Dominicanos (RD$) y sugiere utilizar la Calculadora de Presupuesto en pantalla o enviar su requerimiento directo a WhatsApp con los técnicos.
- Cuando la búsqueda web esté activa, incorpora datos actuales de materiales, precios del mercado dominicano y normativas eléctricas de RD (CNE / SIE).
- Cuando Maps esté activa, sugiere ubicaciones de ferreterías, puntos clave y cobertura en Santo Domingo Este.`;

    // Configuración de herramientas (Google Search vs Google Maps)
    // Regla de Gemini: googleMaps NO se puede combinar con googleSearch en la misma solicitud
    let tools: any[] | undefined = undefined;
    let toolConfig: any = undefined;

    if (toolsConfig?.mapsGrounding) {
      tools = [{ googleMaps: {} }];
      if (userLocation?.latitude && userLocation?.longitude) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude),
              longitude: Number(userLocation.longitude),
            },
          },
        };
      }
    } else if (toolsConfig?.searchGrounding) {
      tools = [{ googleSearch: {} }];
    }

    // Formatear historial si existe para conversación multi-turno
    const formattedContents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item && item.text && (item.role === 'user' || item.role === 'model')) {
          formattedContents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const candidateModels = [
      model,
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];
    let response: any = null;
    let successfulModel = model;

    for (const currentModel of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: currentModel,
          contents: formattedContents,
          config: {
            systemInstruction,
            tools,
            toolConfig,
          },
        });
        successfulModel = currentModel;
        break;
      } catch (genErr: any) {
        const errMsg = genErr?.message || String(genErr);
        console.warn(`Intento con ${currentModel} falló:`, errMsg);

        // Si es un error permanente de clave de API o cuota, no seguir reintentando en bucle para evitar lentitud
        if (errMsg.toLowerCase().includes('api_key') || 
            errMsg.toLowerCase().includes('key not valid') || 
            errMsg.toLowerCase().includes('invalid') || 
            errMsg.toLowerCase().includes('unauthorized') || 
            errMsg.toLowerCase().includes('not configured')) {
          throw new Error(`Fallo de Autenticación con Gemini API: ${errMsg}`);
        }

        // Si falló por herramientas de búsqueda/mapas o sobrecarga de modelo, probar sin herramientas
        if (tools) {
          try {
            response = await ai.models.generateContent({
              model: currentModel,
              contents: formattedContents,
              config: {
                systemInstruction,
              },
            });
            successfulModel = currentModel;
            break;
          } catch (noToolsErr) {
            console.warn(`Reintento sin tools en ${currentModel} falló.`);
          }
        }
      }
    }

    if (!response) {
      // Respuesta de contingencia amigable si la API de Gemini está en sobrecarga temporal (503/429)
      return res.json({
        text: '¡Hola! En este momento DecoBot está experimentando una alta demanda en sus servidores. Con gusto puedo orientarte: para cotizaciones inmediatas de paneles PVC para techos o trabajos eléctricos en Santo Domingo Este, puedes usar la Calculadora de Presupuesto en nuestra web o escribir directamente a nuestros técnicos por WhatsApp al 809-303-1738.',
        groundingChunks: [],
        webSearchQueries: [],
        modelUsed: 'offline-contingency',
      });
    }

    const text = response.text || 'Disculpa, no pude procesar la respuesta en este momento.';

    // Extraer citas de Grounding (Google Search o Google Maps)
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      text,
      groundingChunks,
      webSearchQueries,
      modelUsed: successfulModel,
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/chat:', error);
    res.status(500).json({
      error: `Error del servidor al consultar a Gemini: ${error?.message || String(error)}`,
    });
  }
});

// Endpoint de Text-to-Speech con Gemini TTS (gemini-3.1-flash-tts-preview)
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Se requiere el campo "text" a sintetizar.' });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 400),
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: 'No se generaron datos de audio.' });
      return;
    }

    res.json({ audio: base64Audio, mimeType: 'audio/mp3' });
  } catch (error: any) {
    console.error('Error en /api/gemini/tts:', error);
    res.status(500).json({
      error: error?.message || 'Error al generar síntesis de voz.',
    });
  }
});

// Inicialización de Vite o archivos estáticos
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Decoelectric ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

// Exportar la app para entornos Serverless como Vercel
export default app;

// Solo iniciar el servidor clásico si no estamos en el entorno de Vercel
if (!process.env.VERCEL) {
  startServer();
}
