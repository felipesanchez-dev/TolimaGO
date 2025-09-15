import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiMutation } from './use-api-mutation';

/**
 * TolimaGO - Hook profesional para autenticación
 * Incluye persistencia, refresh automático, y manejo avanzado de sesiones
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  role: string;
  preferences?: {
    notifications: boolean;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isRefreshing: boolean;
  sessionExpired: boolean;
  lastActivity: Date | null;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: Date | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  resendVerification: (type: 'email' | 'phone') => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  clearSession: () => void;
  updateActivity: () => void;
  unlock: (password: string) => Promise<void>;
}

export interface UseAuthOptions {
  enableAutoRefresh?: boolean;
  refreshThreshold?: number; // Minutos antes del vencimiento para refrescar
  maxLoginAttempts?: number;
  lockDuration?: number; // Minutos de bloqueo
  sessionTimeout?: number; // Minutos de inactividad antes de logout
  enableBiometrics?: boolean;
  persistSession?: boolean;
}

// Constantes para AsyncStorage
const STORAGE_KEYS = {
  USER: '@tolimago/user',
  TOKENS: '@tolimago/tokens',
  LOGIN_ATTEMPTS: '@tolimago/login_attempts',
  LOCK_UNTIL: '@tolimago/lock_until',
  LAST_ACTIVITY: '@tolimago/last_activity',
} as const;

/**
 * Hook principal para manejo de autenticación
 */
