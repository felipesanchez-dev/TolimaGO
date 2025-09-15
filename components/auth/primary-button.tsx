import { theme } from "@/constants/design-tokens";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * TolimaGO - PrimaryButton Component
 * Botón principal profesional con estados, loading y animaciones
 */

export interface PrimaryButtonProps
  extends Omit<TouchableOpacityProps, "style"> {
  // Contenido
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Estados
  loading?: boolean;
  disabled?: boolean;

  // Variantes de estilo
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;

  // Estilos personalizados
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;

  // Animaciones
  hapticFeedback?: boolean;
  pressScale?: number;

  // Accesibilidad
  testID?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  // Contenido
  title,
  subtitle,
  leftIcon,
  rightIcon,

  // Estados
  loading = false,
  disabled = false,

  // Variantes
  variant = "primary",
  size = "medium",
  fullWidth = false,

  // Estilos
  containerStyle,
  textStyle,

  // Animaciones
  hapticFeedback = true,
  pressScale = 0.96,

  // Accesibilidad
  testID,

  // Props del TouchableOpacity
  onPress,
  ...otherProps
}) => {
  // =================== ESTADO Y ANIMACIONES ===================
  const scale = useSharedValue(1);
  const isInteractionDisabled = disabled || loading;

  // =================== HANDLERS ===================
  const handlePressIn = () => {
    if (isInteractionDisabled) return;

    scale.value = withTiming(pressScale, {
      duration: theme.animations.duration.fast,
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: theme.animations.duration.fast,
    });
  };

  const handlePress = (event: any) => {
    if (isInteractionDisabled || !onPress) return;
    runOnJS(onPress)(event);
  };

  // =================== ESTILOS DINÁMICOS ===================
  const buttonStyle = [
    styles.button,
    size === "small" && styles.buttonSmall,
    size === "large" && styles.buttonLarge,
    size === "medium" && styles.buttonMedium,
    variant === "primary" && styles.buttonPrimary,
    variant === "secondary" && styles.buttonSecondary,
    variant === "outline" && styles.buttonOutline,
    variant === "ghost" && styles.buttonGhost,
    variant === "danger" && styles.buttonDanger,
    isInteractionDisabled && styles.buttonDisabled,
    fullWidth && styles.buttonFullWidth,
    containerStyle,
  ];

  const textStyleCombined = [
    styles.text,
    size === "small" && styles.textSmall,
    size === "large" && styles.textLarge,
    size === "medium" && styles.textMedium,
    variant === "primary" && styles.textPrimary,
    variant === "secondary" && styles.textSecondary,
    variant === "outline" && styles.textOutline,
    variant === "ghost" && styles.textGhost,
    variant === "danger" && styles.textDanger,
    isInteractionDisabled && styles.textDisabled,
    textStyle,
  ];

  // =================== ESTILOS ANIMADOS ===================
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // =================== PROPS DE ACCESIBILIDAD ===================
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: "button" as const,
    accessibilityLabel: title,
    accessibilityHint: subtitle,
    accessibilityState: {
      disabled: isInteractionDisabled,
      busy: loading,
    },
    testID,
  };

  return (
    <AnimatedTouchable
      style={[buttonStyle, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
      {...accessibilityProps}
      {...otherProps}
    >
      {/* Contenido del botón */}
      <View style={styles.content}>
        {/* Ícono izquierdo */}
        {leftIcon && !loading && (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}

        {/* Loading spinner */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={
                variant === "outline" || variant === "ghost"
                  ? theme.colors.primary.main
                  : theme.colors.neutral.white
              }
            />
          </View>
        )}

        {/* Contenido de texto */}
        <View style={styles.textContainer}>
          <Text
            style={textStyleCombined}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                variant === "outline" || variant === "ghost"
                  ? styles.subtitleSecondary
                  : styles.subtitlePrimary,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Ícono derecho */}
        {rightIcon && !loading && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
    </AnimatedTouchable>
  );
};

// =================== ESTILOS ===================
const styles = StyleSheet.create({
  // Base del botón
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...theme.shadows.sm,
  },

  // Tamaños
  buttonSmall: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    minHeight: 36,
  },

  buttonMedium: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    minHeight: 48,
  },

  buttonLarge: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    minHeight: 56,
  },

  // Variantes de color
  buttonPrimary: {
    backgroundColor: theme.colors.primary.main,
  },

  buttonSecondary: {
    backgroundColor: theme.colors.secondary.main,
  },

  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
  },

  buttonGhost: {
    backgroundColor: "transparent",
  },

  buttonDanger: {
    backgroundColor: theme.colors.error.main,
  },

  // Estados
  buttonDisabled: {
    backgroundColor: theme.colors.neutral.disabled,
    borderColor: theme.colors.neutral.disabled,
    ...theme.shadows.none,
  },

  // Ancho completo
  buttonFullWidth: {
    width: "100%",
  },

  // Contenido
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  leftIconContainer: {
    marginRight: theme.spacing[2],
  },

  rightIconContainer: {
    marginLeft: theme.spacing[2],
  },

  loadingContainer: {
    marginRight: theme.spacing[2],
  },

  // Textos base
  text: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
    textAlign: "center",
    letterSpacing: theme.typography.letterSpacing.wide,
  },

  // Tamaños de texto
  textSmall: {
    fontSize: theme.typography.fontSize.sm,
  },

  textMedium: {
    fontSize: theme.typography.fontSize.base,
  },

  textLarge: {
    fontSize: theme.typography.fontSize.lg,
  },

  // Colores de texto por variante
  textPrimary: {
    color: theme.colors.primary.contrast,
  },

  textSecondary: {
    color: theme.colors.secondary.contrast,
  },

  textOutline: {
    color: theme.colors.primary.main,
  },

  textGhost: {
    color: theme.colors.primary.main,
  },

  textDanger: {
    color: theme.colors.error.contrast,
  },

  textDisabled: {
    color: theme.colors.text.disabled,
  },

  // Subtítulos
  subtitle: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.regular,
    textAlign: "center",
    marginTop: theme.spacing[1] / 2,
    opacity: 0.8,
  },

  subtitlePrimary: {
    color: theme.colors.primary.contrast,
  },

  subtitleSecondary: {
    color: theme.colors.text.secondary,
  },
});

export default PrimaryButton;
