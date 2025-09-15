import {
  authService,
  AuthState,
  LoginCredentials,
  RegisterData,
} from "@/services/auth-service";
import { UserData } from "@/services/secure-storage";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

/**
 * TolimaGO - Authentication Context
 * Context profesional para manejo global del estado de autenticación
 */

// =================== TIPOS ===================
export interface AuthContextState {
  // Estado principal
  state: AuthState;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Datos del usuario
  user: UserData | null;

  // Errores
  error: string | null;

  // Estado de inicialización
  isInitialized: boolean;
}

export interface AuthContextActions {
  // Acciones de autenticación
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;

  // Gestión de sesión
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // Utilidades
  checkAuthStatus: () => Promise<void>;
}

export type AuthContextValue = AuthContextState & AuthContextActions;

// =================== ACCIONES DEL REDUCER ===================
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AUTHENTICATED"; payload: { user: UserData } }
  | { type: "SET_UNAUTHENTICATED" }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: UserData };

// =================== STATE INICIAL ===================
const initialState: AuthContextState = {
  state: AuthState.IDLE,
  isLoading: true, // Empezar con loading para el bootstrap
  isAuthenticated: false,
  user: null,
  error: null,
  isInitialized: false,
};

// =================== REDUCER ===================
function authReducer(
  state: AuthContextState,
  action: AuthAction
): AuthContextState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        state: action.payload ? AuthState.LOADING : state.state,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        state: action.payload ? AuthState.ERROR : state.state,
      };

    case "SET_AUTHENTICATED":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
        isLoading: false,
        state: AuthState.AUTHENTICATED,
        isInitialized: true,
      };

    case "SET_UNAUTHENTICATED":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false,
        state: AuthState.UNAUTHENTICATED,
        isInitialized: true,
      };

    case "SET_INITIALIZED":
      return {
        ...state,
        isInitialized: action.payload,
        isLoading: action.payload ? state.isLoading : false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
        state: state.isAuthenticated
          ? AuthState.AUTHENTICATED
          : AuthState.UNAUTHENTICATED,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// =================== CONTEXT ===================
const AuthContext = createContext<AuthContextValue | null>(null);

// =================== PROVIDER ===================
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // =================== BOOTSTRAP DE AUTENTICACIÓN ===================
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Verificar si hay una sesión válida almacenada
      const isValidSession = await authService.verifySession();

      if (isValidSession) {
        // Obtener datos de usuario actualizados
        const user = await authService.getCurrentUser();
        dispatch({ type: "SET_AUTHENTICATED", payload: { user } });
      } else {
        // No hay sesión válida
        dispatch({ type: "SET_UNAUTHENTICATED" });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // En caso de error, considerar como no autenticado
      dispatch({ type: "SET_UNAUTHENTICATED" });
    }
  }, []);

  // Ejecutar bootstrap al montar el componente
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // =================== ACCIONES DE AUTENTICACIÓN ===================
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const authResponse = await authService.login(credentials);
      dispatch({
        type: "SET_AUTHENTICATED",
        payload: { user: authResponse.user },
      });
    } catch (error: any) {
      const errorMessage = error.message || "Error al iniciar sesión";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error; // Re-lanzar para que el componente pueda manejar el error
    }
  }, []);

  const register = async (data: any) => {
    const res = await fetch("http://192.168.1.8:3000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    // aquí puedes guardar tokens en AsyncStorage / SecureStore
    return result.data;
  };

  const logout = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      await authService.logout();
      dispatch({ type: "SET_UNAUTHENTICATED" });
      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Asegurar que se limpie el estado local incluso si hay error
      dispatch({ type: "SET_UNAUTHENTICATED" });
    }
  }, []);

  // =================== GESTIÓN DE SESIÓN ===================
  const refreshSession = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      await authService.refreshTokens();
      const user = await authService.getCurrentUser();

      dispatch({ type: "SET_AUTHENTICATED", payload: { user } });
    } catch (error: any) {
      console.error("Session refresh error:", error);
      dispatch({ type: "SET_UNAUTHENTICATED" });
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const isValidSession = await authService.verifySession();

      if (isValidSession && !state.isAuthenticated) {
        const user = await authService.getCurrentUser();
        dispatch({ type: "SET_AUTHENTICATED", payload: { user } });
      } else if (!isValidSession && state.isAuthenticated) {
        dispatch({ type: "SET_UNAUTHENTICATED" });
      }
    } catch (error) {
      console.error("Auth status check error:", error);
    }
  }, [state.isAuthenticated]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // =================== AUTO-REFRESH DE TOKENS ===================
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkTokenRefresh = async () => {
      try {
        const shouldRefresh = await authService.shouldRefreshToken();
        if (shouldRefresh) {
          await refreshSession();
        }
      } catch (error) {
        console.error("Token refresh check error:", error);
      }
    };

    // Verificar cada 5 minutos si el token necesita refresh
    const interval = setInterval(checkTokenRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, refreshSession]);

  // =================== LISTENER DE ESTADO DE LA APP ===================
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // En React Native se podría usar AppState para verificar cuando la app vuelve al foreground
    // Por ahora dejamos esta funcionalidad para implementar más tarde si es necesario

    // const handleAppStateChange = (nextAppState: string) => {
    //   if (nextAppState === 'active' && state.isAuthenticated) {
    //     checkAuthStatus();
    //   }
    // };
    //
    // AppState.addEventListener('change', handleAppStateChange);
    // return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [state.isAuthenticated, checkAuthStatus]);

  // =================== VALOR DEL CONTEXT ===================
  const contextValue: AuthContextValue = {
    // Estado
    ...state,

    // Acciones
    login,
    register,
    logout,
    refreshSession,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// =================== HOOK PERSONALIZADO ===================
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// =================== HOOK PARA REQUERIR AUTENTICACIÓN ===================
export function useRequireAuth(): AuthContextValue {
  const auth = useAuth();

  if (!auth.isInitialized) {
    throw new Error("Auth not initialized");
  }

  if (!auth.isAuthenticated) {
    throw new Error("Authentication required");
  }

  return auth;
}

// =================== HOOK PARA DATOS DEL USUARIO ===================
export function useUser(): UserData | null {
  const { user } = useAuth();
  return user;
}

// Export del provider
export default AuthProvider;
