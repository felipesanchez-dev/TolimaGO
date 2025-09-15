import "@/config/reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { colors } from "@/constants/design-tokens";
import { AuthProvider } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    // Add any custom fonts here if needed
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Custom theme with TolimaGO colors
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary.main,
      background: colors.neutral.background,
      card: colors.neutral.white,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary.main,
      background: colors.text.primary,
      card: colors.neutral.surface,
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? customDarkTheme : customTheme}
      >
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right", // Animación suave entre pantallas
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false, // Prevenir navegación accidental
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="splash"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" backgroundColor={colors.primary.main} />
    </>
  );
}
