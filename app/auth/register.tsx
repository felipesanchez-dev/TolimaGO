import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Lock, Mail, MapPin, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
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
  Toggle,
} from "@/components/auth";
import { theme } from "@/constants/design-tokens";
import { globalStyles } from "@/constants/global-styles";
import { useAuth } from "@/context/auth-context";
import { formatColombianPhone, registerSchema } from "@/lib/validations";

/**
 * TolimaGO - Register Screen
 * Pantalla de registro profesional con validaciones y animaciones
 */

export default function RegisterScreen() {
  // =================== ESTADO LOCAL ===================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // =================== HOOKS ===================
  const { register, error: authError, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isResident: false,
      acceptTerms: false,
      phone: "",
      city: "",
    },
  });

  // Observar valores para validaciones en tiempo real
  const acceptTerms = watch("acceptTerms");

  // =================== HANDLERS ===================
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      clearError();

      // Preparar datos para el registro
      const registerData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
        city: data.city?.trim() || undefined,
        isResident: data.isResident,
        role: "user" as const,
      };

      await register(registerData);

      // Si llega aquí, el registro fue exitoso
      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Register error:", error);

      // Mapear errores específicos
      let errorMessage = "Error al crear la cuenta. Intenta nuevamente.";

      if (
        error.message?.includes("already exists") ||
        error.message?.includes("duplicate")
      ) {
        errorMessage = "Ya existe una cuenta con este email";
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
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handlePhoneChange = (text: string) => {
    // Formatear automáticamente el teléfono
    const formatted = formatColombianPhone(text);
    return formatted;
  };

  // =================== EFECTOS ===================
  React.useEffect(() => {
    // Limpiar errores cuando el componente se monta
    clearError();
    setSubmitError(null);

    return () => {
      // Limpiar formulario al desmontar
      reset();
    };
  }, [clearError, reset]);

  // =================== RENDER ===================
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
          {/* Header con logo y título */}
          <Animated.View entering={FadeInUp.duration(600)}>
            <AuthHeader
              title="Únete a TolimaGO"
              subtitle="Crea tu cuenta y explora el Tolima"
              showBackButton={true}
              onBackPress={handleBackToLogin}
              animated={true}
            />
          </Animated.View>

          {/* Formulario de registro */}
          <Animated.View
            style={styles.formContainer}
            entering={FadeInDown.delay(300).duration(600)}
          >
            {/* Errores generales */}
            {(submitError || authError) && (
              <FormError
                errors={submitError || authError || ""}
                variant="error"
                animated={true}
              />
            )}

            {/* Campo de nombre */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Nombre Completo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  leftIcon={
                    <User size={20} color={theme.colors.text.secondary} />
                  }
                  placeholder="Tu nombre completo"
                  autoCapitalize="words"
                  autoComplete="name"
                  required
                  testID="register-name-input"
                />
              )}
            />

            {/* Campo de email */}
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
                  testID="register-email-input"
                />
              )}
            />

            {/* Campo de contraseña */}
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
                  placeholder="Mínimo 6 caracteres"
                  helperText="Usa al menos 6 caracteres"
                  required
                  testID="register-password-input"
                />
              )}
            />

            {/* Campo de confirmar contraseña */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Confirmar Contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  leftIcon={
                    <Lock size={20} color={theme.colors.text.secondary} />
                  }
                  secureTextEntry={true}
                  showPasswordToggle={true}
                  placeholder="Repite tu contraseña"
                  required
                  testID="register-confirm-password-input"
                />
              )}
            />

            {/* Campo de teléfono (opcional) */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Teléfono"
                  value={value || ""}
                  onChangeText={(text) => onChange(handlePhoneChange(text))}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  leftIcon={
                    <Phone size={20} color={theme.colors.text.secondary} />
                  }
                  keyboardType="phone-pad"
                  placeholder="+57 300 123 4567"
                  helperText="Opcional - Formato colombiano"
                  testID="register-phone-input"
                />
              )}
            />

            {/* Campo de ciudad (opcional) */}
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Ciudad"
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.city?.message}
                  leftIcon={
                    <MapPin size={20} color={theme.colors.text.secondary} />
                  }
                  placeholder="Tu ciudad"
                  autoCapitalize="words"
                  helperText="Opcional"
                  testID="register-city-input"
                />
              )}
            />

            {/* Toggle de residente del Tolima */}
            <Controller
              control={control}
              name="isResident"
              render={({ field: { onChange, value } }) => (
                <Toggle
                  value={value ?? false}
                  onValueChange={onChange}
                  label="Soy residente del Tolima"
                  description="Obtén beneficios especiales como residente"
                  testID="register-resident-toggle"
                />
              )}
            />

            {/* Toggle de aceptar términos */}
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <View style={styles.termsContainer}>
                  <Toggle
                    value={value}
                    onValueChange={onChange}
                    label="Acepto los términos y condiciones"
                    testID="register-terms-toggle"
                  />
                  {errors.acceptTerms && (
                    <Text style={styles.termsError}>
                      {errors.acceptTerms.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Botón de crear cuenta */}
            <PrimaryButton
              title="Crear Cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isValid || isSubmitting || !acceptTerms}
              variant="primary"
              size="large"
              fullWidth={true}
              containerStyle={styles.submitButton}
              testID="register-submit-button"
            />

            {/* Link para iniciar sesión */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <Text style={styles.loginLink} onPress={handleBackToLogin}>
                Iniciar sesión
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =================== ESTILOS ===================
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
    paddingBottom: theme.spacing[8], // Espacio extra para el teclado
  },

  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: theme.spacing[4],
  },

  termsContainer: {
    marginVertical: theme.spacing[2],
  },

  termsError: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    marginTop: theme.spacing[1],
    marginLeft: theme.spacing[12], // Alineado con el texto del toggle
  },

  submitButton: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing[4],
  },

  loginText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },

  loginLink: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary.main,
    textDecorationLine: "underline",
  },
});
