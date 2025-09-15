import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/constants/design-tokens";
import { useAuth } from "@/context/auth-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.primary.main} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.welcomeText}>
              ¡Hola, {user?.name || "Usuario"}!
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={colors.error.main}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/tolimago.png")}
              style={styles.appLogo}
            />
            <Text style={styles.appName}>TolimaGO</Text>
            <Text style={styles.tagline}>Tu ciudad en tus manos</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Bienvenido a tu plataforma ciudadana
          </Text>
          <Text style={styles.welcomeDescription}>
            Accede a servicios municipales, reporta incidencias y mantente
            informado sobre tu ciudad.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color={colors.primary.main}
                />
              </View>
              <Text style={styles.actionTitle}>Trámites</Text>
              <Text style={styles.actionDescription}>
                Consulta y gestiona tus trámites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="warning-outline"
                  size={32}
                  color={colors.secondary.main}
                />
              </View>
              <Text style={styles.actionTitle}>Reportar</Text>
              <Text style={styles.actionDescription}>
                Reporta problemas en la ciudad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={32}
                  color={colors.info.main}
                />
              </View>
              <Text style={styles.actionTitle}>Noticias</Text>
              <Text style={styles.actionDescription}>
                Últimas noticias municipales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="map-outline"
                  size={32}
                  color={colors.success.main}
                />
              </View>
              <Text style={styles.actionTitle}>Servicios</Text>
              <Text style={styles.actionDescription}>
                Encuentra servicios cercanos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing[3],
  },

  userDetails: {
    flex: 1,
  },

  welcomeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },

  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },

  logoutButton: {
    padding: spacing[0],
    borderRadius: spacing[0],
    backgroundColor: colors.error.light,
  },

  content: {
    flex: 1,
  },

  heroSection: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing[12],
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
  },

  appLogo: {
    width: 100,
    height: 100,
    marginBottom: spacing[4],
    borderRadius: 30,
  },

  appName: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing[2],
  },

  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.primary.light,
    textAlign: "center",
  },

  welcomeSection: {
    padding: spacing[6],
    backgroundColor: colors.neutral.white,
    marginTop: -spacing[6],
    borderTopLeftRadius: spacing[6],
    borderTopRightRadius: spacing[6],
  },

  welcomeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing[3],
  },

  welcomeDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  actionsSection: {
    padding: spacing[6],
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing[5],
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionCard: {
    width: (width - spacing[6] * 2 - spacing[4]) / 2,
    backgroundColor: colors.neutral.white,
    padding: spacing[5],
    borderRadius: spacing[4],
    marginBottom: spacing[4],
    alignItems: "center",
    shadowColor: colors.overlay.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[3],
  },

  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: "center",
  },

  actionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});
