import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

/**
 * TolimaGO - Hook profesional para mutaciones de API
 * Incluye retry automático, manejo de errores avanzado y UX optimizada
 */

export interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  retry?: number | boolean;
  retryDelay?: number | ((attemptIndex: number) => number);
  showErrorAlert?: boolean;
  optimisticUpdate?: (variables: TVariables) => void;
  revertOptimisticUpdate?: () => void;
}

export interface MutationState<TData> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  attemptCount: number;
}

export interface MutationActions<TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<any>;
  reset: () => void;
  cancel: () => void;
}

/**
 * Hook avanzado para mutaciones con retry automático y manejo profesional de errores
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  options: UseMutationOptions<TData, TVariables>
): MutationState<TData> & MutationActions<TVariables> {
  const {
    mutationFn,
    onSuccess,
    onError,
    onSettled,
    retry = 3,
    retryDelay = 1000,
    showErrorAlert = false,
    optimisticUpdate,
    revertOptimisticUpdate,
  } = options;

  const [state, setState] = useState<MutationState<TData>>({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    attemptCount: 0,
  });

  const cancelRef = useRef<boolean>(false);
  const currentVariablesRef = useRef<TVariables | undefined>(undefined);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      attemptCount: 0,
    });
    cancelRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const executeWithRetry = useCallback(
    async (variables: TVariables, currentAttempt = 1): Promise<TData> => {
      if (cancelRef.current) {
        throw new Error('Mutation was cancelled');
      }

      setState(prev => ({
        ...prev,
        attemptCount: currentAttempt,
      }));

      try {
        console.log(`🚀 [Mutation] Attempt ${currentAttempt}/${typeof retry === 'number' ? retry + 1 : 'unlimited'}`);
        
        const result = await mutationFn(variables);
        
        if (cancelRef.current) {
          throw new Error('Mutation was cancelled');
        }

        return result;
      } catch (error) {
        const shouldRetry = typeof retry === 'boolean' ? retry : currentAttempt <= retry;
        
        if (shouldRetry && !cancelRef.current) {
          const delay = typeof retryDelay === 'function' 
            ? retryDelay(currentAttempt - 1) 
            : retryDelay;

          console.log(`⏳ [Mutation] Retrying in ${delay}ms (attempt ${currentAttempt + 1})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry(variables, currentAttempt + 1);
        }

        throw error;
      }
    },
    [mutationFn, retry, retryDelay]
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<void> => {
      if (state.isLoading) {
        console.warn('[Mutation] Already in progress, ignoring new mutation');
        return;
      }

      currentVariablesRef.current = variables;
      cancelRef.current = false;

      setState(prev => ({
        ...prev,
        isLoading: true,
        isError: false,
        isSuccess: false,
        isIdle: false,
        error: null,
      }));

      // Aplicar actualización optimista si está configurada
      if (optimisticUpdate) {
        try {
          optimisticUpdate(variables);
        } catch (optimisticError) {
          console.warn('[Mutation] Optimistic update failed:', optimisticError);
        }
      }

      try {
        const data = await executeWithRetry(variables);

        if (!cancelRef.current) {
          setState(prev => ({
            ...prev,
            data,
            isLoading: false,
            isSuccess: true,
            error: null,
          }));

          // Ejecutar callback de éxito
          if (onSuccess) {
            try {
              await onSuccess(data, variables);
            } catch (successError) {
              console.error('[Mutation] onSuccess callback failed:', successError);
            }
          }
        }
      } catch (error) {
        const finalError = error as Error;

        if (!cancelRef.current) {
          setState(prev => ({
            ...prev,
            error: finalError,
            isLoading: false,
            isError: true,
          }));

          // Revertir actualización optimista
          if (revertOptimisticUpdate) {
            try {
              revertOptimisticUpdate();
            } catch (revertError) {
              console.warn('[Mutation] Revert optimistic update failed:', revertError);
            }
          }

          // Mostrar alerta de error si está habilitada
          if (showErrorAlert) {
            Alert.alert(
              'Error',
              finalError.message || 'Ha ocurrido un error inesperado',
              [{ text: 'OK' }]
            );
          }

          // Ejecutar callback de error
          if (onError) {
            try {
              onError(finalError, variables);
            } catch (errorCallbackError) {
              console.error('[Mutation] onError callback failed:', errorCallbackError);
            }
          }
        }
      } finally {
        if (!cancelRef.current && onSettled) {
          const currentState = state;
          try {
            onSettled(
              currentState.data,
              currentState.error,
              variables
            );
          } catch (settledError) {
            console.error('[Mutation] onSettled callback failed:', settledError);
          }
        }
      }
    },
    [executeWithRetry, optimisticUpdate, revertOptimisticUpdate, onSuccess, onError, onSettled, showErrorAlert, state]
  );

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      return new Promise((resolve, reject) => {
        currentVariablesRef.current = variables;
        mutate(variables).then(() => {
          if (state.isError && state.error) {
            reject(state.error);
          } else if (state.data) {
            resolve(state.data);
          }
        });
      });
    },
    [mutate, state.isError, state.error, state.data]
  );

  return {
    // Estado
    ...state,
    
    // Acciones
    mutate,
    mutateAsync,
    reset,
    cancel,
  };
}

/**
 * Hook especializado para formularios de autenticación
 */
export function useAuthMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TVariables>, 'mutationFn'>
) {
  return useApiMutation({
    mutationFn,
    retry: 2, // Reintentar automáticamente hasta 2 veces
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000), // Backoff exponencial
    showErrorAlert: false, // Los formularios manejan sus propios errores
    ...options,
  });
}

/**
 * Hook para operaciones críticas que requieren confirmación
 */
export function useCriticalMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TVariables>, 'mutationFn'>
) {
  return useApiMutation({
    mutationFn,
    retry: false, // No reintentar operaciones críticas automáticamente
    showErrorAlert: true, // Mostrar errores críticos al usuario
    ...options,
  });
}