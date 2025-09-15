import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/constants/design-tokens";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
        <View />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>¡Próximamente!</Text>
        <Text style={styles.description}>
          Esta funcionalidad estará disponible próximamente.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },

  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },

  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: "center",
  },

  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[8],
  },

  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: spacing[3],
  },

  backButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
});
