import { theme } from "@/constants/design-tokens";
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

/**
 * TolimaGO - FormError Component
 * Componente profesional para mostrar errores de formulario
 */

export interface FormErrorProps {
  // Contenido del error
  errors: string | string[];

  // Tipo de error
  variant?: "error" | "warning" | "info";

  // Estilos
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;

  // Comportamiento
  showIcon?: boolean;
  animated?: boolean;

  // Accesibilidad
  testID?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  errors,
  variant = "error",
  containerStyle,
  textStyle,
  showIcon = true,
  animated = true,
  testID,
}) => {
  // =================== VALIDACIONES ===================
  if (!errors) return null;

  const errorArray = Array.isArray(errors) ? errors : [errors];
  if (errorArray.length === 0 || errorArray.every((error) => !error))
    return null;

  // =================== CONFIGURACIÓN POR VARIANTE ===================
  const getVariantConfig = () => {
    switch (variant) {
      case "warning":
        return {
          color: theme.colors.warning.main,
          backgroundColor: theme.colors.warning.light,
          icon: AlertTriangle,
        };
      case "info":
        return {
          color: theme.colors.info.main,
          backgroundColor: theme.colors.info.light,
          icon: AlertCircle,
        };
      default:
        return {
          color: theme.colors.error.main,
          backgroundColor: theme.colors.error.light,
          icon: XCircle,
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  // =================== COMPONENTES ===================
  const ErrorContent = () => (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        containerStyle,
      ]}
    >
      {/* Ícono */}
      {showIcon && (
        <View style={styles.iconContainer}>
          <IconComponent size={16} color={config.color} />
        </View>
      )}

      {/* Contenido de texto */}
      <View style={styles.textContainer}>
        {errorArray.map((error, index) =>
          error ? (
            <Text
              key={index}
              style={[styles.errorText, { color: config.color }, textStyle]}
            >
              {error}
            </Text>
          ) : null
        )}
      </View>
    </View>
  );

  // =================== PROPS DE ACCESIBILIDAD ===================
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: "alert" as const,
    accessibilityLabel: `Error: ${errorArray.join(", ")}`,
    testID,
  };

  // =================== RENDER CON/SIN ANIMACIONES ===================
  if (animated) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        {...accessibilityProps}
      >
        <ErrorContent />
      </Animated.View>
    );
  }

  return (
    <View {...accessibilityProps}>
      <ErrorContent />
    </View>
  );
};

// =================== ESTILOS ===================
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing[2],
    borderWidth: 1,
    borderColor: "transparent",
  },

  iconContainer: {
    marginRight: theme.spacing[2],
    marginTop: 2, // Alineación visual con la primera línea de texto
  },

  textContainer: {
    flex: 1,
  },

  errorText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing[1],
  },
});

export default FormError;
