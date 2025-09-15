import { colors, spacing, typography } from "@/constants/design-tokens";
import { useAuth } from "@/context/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function SplashScreen() {
  const { user, isLoading } = useAuth();

  // Animaciones
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  const backgroundOpacity = useSharedValue(1);

  const loadingWidth = useSharedValue(0);

  const navigateToNext = useCallback(() => {
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth/login");
    }
  }, [user]);

  useEffect(() => {
    // Secuencia animada
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });
    logoRotate.value = withTiming(360, { duration: 1000, easing: Easing.out(Easing.exp) });
    logoOpacity.value = withTiming(1, { duration: 900 });

    textOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    textTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    // Loading bar animada
    loadingWidth.value = withRepeat(
      withTiming(100, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Navegación después
    setTimeout(() => {
      if (!isLoading) {
        backgroundOpacity.value = withTiming(0, { duration: 600 }, () => {
          runOnJS(navigateToNext)();
        });
      }
    }, 3000);
  }, [backgroundOpacity, isLoading, loadingWidth, logoOpacity, logoRotate, logoScale, navigateToNext, textOpacity, textTranslateY]);

  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    width: `${loadingWidth.value}%`,
  }));

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      {/* Fondo con gradiente dinámico */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.light]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Image
            source={require("@/assets/images/tolimago.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Texto */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.brandName}>TolimaGO</Text>
        <Text style={styles.tagline}>Tu ciudad en tus manos</Text>
      </Animated.View>

      {/* Loading progresivo */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingProgress, loadingAnimatedStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrapper: {
    marginBottom: spacing[16],
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.overlay.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },

  logoImage: {
    width: 80,
    height: 80,
  },

  textContainer: {
    alignItems: "center",
  },

  brandName: {
    fontSize: typography.fontSize["4xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing[1],
    letterSpacing: -0.5,
    textAlign: "center",
  },

  tagline: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.white,
    textAlign: "center",
    opacity: 0.9,
  },

  loadingContainer: {
    position: "absolute",
    bottom: spacing[16],
    left: spacing[6],
    right: spacing[6],
  },

  loadingBar: {
    height: 4,
    backgroundColor: colors.primary.light,
    borderRadius: 2,
    overflow: "hidden",
    opacity: 0.4,
  },

  loadingProgress: {
    height: "100%",
    backgroundColor: colors.neutral.white,
    borderRadius: 2,
  },
});
