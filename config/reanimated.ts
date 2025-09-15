/**
 * TolimaGO - Reanimated Configuration
 * Configuración para mejorar el rendimiento durante desarrollo
 */

// Configuración global para React Native Reanimated
if (__DEV__) {
  // Deshabilitar logs de advertencias durante desarrollo
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("[Reanimated]")) {
      return; // Ignorar advertencias de Reanimated
    }
    originalWarn(...args);
  };
}
