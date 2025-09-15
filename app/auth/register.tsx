import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Lock, Mail, User } from "lucide-react-native";
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
  LocationSelector,
  PrimaryButton,
  TextInputField,
  Toggle,
} from "@/components/auth";
import { theme } from "@/constants/design-tokens";
import { globalStyles } from "@/constants/global-styles";
import { LocationData } from "@/constants/locations";
import { useAuth } from "@/context/auth-context";
import { formatColombianPhone, registerSchema } from "@/lib/validations";

/**
 * TolimaGO - Register Screen
 * Pantalla de registro profesional con validaciones y animaciones
 */

export default function RegisterScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, error: authError, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
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
      phone: "+57 ",
      location: {
        country: "",
        state: "",
        city: "",
        isTolima: false,
      } as LocationData,
    },
  });

  const acceptTerms = watch("acceptTerms");
  const isResident = watch("isResident");

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      clearError();

      const registerData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
        city: data.location?.city?.trim() || undefined,
        isResident: data.isResident,
        role: "user" as const,
      };

      await register(registerData);

      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Register error:", error);

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
    // Si el usuario trata de borrar todo, mantener el prefijo +57
    if (text.length < 4) {
      return "+57 ";
    }

    // Si no empieza con +57, agregarlo automáticamente
    if (!text.startsWith("+57")) {
      // Si empieza con 57, agregar el +
      if (text.startsWith("57")) {
        text = "+" + text;
      } else if (
        text.startsWith("3") ||
        text.startsWith("6") ||
        text.startsWith("1")
      ) {
        // Si empieza con números colombianos típicos, agregar +57
        text = "+57 " + text;
      } else {
        // Para cualquier otro caso, forzar el prefijo
        text = "+57 " + text.replace(/^\+?57?\s?/, "");
      }
    }

    const formatted = formatColombianPhone(text);
    return formatted;
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
              subtitle="Crea tu cuenta y explora el Tolima"
              showBackButton={true}
              onBackPress={handleBackToLogin}
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

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Teléfono"
                  value={value || "+57 "}
                  onChangeText={(text) => onChange(handlePhoneChange(text))}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  leftIcon={
                    <View style={styles.phoneIconContainer}>
                      <Text style={styles.flagEmoji}>🇨🇴</Text>
                    </View>
                  }
                  keyboardType="phone-pad"
                  placeholder="+57 300 123 4567"
                  helperText="Formato colombiano - +57 seguido del número"
                  testID="register-phone-input"
                />
              )}
            />

            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <LocationSelector
                  value={{
                    country: value?.country || "",
                    state: value?.state || "", 
                    city: value?.city || "",
                    isTolima: value?.isTolima || false,
                  }}
                  onChange={(location) => {
                    onChange(location);
                    // Actualizar isResident automáticamente si selecciona Tolima
                    if (location.isTolima !== isResident) {
                      setValue("isResident", location.isTolima);
                    }
                  }}
                  isTolima={isResident || false}
                  error={errors.location?.city?.message || errors.location?.country?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="isResident"
              render={({ field: { onChange, value } }) => (
                <Toggle
                  value={value ?? false}
                  onValueChange={(newValue) => {
                    onChange(newValue);
                    // Si cambia de residente, actualizar la ubicación
                    if (newValue) {
                      // Si marca como residente, reset location para Tolima
                      setValue("location", {
                        country: "CO",
                        state: "Tolima",
                        city: "",
                        isTolima: true,
                      });
                    } else {
                      // Si desmarca residente, reset location
                      setValue("location", {
                        country: "",
                        state: "",
                        city: "",
                        isTolima: false,
                      });
                    }
                  }}
                  label="Soy residente del Tolima"
                  description="Obtén beneficios especiales como residente"
                  testID="register-resident-toggle"
                />
              )}
            />

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
    paddingBottom: theme.spacing[8],
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
    marginLeft: theme.spacing[12],
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

  phoneIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },

  flagEmoji: {
    fontSize: 16,
  },
});
