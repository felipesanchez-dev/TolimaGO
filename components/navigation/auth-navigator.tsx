import { useAuth } from "@/context/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function AuthNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";

    if (user && inAuthGroup) {
      // Usuario autenticado pero está en auth screens -> redirect a tabs
      router.replace("/(tabs)");
    } else if (!user && inTabsGroup) {
      // Usuario no autenticado pero está en tabs -> redirect a login
      router.replace("/auth/login");
    } else if (!user && !inAuthGroup && segments[0] !== "splash") {
      // Usuario no autenticado y no está en auth ni splash -> redirect a login
      router.replace("/auth/login");
    }
  }, [user, segments, isLoading, router]);

  // Si está cargando, no renderizar nada (el splash se encarga)
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Splash Screen */}
      <Stack.Screen
        name="splash"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Auth Flow */}
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Main App */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Modal */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Modal",
        }}
      />
    </Stack>
  );
}
