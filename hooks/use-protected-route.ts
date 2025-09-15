import { useAuth } from "@/context/auth-context";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";

/**
 * Hook de protección de rutas
 * Maneja la navegación automática basada en el estado de autenticación
 */
export function useProtectedRoute() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isLoading || isNavigating) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";
    const inIndex = segments[0] === undefined;

    setIsNavigating(true);

    const navigateTimeout = setTimeout(() => {
      if (user) {
        // Usuario autenticado
        if (inAuthGroup || inIndex) {
          // Está en auth o index -> redirect a tabs
          router.replace("/(tabs)");
        }
      } else {
        // Usuario no autenticado
        if (inTabsGroup) {
          // Está en tabs -> redirect a login
          router.replace("/auth/login");
        } else if (!inAuthGroup && !inIndex && segments[0] !== "splash") {
          // No está en auth, index o splash -> redirect a login
          router.replace("/auth/login");
        }
      }

      setIsNavigating(false);
    }, 100);

    return () => {
      clearTimeout(navigateTimeout);
      setIsNavigating(false);
    };
  }, [user, segments, isLoading, router, isNavigating]);

  return {
    isLoading: isLoading || isNavigating,
    user,
  };
}

/**
 * Componente de alta orden para proteger rutas privadas
 */
export function withProtectedRoute<T extends object>(
  Component: React.ComponentType<T>
) {
  return function ProtectedComponent(props: T) {
    const { isLoading, user } = useProtectedRoute();

    if (isLoading) {
      return null;
    }

    if (!user) {
      return null;
    }

    return React.createElement(Component, props);
  };
}

/**
 * Hook para verificar si el usuario tiene permisos específicos
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.role === role || false;
  };

  const hasPermission = (permission: string) => {
    return user?.role === "admin" || false;
  };

  const isAdmin = () => {
    return hasRole("admin") || hasRole("administrator");
  };

  const isResident = () => {
    return user?.isResident || false;
  };

  return {
    hasRole,
    hasPermission,
    isAdmin,
    isResident,
    user,
  };
}
