import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import SplashScreen from "./splash";

/**
 * Pantalla inicial que maneja la redirección basada en el estado de autenticación
 */
export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay para mostrar el splash screen
      const timer = setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth/login");
        }
      }, 2000); // 2 segundos de splash screen

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router]);

  // Mostrar splash screen mientras determina la navegación
  return <SplashScreen />;
}