export function useAuth(options: UseAuthOptions = {}) {
  const {
    enableAutoRefresh = true,
    refreshThreshold = 5, // 5 minutos
    maxLoginAttempts = 5,
    lockDuration = 30, // 30 minutos
    sessionTimeout = 60, // 60 minutos
    persistSession = true,
  } = options;

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true,
    isRefreshing: false,
    sessionExpired: false,
    lastActivity: null,
    loginAttempts: 0,
    isLocked: false,
    lockUntil: null,
  });

  const refreshTimeoutRef = useRef<any>(null);
  const sessionTimeoutRef = useRef<any>(null);
  const activityCheckInterval = useRef<any>(null);

  // Configurar mutaciones
  const loginMutation = useApiMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('http://192.168.1.8:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }
      
      return response.json();
      
    },
    retry: 1,
    onError: () => {
      incrementLoginAttempts();
    },
  });

  const registerMutation = useApiMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('http://192.168.1.8:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }
      
      return response.json();
    },
    retry: 1,
  });

  const refreshMutation = useApiMutation({
    mutationFn: async () => {
      if (!authState.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://192.168.1.8:3000/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.tokens.refreshToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }
      
      return response.json();
    },
    retry: 1,
  });

  // Funciones de utilidad para AsyncStorage
  const saveToStorage = async (key: string, value: any) => {
    if (!persistSession) return;
    
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`📱 [Auth] Failed to save ${key}:`, error);
    }
  };

  const loadFromStorage = async (key: string) => {
    if (!persistSession) return null;
    
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`📱 [Auth] Failed to load ${key}:`, error);
      return null;
    }
  };

  const removeFromStorage = async (key: string) => {
    if (!persistSession) return;
    
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`📱 [Auth] Failed to remove ${key}:`, error);
    }
  };

  // Incrementar intentos de login
  const incrementLoginAttempts = useCallback(async () => {
    const newAttempts = authState.loginAttempts + 1;
    
    setAuthState(prev => ({
      ...prev,
      loginAttempts: newAttempts,
    }));

    await saveToStorage(STORAGE_KEYS.LOGIN_ATTEMPTS, newAttempts);

    // Bloquear si se exceden los intentos
    if (newAttempts >= maxLoginAttempts) {
      const lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
      
      setAuthState(prev => ({
        ...prev,
        isLocked: true,
        lockUntil,
      }));

      await saveToStorage(STORAGE_KEYS.LOCK_UNTIL, lockUntil.toISOString());
      
      console.log(`🔒 [Auth] Account locked until ${lockUntil.toISOString()}`);
    }
  }, [authState.loginAttempts, maxLoginAttempts, lockDuration]);

  // Actualizar actividad del usuario
  const updateActivity = useCallback(async () => {
    const now = new Date();
    
    setAuthState(prev => ({
      ...prev,
      lastActivity: now,
    }));

    await saveToStorage(STORAGE_KEYS.LAST_ACTIVITY, now.toISOString());

    // Resetear timeout de sesión
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      console.log('⏰ [Auth] Session timeout, logging out');
      logout();
    }, sessionTimeout * 60 * 1000);
  }, [sessionTimeout]);

  // Verificar si el token necesita refresh
  const shouldRefreshToken = useCallback(() => {
    if (!authState.tokens) return false;
    
    const now = Date.now();
    const threshold = refreshThreshold * 60 * 1000; // Convertir a ms
    
    return (authState.tokens.expiresAt - now) < threshold;
  }, [authState.tokens, refreshThreshold]);

  // Programar refresh automático
  const scheduleTokenRefresh = useCallback(() => {
    if (!enableAutoRefresh || !authState.tokens) return;

    // Limpiar timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const timeUntilRefresh = Math.max(
      authState.tokens.expiresAt - now - (refreshThreshold * 60 * 1000),
      60000 // Mínimo 1 minuto
    );

    refreshTimeoutRef.current = setTimeout(() => {
      console.log('🔄 [Auth] Auto-refreshing token');
      refreshToken();
    }, timeUntilRefresh);

    console.log(`🔄 [Auth] Token refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);
  }, [enableAutoRefresh, authState.tokens, refreshThreshold]);

  // Funciones principales
  const login = useCallback(async (credentials: LoginCredentials) => {
    // Verificar si está bloqueado
    if (authState.isLocked && authState.lockUntil) {
      const now = new Date();
      if (now < authState.lockUntil) {
        const remainingMinutes = Math.ceil((authState.lockUntil.getTime() - now.getTime()) / 60000);
        throw new Error(`Cuenta bloqueada. Intenta en ${remainingMinutes} minutos.`);
      } else {
        // Desbloquear automáticamente
        setAuthState(prev => ({
          ...prev,
          isLocked: false,
          lockUntil: null,
          loginAttempts: 0,
        }));
        await removeFromStorage(STORAGE_KEYS.LOCK_UNTIL);
        await removeFromStorage(STORAGE_KEYS.LOGIN_ATTEMPTS);
      }
    }

    console.log('🔐 [Auth] Attempting login for:', credentials.email);

    await loginMutation.mutate(credentials);
    
    if (loginMutation.data) {
      const { user, tokens } = loginMutation.data;
      
      // Resetear intentos de login en caso de éxito
      setAuthState(prev => ({
        ...prev,
        user,
        tokens,
        isAuthenticated: true,
        sessionExpired: false,
        loginAttempts: 0,
        isLocked: false,
        lockUntil: null,
      }));

      // Guardar en storage
      await saveToStorage(STORAGE_KEYS.USER, user);
      await saveToStorage(STORAGE_KEYS.TOKENS, tokens);
      await removeFromStorage(STORAGE_KEYS.LOGIN_ATTEMPTS);
      await removeFromStorage(STORAGE_KEYS.LOCK_UNTIL);

      // Actualizar actividad
      await updateActivity();

      // Programar refresh
      scheduleTokenRefresh();

      console.log('✅ [Auth] Login successful');
    }
  }, [authState.isLocked, authState.lockUntil, loginMutation, updateActivity, scheduleTokenRefresh]);

  const register = useCallback(async (data: RegisterData) => {
    console.log('📝 [Auth] Attempting registration for:', data.email);

    await registerMutation.mutate(data);
    
    if (registerMutation.data) {
      const { user, tokens } = registerMutation.data;
      
      setAuthState(prev => ({
        ...prev,
        user,
        tokens,
        isAuthenticated: true,
        sessionExpired: false,
      }));

      // Guardar en storage
      await saveToStorage(STORAGE_KEYS.USER, user);
      await saveToStorage(STORAGE_KEYS.TOKENS, tokens);

      // Actualizar actividad
      await updateActivity();

      // Programar refresh
      scheduleTokenRefresh();

      console.log('✅ [Auth] Registration successful');
    }
  }, [registerMutation, updateActivity, scheduleTokenRefresh]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (authState.isRefreshing) {
      console.log('🔄 [Auth] Refresh already in progress');
      return false;
    }

    setAuthState(prev => ({ ...prev, isRefreshing: true }));

    try {
      await refreshMutation.mutate(undefined);
      
      if (refreshMutation.data) {
        const { tokens } = refreshMutation.data;
        
        setAuthState(prev => ({
          ...prev,
          tokens,
          isRefreshing: false,
          sessionExpired: false,
        }));

        await saveToStorage(STORAGE_KEYS.TOKENS, tokens);

        // Reprogramar próximo refresh
        scheduleTokenRefresh();

        console.log('✅ [Auth] Token refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [Auth] Token refresh failed:', error);
      
      setAuthState(prev => ({
        ...prev,
        isRefreshing: false,
        sessionExpired: true,
      }));

      // Limpiar sesión expirada
      await clearSession();
      return false;
    }
  }, [authState.isRefreshing, refreshMutation, scheduleTokenRefresh]);

  const logout = useCallback(async () => {
    console.log('👋 [Auth] Logging out');
    
    // Limpiar timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Intentar notificar al servidor (opcional)
    try {
      if (authState.tokens?.accessToken) {
        await fetch('http://192.168.1.8:3000/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.tokens.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.log('🔔 [Auth] Server logout notification failed:', error);
    }

    // Limpiar estado y storage
    await clearSession();
    
    console.log('✅ [Auth] Logout complete');
  }, [authState.tokens]);

  const clearSession = useCallback(async () => {
    setAuthState(prev => ({
      ...prev,
      user: null,
      tokens: null,
      isAuthenticated: false,
      sessionExpired: false,
    }));

    // Limpiar storage
    await removeFromStorage(STORAGE_KEYS.USER);
    await removeFromStorage(STORAGE_KEYS.TOKENS);
    await removeFromStorage(STORAGE_KEYS.LAST_ACTIVITY);
  }, []);

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    if (!authState.isAuthenticated || !authState.tokens) {
      return false;
    }

    // Verificar expiración
    const now = Date.now();
    if (now >= authState.tokens.expiresAt) {
      console.log('⏰ [Auth] Token expired, attempting refresh');
      return await refreshToken();
    }

    // Verificar si necesita refresh
    if (shouldRefreshToken()) {
      console.log('🔄 [Auth] Token needs refresh');
      return await refreshToken();
    }

    return true;
  }, [authState.isAuthenticated, authState.tokens, refreshToken, shouldRefreshToken]);

  // Otras funciones (updateProfile, changePassword, etc.)
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    // Implementación pendiente
    console.log('👤 [Auth] Update profile:', updates);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // Implementación pendiente
    console.log('🔑 [Auth] Change password');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Implementación pendiente
    console.log('📧 [Auth] Reset password for:', email);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    // Implementación pendiente
    console.log('✅ [Auth] Verify email with token:', token);
  }, []);

  const verifyPhone = useCallback(async (code: string) => {
    // Implementación pendiente
    console.log('📱 [Auth] Verify phone with code:', code);
  }, []);

  const resendVerification = useCallback(async (type: 'email' | 'phone') => {
    // Implementación pendiente
    console.log('🔄 [Auth] Resend verification:', type);
  }, []);

  const unlock = useCallback(async (password: string) => {
    // Implementación pendiente
    console.log('🔓 [Auth] Unlock account');
  }, []);

  // Inicialización
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 [Auth] Initializing authentication');
      
      try {
        // Cargar datos del storage
        const [savedUser, savedTokens, savedAttempts, savedLockUntil, savedActivity] = await Promise.all([
          loadFromStorage(STORAGE_KEYS.USER),
          loadFromStorage(STORAGE_KEYS.TOKENS),
          loadFromStorage(STORAGE_KEYS.LOGIN_ATTEMPTS),
          loadFromStorage(STORAGE_KEYS.LOCK_UNTIL),
          loadFromStorage(STORAGE_KEYS.LAST_ACTIVITY),
        ]);

        // Verificar bloqueo
        let isLocked = false;
        let lockUntil = null;
        if (savedLockUntil) {
          lockUntil = new Date(savedLockUntil);
          isLocked = new Date() < lockUntil;
        }

        setAuthState(prev => ({
          ...prev,
          user: savedUser,
          tokens: savedTokens,
          isAuthenticated: Boolean(savedUser && savedTokens),
          loginAttempts: savedAttempts || 0,
          isLocked,
          lockUntil,
          lastActivity: savedActivity ? new Date(savedActivity) : null,
          isInitializing: false,
        }));

        // Si hay sesión guardada, verificar validez
        if (savedUser && savedTokens) {
          console.log('📱 [Auth] Found saved session, verifying...');
          
          const isValid = await checkAuthStatus();
          if (!isValid) {
            console.log('❌ [Auth] Saved session is invalid');
            await clearSession();
          } else {
            console.log('✅ [Auth] Session restored successfully');
            // Iniciar actividad y programar refresh
            await updateActivity();
            scheduleTokenRefresh();
          }
        }
      } catch (error) {
        console.error('❌ [Auth] Initialization failed:', error);
        setAuthState(prev => ({ ...prev, isInitializing: false }));
      }
    };

    initializeAuth();
  }, [checkAuthStatus, clearSession, updateActivity, scheduleTokenRefresh]);

  // Verificación periódica de actividad
  useEffect(() => {
    if (authState.isAuthenticated && sessionTimeout > 0) {
      activityCheckInterval.current = setInterval(async () => {
        if (authState.lastActivity) {
          const inactiveMinutes = (Date.now() - authState.lastActivity.getTime()) / 60000;
          
          if (inactiveMinutes >= sessionTimeout) {
            console.log('⏰ [Auth] Session timeout due to inactivity');
            await logout();
          }
        }
      }, 60000); // Verificar cada minuto
    }

    return () => {
      if (activityCheckInterval.current) {
        clearInterval(activityCheckInterval.current);
      }
    };
  }, [authState.isAuthenticated, authState.lastActivity, sessionTimeout, logout]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (activityCheckInterval.current) {
        clearInterval(activityCheckInterval.current);
      }
    };
  }, []);

  return {
    // Estado
    ...authState,
    
    // Estados de mutación
    isLoggingIn: loginMutation.isLoading,
    isRegistering: registerMutation.isLoading,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    
    // Acciones
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    resetPassword,
    verifyEmail,
    verifyPhone,
    resendVerification,
    checkAuthStatus,
    clearSession,
    updateActivity,
    unlock,
  };
}