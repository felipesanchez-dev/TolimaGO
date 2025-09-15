import { theme } from "@/constants/design-tokens";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * TolimaGO - TextInputField Component
 * Campo de entrada profesional con validaciones, animaciones y accesibilidad
 */

export interface TextInputFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  helperText?: string;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;

  disabled?: boolean;
  required?: boolean;
  loading?: boolean;

  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;

  animatedBorder?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;

  testID?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TextInputField = forwardRef<TextInput, TextInputFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      helperText,

      leftIcon,
      rightIcon,

      secureTextEntry = false,
      showPasswordToggle = false,

      disabled = false,
      required = false,
      loading = false,

      containerStyle,
      inputStyle,
      labelStyle,

      animatedBorder = true,
      showCharacterCount = false,
      maxLength,

      testID,

      placeholder,
      keyboardType,
      autoCapitalize,
      autoComplete,
      autoCorrect = false,
      onFocus,
      onBlur,
      ...otherProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const focusAnimation = useSharedValue(0);
    const labelAnimation = useSharedValue(value ? 1 : 0);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      focusAnimation.value = withTiming(1, {
        duration: theme.animations.duration.normal,
      });
      labelAnimation.value = withTiming(1, {
        duration: theme.animations.duration.normal,
      });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      focusAnimation.value = withTiming(0, {
        duration: theme.animations.duration.normal,
      });

      if (!value) {
        labelAnimation.value = withTiming(0, {
          duration: theme.animations.duration.normal,
        });
      }

      onBlur?.(e);
    };

    const handleTextChange = (text: string) => {
      if (maxLength && text.length > maxLength) return;
      onChangeText(text);

      if (text && labelAnimation.value === 0) {
        labelAnimation.value = withTiming(1, {
          duration: theme.animations.duration.fast,
        });
      } else if (!text && labelAnimation.value === 1 && !isFocused) {
        labelAnimation.value = withTiming(0, {
          duration: theme.animations.duration.fast,
        });
      }
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const animatedBorderStyle = useAnimatedStyle(() => {
      if (!animatedBorder) return {};

      const borderColor = error
        ? theme.colors.error.main
        : interpolateColor(
            focusAnimation.value,
            [0, 1],
            [theme.colors.neutral.border, theme.colors.primary.main]
          );

      const borderWidth = withTiming(focusAnimation.value === 1 ? 2 : 1, {
        duration: theme.animations.duration.fast,
      });

      return {
        borderColor,
        borderWidth,
      };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
      const translateY = withTiming(labelAnimation.value === 1 ? -28 : 0, {
        duration: theme.animations.duration.normal,
      });

      const scale = withTiming(labelAnimation.value === 1 ? 0.85 : 1, {
        duration: theme.animations.duration.normal,
      });

      const color = error
        ? theme.colors.error.main
        : isFocused
        ? theme.colors.primary.main
        : theme.colors.text.secondary;

      return {
        transform: [{ translateY }, { scale }],
        color,
      };
    });

    const isSecure = secureTextEntry && !isPasswordVisible;
    const hasError = Boolean(error);
    const characterCount = value.length;
    const showRightIcon = rightIcon || (secureTextEntry && showPasswordToggle);

    const accessibilityProps = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: helperText || placeholder,
      accessibilityState: {
        disabled,
        invalid: hasError,
      },
      testID,
    };

    return (
      <View style={[styles.container, containerStyle]}>
        <AnimatedView style={[styles.inputContainer, animatedBorderStyle]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <View style={styles.inputWrapper}>
            <TextInput
              ref={ref}
              style={[
                styles.textInput,
                leftIcon && styles.textInputWithLeftIcon,
                showRightIcon && styles.textInputWithRightIcon,
                hasError && styles.textInputError,
                disabled && styles.textInputDisabled,
                inputStyle,
              ]}
              value={value}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              secureTextEntry={isSecure}
              placeholder={
                isFocused || labelAnimation.value === 1
                  ? placeholder
                  : undefined
              }
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              editable={!disabled && !loading}
              maxLength={maxLength}
              {...accessibilityProps}
              {...otherProps}
            />

            <Animated.Text
              style={[
                styles.label,
                required && styles.labelRequired,
                labelStyle,
                animatedLabelStyle,
              ]}
              pointerEvents="none"
            >
              {label}
              {required && " *"}
            </Animated.Text>
          </View>

          {showRightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={
                secureTextEntry && showPasswordToggle
                  ? togglePasswordVisibility
                  : undefined
              }
              disabled={disabled || !secureTextEntry || !showPasswordToggle}
              accessibilityRole="button"
              accessibilityLabel={
                secureTextEntry && showPasswordToggle
                  ? isPasswordVisible
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                  : undefined
              }
            >
              {secureTextEntry && showPasswordToggle ? (
                isPasswordVisible ? (
                  <EyeOff size={20} color={theme.colors.text.secondary} />
                ) : (
                  <Eye size={20} color={theme.colors.text.secondary} />
                )
              ) : (
                rightIcon
              )}
            </TouchableOpacity>
          )}
        </AnimatedView>

        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            {hasError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color={theme.colors.error.main} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!hasError && helperText && (
              <Text style={styles.helperText}>{helperText}</Text>
            )}
          </View>

          {showCharacterCount && maxLength && (
            <Text
              style={[
                styles.characterCount,
                characterCount === maxLength && styles.characterCountMax,
              ]}
            >
              {characterCount}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

TextInputField.displayName = "TextInputField";

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.neutral.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral.surface,
    minHeight: 56,
    paddingHorizontal: theme.spacing[4],
  },

  leftIconContainer: {
    marginRight: theme.spacing[3],
    justifyContent: "center",
    alignItems: "center",
  },

  rightIconContainer: {
    marginLeft: theme.spacing[3],
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[1],
  },

  inputWrapper: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },

  textInput: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 24,
  },

  textInputWithLeftIcon: {
    // Ya manejado por el container
  },

  textInputWithRightIcon: {
    // Ya manejado por el container
  },

  textInputError: {
    // El color del borde se maneja en la animación
  },

  textInputDisabled: {
    color: theme.colors.text.disabled,
    backgroundColor: theme.colors.neutral.disabled,
  },

  label: {
    position: "absolute",
    left: 10,
    top: 15,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.neutral.surface,
    paddingHorizontal: theme.spacing[1],
  },

  labelRequired: {
    // El asterisco se agrega en el texto
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: theme.spacing[1],
    minHeight: 20,
  },

  footerLeft: {
    flex: 1,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  errorText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    marginLeft: theme.spacing[1],
    flex: 1,
  },

  helperText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },

  characterCount: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },

  characterCountMax: {
    color: theme.colors.error.main,
  },
});

export default TextInputField;
