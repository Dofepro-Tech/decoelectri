# ⚡ Decoelectric - Panel de PVC & Servicios Eléctricos

[![Sitio Web](https://img.shields.io/badge/Sitio_Web-decoelectri.vercel.app-blue?style=for-the-badge&logo=vercel&logoColor=white)](https://decoelectri.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

¡Bienvenido a **Decoelectric**! Una solución web moderna, interactiva y de nivel de producción diseñada especialmente para la gestión de revestimientos decorativos en paneles de PVC y servicios de electricidad profesional en Santo Domingo Este, República Dominicana.

El sitio de producción oficial se encuentra desplegado y accesible en:
👉 **[https://decoelectri.vercel.app](https://decoelectri.vercel.app)**

Este proyecto combina la potencia de un diseño UI/UX espectacular, un asistente de inteligencia artificial avanzado y la robustez de Firebase en una aplicación web progresiva (PWA).

---

## 🚀 Características Clave

### 🤖 1. DecoBot AI (Asistente Técnico Virtual)
DecoBot es un asesor interactivo inteligente integrado directamente con la **API de Gemini de Google** (utilizando `gemini-3.8-flash` y `gemini-3.1-flash-lite` para máxima velocidad).
* **Búsqueda Web Grounding**: Puede verificar datos y precios del mercado dominicano y normativas eléctricas de RD (CNE / SIE) en tiempo real mediante búsquedas de Google integradas.
* **Google Maps Grounding**: Permite sugerir ubicaciones de ferreterías, puntos clave y áreas de cobertura en Santo Domingo Este.
* **Entrada y Salida de Voz**:
  * Entrada por reconocimiento de voz utilizando el micrófono del navegador.
  * Síntesis de voz avanzada con Gemini TTS (`gemini-3.8-flash-lite-tts`) y fallback nativo al sintetizador del navegador.
* **Mecanismo de Reintento con Backoff Exponencial**: En caso de interrupciones de red o fallos 500 del servidor, la aplicación realiza reintentos automáticos progresivos.
* **Interfaz de Diagnóstico de Errores**: Si ocurre un error definitivo, se presenta una UI amigable, explicativa y con botones de reintento o derivación directa a un técnico por WhatsApp con la consulta precargada.

### 📱 2. Progressive Web App (PWA) de Alto Rendimiento
La aplicación está configurada bajo las normativas modernas de PWA:
* **Instalabilidad**: Permite a tus clientes instalar la aplicación directamente en su pantalla de inicio de Android, iOS o Escritorio mediante botones de instalación personalizados.
* **Soporte Offline**: El Service Worker cachea los recursos esenciales. Si el usuario pierde conexión a internet, se muestra un banner amigable y un modal interactivo con la información de contacto offline de la empresa.
* **Persistencia Local**: Historial de chat guardado automáticamente en el `localStorage` del cliente.

### 📊 3. Calculadora de Presupuestos Inteligente
* Permite calcular el costo estimado en **Pesos Dominicanos (RD$)** para forrado de techos y paredes con paneles de PVC.
* Estima costos de balanceo eléctrico y breakers necesarios para aires acondicionados (BTUs).
* Genera gráficos interactivos del desglose del presupuesto y permite guardar los presupuestos o enviarlos directamente por WhatsApp con un solo clic.

### 🔥 4. Firebase Auth & Firestore Integration
* **Autenticación**: Registro e inicio de sesión seguro para los clientes.
* **Favoritos y Notas**: Permite a los usuarios registrados dar "me gusta" a proyectos de la galería y añadir notas privadas sobre sus estimaciones de presupuesto.
* **Seeding Inteligente**: Mecanismo que autosembra proyectos reales en la base de datos de Firestore únicamente si el usuario conectado es administrador.

### 🛠️ 5. Panel Administrativo
* Acceso exclusivo para administradores para gestionar los servicios de la empresa, añadir nuevos proyectos de PVC a la galería interactiva y actualizar datos de contacto clave.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React (TypeScript), Vite, Tailwind CSS.
* **Backend**: Express (Node.js) con soporte de ruteo para la API de Gemini.
* **Inteligencia Artificial**: `@google/genai` SDK de Google (modelos Gemini 3.8 y 3.1).
* **Base de Datos y Auth**: Firebase Firestore & Firebase Authentication.
* **Servicio Offline / PWA**: Vite PWA Plugin, Service Workers nativos.
* **Iconografía**: Lucide React.

---

## 📦 Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Dofepro-Tech/decoelectri.git
cd decoelectri
```

### 2. Instalar dependencias
Se recomienda utilizar `npm` o `bun`:
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales (puedes guiarte de `.env.example`):
```env
# Clave privada para DecoBot AI
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Puerto de ejecución (por defecto 3000)
PORT=3000
```

*Nota: Para la sincronización de favoritos y notas con Firebase en tu propio servidor, configura las credenciales de Firebase en `src/firebase/config.ts`.*

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
Abre el navegador en [http://localhost:3000](http://localhost:3000).

---

## 🚢 Despliegue en Producción (Vercel)

El proyecto está configurado y optimizado específicamente para desplegarse en **Vercel** utilizando funciones serverless:

1. Conecta tu repositorio de GitHub con tu cuenta de Vercel.
2. Configura las siguientes variables de entorno en el panel de Vercel (**Settings > Environment Variables**):
   * `GEMINI_API_KEY`: Tu clave privada de Google AI Studio.
3. Vercel detectará la configuración del archivo `vercel.json` y compilará la aplicación automáticamente.

Para construir y levantar localmente en modo producción:
```bash
# Construir frontend
npm run build

# Iniciar servidor local de producción
npm run start
```

---

## 👥 Contribuciones y Soporte
Este proyecto es propiedad intelectual de **Dofepro-Tech**. Si deseas reportar un error o sugerir una mejora técnica para Decoelectric, puedes abrir un issue o enviar una consulta directa a través de nuestros canales oficiales.
