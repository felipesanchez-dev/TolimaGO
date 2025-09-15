import { theme } from "@/constants/design-tokens";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * TolimaGO - Toggle Component
 * Switch/Toggle profesional con animaciones suaves
 */

export interface ToggleProps {
  // Estado
  value: boolean;
  onValueChange: (value: boolean) => void;

  // Contenido
  label?: string;
  description?: string;

  // Estados
  disabled?: boolean;

  // Estilos
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;

  // Accesibilidad
  testID?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  containerStyle,
  labelStyle,
  testID,
}) => {
  // =================== ANIMACIONES ===================
  const toggleAnimation = useSharedValue(value ? 1 : 0);

  // Actualizar animación cuando cambie el valor
  React.useEffect(() => {
    toggleAnimation.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, toggleAnimation]);

  // =================== HANDLERS ===================
  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  // =================== ESTILOS ANIMADOS ===================
  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleAnimation.value,
      [0, 1],
      [theme.colors.neutral.border, theme.colors.primary.main]
    );

    return {
      backgroundColor: disabled
        ? theme.colors.neutral.disabled
        : backgroundColor,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = toggleAnimation.value * 20; // 20px de recorrido

    return {
      transform: [{ translateX }],
    };
  });

  // =================== PROPS DE ACCESIBILIDAD ===================
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: "switch" as const,
    accessibilityLabel: label,
    accessibilityHint: description,
    accessibilityState: {
      checked: value,
      disabled,
    },
    testID,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Toggle visual */}
      <TouchableOpacity
        style={[styles.touchableArea, disabled && styles.touchableDisabled]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...accessibilityProps}
      >
        <AnimatedView style={[styles.track, trackAnimatedStyle]}>
          <AnimatedView style={[styles.thumb, thumbAnimatedStyle]} />
        </AnimatedView>
      </TouchableOpacity>

      {/* Contenido de texto */}
      {(label || description) && (
        <TouchableOpacity
          style={styles.textContainer}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          {label && (
            <Text
              style={[
                styles.label,
                disabled && styles.labelDisabled,
                labelStyle,
              ]}
            >
              {label}
            </Text>
          )}

          {description && (
            <Text
              style={[
                styles.description,
                disabled && styles.descriptionDisabled,
              ]}
            >
              {description}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// =================== ESTILOS ===================
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: theme.spacing[2],
  },

  touchableArea: {
    padding: theme.spacing[1], // Área táctil más grande
  },

  touchableDisabled: {
    opacity: 0.5,
  },

  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
    ...theme.shadows.sm,
  },

  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.neutral.white,
    ...theme.shadows.md,
  },

  textContainer: {
    flex: 1,
    marginLeft: theme.spacing[3],
    justifyContent: "center",
  },

  label: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1] / 2,
  },

  labelDisabled: {
    color: theme.colors.text.disabled,
  },

  description: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },

  descriptionDisabled: {
    color: theme.colors.text.disabled,
  },
});

export default Toggle;
