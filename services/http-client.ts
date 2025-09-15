import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { secureTokenStorage, TokenData } from "./secure-storage";

/**
 * TolimaGO - HTTP Client con interceptores automáticos
 * Cliente HTTP profesional con manejo automático de tokens y refresh
 */

// Configuración base de la API
const API_CONFIG = {
  BASE_URL: "http://192.168.1.8:3000/api/v1",
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class HttpClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: string | null) => void;
    reject: (error: any) => void;
  }[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptores para requests y responses
   */
  private setupInterceptors(): void {
    // Request interceptor - agrega token automáticamente
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await secureTokenStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor - maneja errores y refresh automático
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si es error 401 y no estamos ya refrescando, intentar refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya estamos refrescando, esperar en cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              }
              return Promise.reject(error);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await secureTokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const newTokens = await this.refreshTokens(refreshToken);
            await secureTokenStorage.setTokens(newTokens);

            // Procesar cola de requests fallidos
            this.processQueue(newTokens.accessToken, null);

            // Reintentar request original con nuevo token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh falló, limpiar tokens y procesar cola
            this.processQueue(null, refreshError);
            await secureTokenStorage.clearAll();

            // Opcional: redirigir a login aquí o emitir evento
            throw this.handleError(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Procesa la cola de requests que esperaban el refresh
   */
  private processQueue(token: string | null, error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Refresca los tokens de autenticación
   */
  private async refreshTokens(refreshToken: string): Promise<TokenData> {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    if (!response.data?.success) {
      throw new Error("Refresh token failed");
    }

    return response.data.data.tokens;
  }

  /**
   * Maneja errores de manera consistente
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Error de respuesta del servidor
      return {
        message: error.response.data?.message || "Server error occurred",
        status: error.response.status,
        code: error.response.data?.code,
      };
    } else if (error.request) {
      // Error de red
      return {
        message: "Network error - please check your connection",
        status: 0,
        code: "NETWORK_ERROR",
      };
    } else {
      // Error en configuración
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  // =================== MÉTODOS PÚBLICOS ===================

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  /**
   * Request sin autenticación automática (para login/register)
   */
  async postPublic<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    console.log("🌐 [HTTP] postPublic called:", {
      url: `${API_CONFIG.BASE_URL}${url}`,
      data,
    });

    const publicConfig = {
      ...config,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...config?.headers,
        Authorization: undefined, // Remove auth header
      },
      timeout: API_CONFIG.TIMEOUT,
    };

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${url}`,
        data,
        publicConfig
      );
      console.log("📥 [HTTP] postPublic response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("💥 [HTTP] postPublic error:", error);

      // Si es un error de red, crear una respuesta de error estructurada
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        throw {
          message:
            "No se puede conectar al servidor. Verifica que el backend esté funcionando.",
          code: "ERR_NETWORK",
          status: 0,
        };
      }

      // Si la API devolvió un error estructurado
      if (error.response?.data) {
        throw error.response.data;
      }

      throw error;
    }
  }

  /**
   * Limpia las configuraciones de autenticación
   */
  async clearAuth(): Promise<void> {
    await secureTokenStorage.clearAll();
  }

  /**
   * Configura un token específico (útil para testing)
   */
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  /**
   * Remueve el token de autenticación de las headers
   */
  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Obtiene la instancia de Axios para casos especiales
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Configura la URL base (útil para diferentes entornos)
   */
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }
}

// Singleton instance
export const httpClient = new HttpClient();
