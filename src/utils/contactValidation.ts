import { z } from 'zod';
import { ServiceCategory } from '../types';

/**
 * Esquema robusto de validación con Zod para el formulario de contacto
 * de Decoelectric (Santo Domingo Este).
 */
export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre completo es requerido.')
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(70, 'El nombre no debe exceder 70 caracteres.')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
      'Solo se permiten letras y espacios en el nombre.'
    )
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Por favor ingresa al menos nombre y apellido para tu cotización.',
    }),

  phone: z
    .string()
    .trim()
    .min(1, 'El número de WhatsApp o teléfono es requerido.')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        // 10 dígitos locales (ej: 8093031738, 8295550199) o 11 dígitos con código país +1
        return (
          digits.length === 10 ||
          (digits.length === 11 && digits.startsWith('1'))
        );
      },
      {
        message: 'Ingresa un número de 10 dígitos válido (ej: 809-303-1738 o 829-555-0199).',
      }
    ),

  sector: z
    .string()
    .trim()
    .min(1, 'Por favor selecciona o indica tu sector en Santo Domingo Este.')
    .min(3, 'El sector debe tener al menos 3 caracteres.'),

  serviceNeeded: z.enum(['pvc', 'electricidad', 'plomeria', 'combo']),

  urgency: z.enum(['normal', 'urgente', 'emergencia']),

  preferredDate: z.string().optional().default(''),

  additionalDetails: z
    .string()
    .max(500, 'Los comentarios adicionales no pueden superar 500 caracteres.')
    .optional()
    .default(''),
});

export type ContactFormSchemaType = z.infer<typeof contactFormSchema>;

/**
 * Valida un campo individual en tiempo real utilizando la definición del esquema Zod.
 */
export const validateContactField = (
  field: keyof ContactFormSchemaType,
  value: any
): string | undefined => {
  // Extraemos la regla para este campo específico
  const shape = contactFormSchema.shape;
  const fieldRule = shape[field];

  if (!fieldRule) return undefined;

  const result = fieldRule.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message;
  }
  return undefined;
};

/**
 * Valida todo el formulario de contacto con Zod y devuelve el mapa de errores
 */
export const validateContactFormWithZod = (
  data: unknown
): {
  isValid: boolean;
  errors: Partial<Record<keyof ContactFormSchemaType, string>>;
  data?: ContactFormSchemaType;
} => {
  const result = contactFormSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {}, data: result.data };
  }

  const errors: Partial<Record<keyof ContactFormSchemaType, string>> = {};
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0] as keyof ContactFormSchemaType;
    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  }

  return { isValid: false, errors };
};
