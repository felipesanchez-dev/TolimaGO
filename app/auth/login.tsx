import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AuthHeader,
  FormError,
  PrimaryButton,
  TextInputField,
} from "@/components/auth";
import { theme } from "@/constants/design-tokens";
import { globalStyles } from "@/constants/global-styles";
import { useAuth } from "@/context/auth-context";
import { LoginFormData, loginSchema } from "@/lib/validations";

/**
 * TolimaGO - Login Screen
 * Pantalla de inicio de sesión profesional con validaciones y animaciones
 */

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { login, error: authError, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        clearError();

        await login({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });

        router.replace("/(tabs)");
      } catch (error: any) {
        console.error("Login error:", error);
        console.error("Login error details:", JSON.stringify(error, null, 2));

        let errorMessage = "Error al iniciar sesión. Intenta nuevamente.";

        if (error.code === "ERR_NETWORK") {
          errorMessage =
            "No se puede conectar al servidor. Verifica que el backend esté funcionando en http://localhost:3000";
        } else if (error.message?.includes("credentials")) {
          errorMessage = "Email o contraseña incorrectos";
        } else if (error.message?.includes("network")) {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else if (error.message?.includes("server")) {
          errorMessage = "Error del servidor. Intenta más tarde";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, clearError]
  );

  const handleForgotPassword = () => {
    alert("Funcionalidad próximamente disponible");
  };

  const handleGoToRegister = () => {
    router.push("/auth/register");
  };

  React.useEffect(() => {
    clearError();
    setSubmitError(null);

    return () => {
      reset();
    };
  }, [clearError, reset]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(600)}>
            <AuthHeader
              title=""
              subtitle="Descubre y conecta con el Tolima"
              showBackButton={false}
              animated={true}
            />
          </Animated.View>

          <Animated.View
            style={styles.formContainer}
            entering={FadeInDown.delay(300).duration(600)}
          >
            {(submitError || authError) && (
              <FormError
                errors={submitError || authError || ""}
                variant="error"
                animated={true}
              />
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  leftIcon={
                    <Mail size={20} color={theme.colors.text.secondary} />
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  placeholder="tu@email.com"
                  required
                  testID="login-email-input"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  leftIcon={
                    <Lock size={20} color={theme.colors.text.secondary} />
                  }
                  secureTextEntry={true}
                  showPasswordToggle={true}
                  placeholder="Tu contraseña"
                  required
                  testID="login-password-input"
                />
              )}
            />

            <View style={styles.forgotPasswordContainer}>
              <Text
                style={styles.forgotPasswordLink}
                onPress={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </View>

            <PrimaryButton
              title="Iniciar Sesión"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              variant="primary"
              size="large"
              fullWidth={true}
              testID="login-submit-button"
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <Text style={styles.registerLink} onPress={handleGoToRegister}>
                Crear cuenta
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: theme.spacing[4],
  },

  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: theme.spacing[6],
  },

  forgotPasswordLink: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary.main,
    textDecorationLine: "underline",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing[6],
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral.border,
  },

  dividerText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing[4],
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing[4],
  },

  registerText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },

  registerLink: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary.main,
    textDecorationLine: "underline",
  },
});
