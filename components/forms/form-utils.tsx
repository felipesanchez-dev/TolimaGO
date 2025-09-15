import React from "react";
import { View, ViewStyle } from "react-native";

interface FormWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Wrapper para formularios que evita problemas con eventos sintéticos
 * y mejora el rendimiento en React Native
 */
export function FormWrapper({ children, style, testID }: FormWrapperProps) {
  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
}

/**
 * Hook personalizado para manejar el submit de formularios
 * de manera más segura evitando problemas con eventos sintéticos
 */
export function useFormSubmit<T>(
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    onError?: (error: Error) => void;
    onSuccess?: () => void;
  }
) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (data: T) => {
      if (isSubmitting) return; // Evitar doble submit

      try {
        setIsSubmitting(true);
        await onSubmit(data);
        options?.onSuccess?.();
      } catch (error) {
        console.error("Form submission error:", error);
        options?.onError?.(error as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, isSubmitting, options]
  );

  return {
    handleSubmit,
    isSubmitting,
  };
}
