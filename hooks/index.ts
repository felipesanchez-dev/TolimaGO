/**
 * TolimaGO - Índice de Hooks Profesionales
 * 
 * Este módulo exporta todos los hooks profesionales desarrollados para TolimaGO,
 * proporcionando una interfaz limpia y organizada para su uso en toda la aplicación.
 */

// Hooks de API y mutaciones
export {
    useApiMutation,
    useAuthMutation,
    useCriticalMutation, type MutationActions, type MutationState, type UseMutationOptions
} from './use-api-mutation';

// Hooks de formularios y validación
export {
    useForm, type FieldConfig, type FieldState, type FormActions, type FormConfig, type FormState, type ValidationRule
} from './use-form';

// Hooks de estado de red
export {
    useConnectionRecovery, useNetworkState,
    useNetworkStatus, type NetworkActions, type NetworkState, type UseNetworkStateOptions
} from './use-network-state';

// Hooks de autenticación
export {
    useAuth, type AuthActions, type AuthState, type AuthTokens, type LoginCredentials,
    type RegisterData, type UseAuthOptions, type User
} from './use-auth';

// Re-exportar AsyncStorage para consistencia
export { default as AsyncStorage } from '@react-native-async-storage/async-storage';

/**
 * Configuración global de hooks
 */
export const HOOKS_CONFIG = {
  // Configuración de red
  network: {
    defaultTimeout: 10000,
    maxRetries: 3,
    baseURL: 'http://192.168.1.8:3000/api/v1',
  },
  
  // Configuración de autenticación
  auth: {
    tokenRefreshThreshold: 5, // minutos
    maxLoginAttempts: 5,
    lockDuration: 30, // minutos
    sessionTimeout: 60, // minutos
  },
  
  // Configuración de formularios
  forms: {
    defaultDebounceMs: 300,
    validateOnChange: true,
    validateOnBlur: true,
  },
} as const;

/**
 * Utility functions para hooks
 */
export const HookUtils = {
  /**
   * Formatea errores de API para mostrar al usuario
   */
  formatApiError: (error: any): string => {
    if (typeof error === 'string') return error;
    
    if (error?.message) return error.message;
    
    if (error?.response?.data?.message) return error.response.data.message;
    
    if (error?.status) {
      switch (error.status) {
        case 400: return 'Solicitud inválida';
        case 401: return 'No autorizado';
        case 403: return 'Acceso denegado';
        case 404: return 'No encontrado';
        case 429: return 'Demasiadas solicitudes';
        case 500: return 'Error interno del servidor';
        default: return 'Error de conexión';
      }
    }
    
    return 'Error desconocido';
  },

  /**
   * Valida formato de email
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida formato de teléfono colombiano
   */
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^(\+57|57)?[\s\-]?3[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Formatea número de teléfono colombiano
   */
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('57')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('3') && cleaned.length === 10) {
      return `+57 ${cleaned}`;
    }
    
    return phone;
  },

  /**
   * Debounce function para formularios
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: any;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Genera un ID único para formularios
   */
  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Verifica si el dispositivo está en modo offline
   */
  isOffline: async (): Promise<boolean> => {
    try {
      await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return false;
    } catch {
      return true;
    }
  },
};

/**
 * Constantes útiles para los hooks
 */
export const HOOK_CONSTANTS = {
  // Códigos de estado HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Tipos de errores de red
  NETWORK_ERRORS: {
    TIMEOUT: 'TIMEOUT',
    NO_CONNECTION: 'NO_CONNECTION',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN',
  },
  
  // Eventos de autenticación
  AUTH_EVENTS: {
    LOGIN_SUCCESS: 'auth:login:success',
    LOGIN_FAILED: 'auth:login:failed',
    LOGOUT: 'auth:logout',
    TOKEN_REFRESHED: 'auth:token:refreshed',
    SESSION_EXPIRED: 'auth:session:expired',
  },
  
  // Tipos de validación
  VALIDATION_TYPES: {
    REQUIRED: 'required',
    EMAIL: 'email',
    PHONE: 'phone',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    CUSTOM: 'custom',
  },
} as const;

// Default export con configuración y utilities
export default {
  HookUtils,
  HOOK_CONSTANTS,
  HOOKS_CONFIG,
};