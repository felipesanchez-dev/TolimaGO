import * as SecureStore from "expo-secure-store";

/**
 * TolimaGO - Secure Token Storage
 * Manejo seguro de tokens con Expo SecureStore
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: "tolimaGO_access_token",
  REFRESH_TOKEN: "tolimaGO_refresh_token",
  TOKEN_EXPIRY: "tolimaGO_token_expiry",
  USER_DATA: "tolimaGO_user_data",
} as const;

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  phone?: string;
  city?: string;
  isResident?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

class SecureTokenStorage {
  /**
   * Guarda los tokens de manera segura
   */
  async setTokens(tokenData: TokenData): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(
          TOKEN_KEYS.ACCESS_TOKEN,
          tokenData.accessToken
        ),
        SecureStore.setItemAsync(
          TOKEN_KEYS.REFRESH_TOKEN,
          tokenData.refreshToken
        ),
        SecureStore.setItemAsync(
          TOKEN_KEYS.TOKEN_EXPIRY,
          this.calculateExpiryTimestamp(tokenData.expiresIn)
        ),
      ]);
    } catch (error) {
      console.error("Error storing tokens:", error);
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Obtiene el access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Obtiene el refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Verifica si el token ha expirado
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTimestamp = await SecureStore.getItemAsync(
        TOKEN_KEYS.TOKEN_EXPIRY
      );
      if (!expiryTimestamp) return true;

      const now = Date.now();
      const expiry = parseInt(expiryTimestamp, 10);

      const bufferTime = 60 * 1000;
      return now + bufferTime >= expiry;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  }

  /**
   * Guarda datos del usuario
   */
  async setUserData(userData: UserData): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        TOKEN_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error("Error storing user data:", error);
      throw new Error("Failed to store user data");
    }
  }

  /**
   * Obtiene datos del usuario
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  /**
   * Limpia todos los tokens y datos
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_EXPIRY).catch(() => {}),
        SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA).catch(() => {}),
      ]);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Verifica si hay tokens almacenados
   */
  async hasStoredTokens(): Promise<boolean> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);
      return !!(accessToken && refreshToken);
    } catch {
      return false;
    }
  }

  /**
   * Convierte el formato "15m" a timestamp de expiración
   */
  private calculateExpiryTimestamp(expiresIn: string): string {
    const now = Date.now();
    let milliseconds = 0;

    const timeValue = parseInt(expiresIn.slice(0, -1), 10);
    const timeUnit = expiresIn.slice(-1);

    switch (timeUnit) {
      case "s":
        milliseconds = timeValue * 1000;
        break;
      case "m":
        milliseconds = timeValue * 60 * 1000;
        break;
      case "h":
        milliseconds = timeValue * 60 * 60 * 1000;
        break;
      case "d":
        milliseconds = timeValue * 24 * 60 * 60 * 1000;
        break;
      default:
        milliseconds = 15 * 60 * 1000;
    }

    return (now + milliseconds).toString();
  }

  /**
   * Obtiene el tiempo restante de expiración en minutos
   */
  async getTimeUntilExpiry(): Promise<number> {
    try {
      const expiryTimestamp = await SecureStore.getItemAsync(
        TOKEN_KEYS.TOKEN_EXPIRY
      );
      if (!expiryTimestamp) return 0;

      const now = Date.now();
      const expiry = parseInt(expiryTimestamp, 10);
      const diffMs = expiry - now;

      return Math.max(0, Math.floor(diffMs / (60 * 1000)));
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const secureTokenStorage = new SecureTokenStorage();
