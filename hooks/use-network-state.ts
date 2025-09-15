import { useCallback, useEffect, useRef, useState } from "react";

const NetInfo = {
  fetch: async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  }),
  addEventListener: (callback: (state: any) => void) => {
    return () => {};
  },
};

interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * TolimaGO - Hook profesional para manejo del estado de red
 * Incluye detección de conectividad, retry inteligente y recuperación automática
 */

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isWifi: boolean;
  isCellular: boolean;
  isOnline: boolean;
  hasStrongSignal: boolean;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
}

export interface NetworkActions {
  checkConnectivity: () => Promise<boolean>;
  forceReconnect: () => Promise<void>;
  resetReconnectAttempts: () => void;
  testEndpoint: (url?: string) => Promise<boolean>;
}

export interface UseNetworkStateOptions {
  enableAutoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  testEndpoint?: string;
  onConnectionRestored?: () => void;
  onConnectionLost?: () => void;
  onReconnectFailed?: (attempts: number) => void;
  enableSignalStrength?: boolean;
}

/**
 * Hook para monitorear el estado de la red con funciones avanzadas
 */
export function useNetworkState(options: UseNetworkStateOptions = {}) {
  const {
    enableAutoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    testEndpoint: testEndpointUrl = "https://www.google.com",
    onConnectionRestored,
    onConnectionLost,
    onReconnectFailed,
    enableSignalStrength = true,
  } = options;

  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    isInternetReachable: null,
    connectionType: null,
    isWifi: false,
    isCellular: false,
    isOnline: false,
    hasStrongSignal: false,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    reconnectAttempts: 0,
    isReconnecting: false,
  });

  const reconnectTimeoutRef = useRef<any>(null);
  const previousOnlineState = useRef<boolean>(false);
  const signalCheckInterval = useRef<any>(null);

  // Función para probar conectividad a un endpoint específico
  const testEndpointFn = useCallback(
    async (url?: string): Promise<boolean> => {
      const testUrl = url || testEndpointUrl || "https://www.google.com";

      try {
        console.log(`🌐 [Network] Testing connectivity to ${testUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(testUrl, {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-cache",
        });

        clearTimeout(timeoutId);

        const isReachable = response.ok;
        console.log(`🌐 [Network] Connectivity test result: ${isReachable}`);

        return isReachable;
      } catch (error) {
        console.log(`🌐 [Network] Connectivity test failed:`, error);
        return false;
      }
    },
    [testEndpointUrl]
  );

  // Función para verificar la fuerza de la señal
  const checkSignalStrength = useCallback(async (): Promise<boolean> => {
    if (!enableSignalStrength) return true;

    try {
      // En una implementación real, esto podría usar APIs nativas para verificar la señal
      // Por ahora, simulamos basado en el tiempo de respuesta a un ping
      const startTime = Date.now();
      const isReachable = await testEndpointFn();
      const responseTime = Date.now() - startTime;

      // Consideramos señal fuerte si la respuesta es < 1000ms
      const hasStrongSignal = isReachable && responseTime < 1000;

      console.log(
        `📶 [Network] Signal strength check: ${hasStrongSignal} (${responseTime}ms)`
      );
      return hasStrongSignal;
    } catch {
      return false;
    }
  }, [enableSignalStrength, testEndpointFn]);

  // Función para verificar conectividad completa
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const netInfo = await NetInfo.fetch();
      const hasInternet = await testEndpointFn();
      const hasStrongSignal = await checkSignalStrength();

      const isFullyOnline = netInfo.isConnected && hasInternet;

      console.log(`🌐 [Network] Full connectivity check:`, {
        deviceConnected: netInfo.isConnected,
        internetReachable: hasInternet,
        strongSignal: hasStrongSignal,
        fullyOnline: isFullyOnline,
      });

      return isFullyOnline;
    } catch (error) {
      console.error("🌐 [Network] Connectivity check failed:", error);
      return false;
    }
  }, [testEndpointFn, checkSignalStrength]);

  // Función para intentar reconectarse
  const forceReconnect = useCallback(async (): Promise<void> => {
    if (networkState.isReconnecting) {
      console.log("🌐 [Network] Reconnect already in progress");
      return;
    }

    setNetworkState((prev) => ({
      ...prev,
      isReconnecting: true,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));

    try {
      console.log(
        `🌐 [Network] Attempting reconnect (attempt ${
          networkState.reconnectAttempts + 1
        }/${maxReconnectAttempts})`
      );

      // Esperar un momento antes de probar
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isOnline = await checkConnectivity();

      if (isOnline) {
        console.log("🌐 [Network] Reconnect successful!");

        setNetworkState((prev) => ({
          ...prev,
          isOnline: true,
          isReconnecting: false,
          reconnectAttempts: 0,
          lastConnectedAt: new Date(),
        }));

        if (onConnectionRestored) {
          onConnectionRestored();
        }
      } else {
        throw new Error("Still offline after reconnect attempt");
      }
    } catch (error) {
      console.log(`🌐 [Network] Reconnect attempt failed:`, error);

      setNetworkState((prev) => ({
        ...prev,
        isReconnecting: false,
      }));

      // Programar siguiente intento si no hemos excedido el máximo
      if (
        networkState.reconnectAttempts + 1 < maxReconnectAttempts &&
        enableAutoReconnect
      ) {
        console.log(
          `🌐 [Network] Scheduling next reconnect in ${reconnectInterval}ms`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          forceReconnect();
        }, reconnectInterval);
      } else {
        console.log("🌐 [Network] Max reconnect attempts reached");

        if (onReconnectFailed) {
          onReconnectFailed(networkState.reconnectAttempts + 1);
        }
      }
    }
  }, [
    networkState.isReconnecting,
    networkState.reconnectAttempts,
    maxReconnectAttempts,
    enableAutoReconnect,
    reconnectInterval,
    checkConnectivity,
    onConnectionRestored,
    onReconnectFailed,
  ]);

  // Función para resetear los intentos de reconexión
  const resetReconnectAttempts = useCallback(() => {
    setNetworkState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
      isReconnecting: false,
    }));

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Manejar cambios en el estado de red
  const handleNetworkStateChange = useCallback(
    async (state: NetInfoState) => {
      console.log("🌐 [Network] Network state changed:", state);

      const isConnected = Boolean(state.isConnected);
      const isInternetReachable = state.isInternetReachable;
      const connectionType = state.type;
      const isWifi = connectionType === "wifi";
      const isCellular = connectionType === "cellular";

      // Verificar conectividad completa si el dispositivo dice que está conectado
      let isOnline = false;
      let hasStrongSignal = false;

      if (isConnected && isInternetReachable !== false) {
        isOnline = await checkConnectivity();
        hasStrongSignal = await checkSignalStrength();
      }

      const now = new Date();

      setNetworkState((prev) => ({
        ...prev,
        isConnected,
        isInternetReachable,
        connectionType,
        isWifi,
        isCellular,
        isOnline,
        hasStrongSignal,
        lastConnectedAt:
          isOnline && !prev.isOnline ? now : prev.lastConnectedAt,
        lastDisconnectedAt:
          !isOnline && prev.isOnline ? now : prev.lastDisconnectedAt,
      }));

      // Detectar cambios en conectividad
      const wasOnline = previousOnlineState.current;
      const isNowOnline = isOnline;

      if (wasOnline !== isNowOnline) {
        if (isNowOnline) {
          console.log("🌐 [Network] Connection restored");
          resetReconnectAttempts();
          if (onConnectionRestored) {
            onConnectionRestored();
          }
        } else {
          console.log("🌐 [Network] Connection lost");
          if (onConnectionLost) {
            onConnectionLost();
          }

          // Iniciar proceso de reconexión automática
          if (enableAutoReconnect) {
            setTimeout(() => {
              forceReconnect();
            }, reconnectInterval);
          }
        }

        previousOnlineState.current = isNowOnline;
      }
    },
    [
      checkConnectivity,
      checkSignalStrength,
      resetReconnectAttempts,
      onConnectionRestored,
      onConnectionLost,
      enableAutoReconnect,
      forceReconnect,
      reconnectInterval,
    ]
  );

  // Configurar listeners y verificación periódica
  useEffect(() => {
    console.log("🌐 [Network] Setting up network monitoring");

    // Suscribirse a cambios de estado de red
    const unsubscribe = NetInfo.addEventListener(handleNetworkStateChange);

    // Verificación inicial
    NetInfo.fetch().then(handleNetworkStateChange);

    // Verificación periódica de la señal (cada 30 segundos)
    if (enableSignalStrength) {
      signalCheckInterval.current = setInterval(async () => {
        if (networkState.isConnected) {
          const hasStrongSignal = await checkSignalStrength();
          setNetworkState((prev) => ({
            ...prev,
            hasStrongSignal,
          }));
        }
      }, 30000);
    }

    return () => {
      console.log("🌐 [Network] Cleaning up network monitoring");
      unsubscribe();

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (signalCheckInterval.current) {
        clearInterval(signalCheckInterval.current);
      }
    };
  }, [
    handleNetworkStateChange,
    enableSignalStrength,
    checkSignalStrength,
    networkState.isConnected,
  ]);

  return {
    // Estado
    ...networkState,

    // Acciones
    checkConnectivity,
    forceReconnect,
    resetReconnectAttempts,
    testEndpoint: testEndpointFn,
  };
}

/**
 * Hook simplificado para verificaciones básicas de conectividad
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(Boolean(state.isConnected));
    });

    // Verificación inicial
    NetInfo.fetch().then((state) => {
      setIsConnected(Boolean(state.isConnected));
    });

    return unsubscribe;
  }, []);

  return { isConnected };
}

/**
 * Hook para ejecutar acciones cuando se restaure la conectividad
 */
export function useConnectionRecovery(callback: () => void | Promise<void>) {
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isConnected = Boolean(
        state.isConnected && state.isInternetReachable
      );

      if (isConnected && wasOffline) {
        console.log(
          "🌐 [Recovery] Connection restored, executing recovery callback"
        );
        try {
          await callback();
        } catch (error) {
          console.error("🌐 [Recovery] Recovery callback failed:", error);
        }
        setWasOffline(false);
      } else if (!isConnected && !wasOffline) {
        console.log("🌐 [Recovery] Connection lost, marking as offline");
        setWasOffline(true);
      }
    });

    return unsubscribe;
  }, [callback, wasOffline]);
}
