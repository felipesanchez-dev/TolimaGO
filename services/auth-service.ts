import { httpClient } from "./http-client";
import { secureTokenStorage, TokenData, UserData } from "./secure-storage";

/**
 * TolimaGO - Authentication Service
 * Servicio profesional para todas las operaciones de autenticación
 */

/**
 * Servicio de autenticación para APIs reales de TolimaGO
 * Conectado directamente con el backend en producción
 */

// =================== TIPOS DE DATOS ===================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  isResident?: boolean;
  role?: "user" | "admin" | "business";
}

export interface AuthResponse {
  user: UserData;
  tokens: TokenData;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPassword {
  token: string;
  newPassword: string;
}

// =================== ESTADOS DE AUTENTICACIÓN ===================
export enum AuthState {
  IDLE = "idle",
  LOADING = "loading",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  ERROR = "error",
}

export interface AuthError {
  message: string;
  field?: string; // Para errores específicos de campos
  code?: string;
}

class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      // Preparar datos para la API real
      const requestData = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone || "",
        city: registerData.city || "",
        isResident: registerData.isResident || true,
        role: registerData.role || "user",
      };

      // Hacer llamada a la API
      const response = await httpClient.postPublic<{
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isEmailVerified: boolean;
          createdAt?: string;
        };
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: string;
        };
      }>("/auth/register", requestData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Registration failed");
      }

      // Transformar respuesta de la API a formato interno
      const authResponse: AuthResponse = {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          phone: requestData.phone,
          city: requestData.city,
          isResident: requestData.isResident,
          role: response.data.user.role as "user" | "admin" | "business",
          isEmailVerified: response.data.user.isEmailVerified,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
        },
        tokens: {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresIn: response.data.tokens.expiresIn,
        },
      };

      // Guardar tokens y datos de usuario automáticamente
      await Promise.all([
        secureTokenStorage.setTokens(authResponse.tokens),
        secureTokenStorage.setUserData(authResponse.user),
      ]);

      return authResponse;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Inicia sesión del usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Hacer llamada a la API real
      const response = await httpClient.postPublic<{
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isEmailVerified: boolean;
          lastLoginAt?: string;
        };
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: string;
        };
      }>("/auth/login", credentials);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed");
      }

      // Transformar respuesta de la API a formato interno
      const authResponse: AuthResponse = {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          isEmailVerified: response.data.user.isEmailVerified,
          createdAt: new Date().toISOString(), // Timestamp del login
          lastLoginAt:
            response.data.user.lastLoginAt || new Date().toISOString(),
        },
        tokens: {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresIn: response.data.tokens.expiresIn,
        },
      };

      // Guardar tokens y datos de usuario automáticamente
      await Promise.all([
        secureTokenStorage.setTokens(authResponse.tokens),
        secureTokenStorage.setUserData(authResponse.user),
      ]);

      return authResponse;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      // Intentar logout en el servidor (opcional, puede fallar si no hay conexión)
      try {
        await httpClient.post("/auth/logout");
      } catch (serverError) {
        // Ignorar errores del servidor en logout, limpiar local de todas formas
        console.warn(
          "Server logout failed, proceeding with local cleanup:",
          serverError
        );
      }

      // Limpiar tokens localmente
      await secureTokenStorage.clearAll();
      httpClient.removeAuthToken();
    } catch (error: any) {
      // Asegurar limpieza local incluso si hay errores
      await secureTokenStorage.clearAll();
      httpClient.removeAuthToken();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresca los tokens de autenticación
   */
  async refreshTokens(): Promise<TokenData> {
    try {
      const refreshToken = await secureTokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await httpClient.postPublic<{ tokens: TokenData }>(
        "/auth/refresh",
        {
          refreshToken,
        }
      );

      if (!response.success || !response.data?.tokens) {
        throw new Error(response.message || "Token refresh failed");
      }

      // Guardar nuevos tokens
      await secureTokenStorage.setTokens(response.data.tokens);

      return response.data.tokens;
    } catch (error: any) {
      // Si el refresh falla, limpiar tokens
      await secureTokenStorage.clearAll();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await httpClient.get<{ user: UserData }>("/auth/me");

      if (!response.success || !response.data?.user) {
        throw new Error(response.message || "Failed to get user profile");
      }

      // Actualizar datos de usuario en storage
      await secureTokenStorage.setUserData(response.data.user);

      return response.data.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verifica si hay una sesión válida
   */
  async verifySession(): Promise<boolean> {
    try {
      // Verificar si hay tokens almacenados
      const hasTokens = await secureTokenStorage.hasStoredTokens();
      if (!hasTokens) {
        return false;
      }

      // Verificar si el token ha expirado
      const isExpired = await secureTokenStorage.isTokenExpired();
      if (isExpired) {
        // Intentar refresh automático
        try {
          await this.refreshTokens();
          return true;
        } catch {
          return false;
        }
      }

      // Verificar con el servidor
      try {
        await this.getCurrentUser();
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Verifica si el token necesita refresh pronto
   */
  async shouldRefreshToken(): Promise<boolean> {
    try {
      const timeUntilExpiry = await secureTokenStorage.getTimeUntilExpiry();
      // Refresh si quedan menos de 5 minutos
      return timeUntilExpiry < 5;
    } catch {
      return false;
    }
  }

  /**
   * Solicita reset de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await httpClient.postPublic<void>(
        "/auth/reset-password",
        { email }
      );

      if (!response.success) {
        throw new Error(response.message || "Password reset request failed");
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirma el reset de contraseña
   */
  async confirmPasswordReset(data: ConfirmResetPassword): Promise<void> {
    try {
      const response = await httpClient.postPublic<void>(
        "/auth/confirm-reset-password",
        data
      );

      if (!response.success) {
        throw new Error(
          response.message || "Password reset confirmation failed"
        );
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verifica un token de verificación
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await httpClient.postPublic<void>("/auth/verify-token", {
        token,
      });
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene datos de usuario almacenados localmente
   */
  async getStoredUserData(): Promise<UserData | null> {
    return await secureTokenStorage.getUserData();
  }

  /**
   * Obtiene access token almacenado localmente
   */
  async getStoredAccessToken(): Promise<string | null> {
    return await secureTokenStorage.getAccessToken();
  }

  /**
   * Limpia toda la sesión local (sin llamar al servidor)
   */
  async clearLocalSession(): Promise<void> {
    await secureTokenStorage.clearAll();
    httpClient.removeAuthToken();
  }

  // =================== MÉTODOS PRIVADOS ===================

  /**
   * Maneja errores de autenticación de manera consistente
   */
  private handleAuthError(error: any): AuthError {
    if (error.response?.data) {
      const errorData = error.response.data;
      return {
        message: errorData.message || "Authentication error occurred",
        field: errorData.field,
        code: errorData.code,
      };
    }

    if (error.message) {
      return {
        message: error.message,
        code: error.code,
      };
    }

    return {
      message: "An unexpected authentication error occurred",
      code: "UNKNOWN_AUTH_ERROR",
    };
  }
}

// Singleton instance
export const authService = new AuthService();
