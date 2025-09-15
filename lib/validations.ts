import { z } from "zod";

/**
 * TolimaGO - Validation Schemas
 * Esquemas de validación con Zod para formularios de autenticación
 */

// =================== ESQUEMAS BASE ===================

const emailSchema = z
  .string()
  .min(1, "El email es requerido")
  .email("Ingresa un email válido")
  .max(100, "El email es demasiado largo");

const passwordSchema = z
  .string()
  .min(1, "La contraseña es requerida")
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(100, "La contraseña es demasiado larga");

const nameSchema = z
  .string()
  .min(1, "El nombre es requerido")
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(50, "El nombre es demasiado largo")
  .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "El nombre solo debe contener letras");

const phoneSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value) return true; // Opcional
    // Formato colombiano: +57 3XX XXXXXXX o similar
    const phoneRegex = /^(\+57\s?)?[3][0-9]{2}\s?[0-9]{7}$/;
    return phoneRegex.test(value.replace(/\s/g, ""));
  }, "Ingresa un número de teléfono colombiano válido (+57 3XX XXXXXXX)");

const citySchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value) return true; // Opcional
    return value.length >= 2 && value.length <= 50;
  }, "La ciudad debe tener entre 2 y 50 caracteres");

// =================== ESQUEMA DE LOGIN ===================
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =================== ESQUEMA DE REGISTRO ===================
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    isResident: z.boolean().default(false),
    acceptTerms: z
      .boolean()
      .refine(
        (value) => value === true,
        "Debes aceptar los términos y condiciones"
      ),
    phone: phoneSchema,
    city: citySchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Tipo para el formulario (con defaults explícitos)
export type RegisterFormInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  city?: string;
  isResident: boolean;
  acceptTerms: boolean;
};

// =================== ESQUEMA DE RECUPERAR CONTRASEÑA ===================
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// =================== ESQUEMA DE RESTABLECER CONTRASEÑA ===================
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requerido"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// =================== VALIDADORES UTILITARIOS ===================

/**
 * Valida fortaleza de contraseña
 */
export const validatePasswordStrength = (password: string) => {
  const score = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(score).filter(Boolean).length;

  return {
    score: strength,
    checks: score,
    strength: strength < 2 ? "weak" : strength < 4 ? "medium" : "strong",
    isValid: strength >= 3, // Mínimo 3 criterios
  };
};

/**
 * Sanitiza input de texto
 */
export const sanitizeTextInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ");
};

/**
 * Formatea número de teléfono colombiano
 */
export const formatColombianPhone = (phone: string): string => {
  // Remover todos los caracteres no numéricos excepto +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Si empieza con +57, formatear
  if (cleaned.startsWith("+57")) {
    const number = cleaned.substring(3);
    if (number.length >= 10) {
      return `+57 ${number.substring(0, 3)} ${number.substring(3, 10)}`;
    }
  }

  // Si es número local (10 dígitos)
  if (cleaned.length === 10 && cleaned.startsWith("3")) {
    return `+57 ${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }

  return phone;
};

// =================== MENSAJES DE ERROR PERSONALIZADOS ===================
export const errorMessages = {
  required: "Este campo es requerido",
  invalidEmail: "Ingresa un email válido",
  passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
  passwordTooWeak: "La contraseña debe ser más fuerte",
  passwordsNotMatch: "Las contraseñas no coinciden",
  invalidPhone: "Ingresa un número de teléfono válido",
  nameTooShort: "El nombre debe tener al menos 2 caracteres",
  nameInvalidChars: "El nombre solo debe contener letras",
  termsNotAccepted: "Debes aceptar los términos y condiciones",
  networkError: "Error de conexión. Verifica tu internet",
  serverError: "Error del servidor. Intenta más tarde",
  invalidCredentials: "Email o contraseña incorrectos",
  userAlreadyExists: "Ya existe una cuenta con este email",
} as const;
