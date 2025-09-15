/**
 * TolimaGO Design System - Tokens
 * Sistema de diseño profesional con tokens de colores, tipografías y espaciados
 */

// =================== COLORES ===================
export const colors = {
  // Brand Colors - Identidad TolimaGO
  primary: {
    main: "#0B646B", // Verde agua Tolima - profesional y confiable
    light: "#E6F4F5", // Versión muy clara para fondos
    dark: "#084B51", // Versión oscura para estados hover
    contrast: "#FFFFFF", // Texto sobre primary
  },

  secondary: {
    main: "#F79E02", // Amarillo cálido - accents y CTAs
    light: "#FFF7E6", // Versión clara para fondos
    dark: "#E6890C", // Versión oscura para estados hover
    contrast: "#0F1724", // Texto sobre secondary
  },

  // Semantic Colors
  success: {
    main: "#22C55E",
    light: "#DCFCE7",
    dark: "#16A34A",
    contrast: "#FFFFFF",
  },

  error: {
    main: "#EF4444",
    light: "#FEF2F2",
    dark: "#DC2626",
    contrast: "#FFFFFF",
  },

  warning: {
    main: "#F59E0B",
    light: "#FEF3C7",
    dark: "#D97706",
    contrast: "#0F1724",
  },

  info: {
    main: "#3B82F6",
    light: "#EFF6FF",
    dark: "#2563EB",
    contrast: "#FFFFFF",
  },

  // Neutral Colors
  neutral: {
    white: "#FFFFFF",
    background: "#FAFBFC", // Fondo principal claro
    surface: "#FFFFFF", // Superficie de cards
    border: "#E5E7EB", // Bordes sutiles
    divider: "#F3F4F6", // Líneas divisorias
    disabled: "#F9FAFB", // Estados deshabilitados
  },

  // Text Colors
  text: {
    primary: "#0F1724", // Texto principal - alta legibilidad
    secondary: "#6B7280", // Texto secundario
    tertiary: "#9CA3AF", // Texto terciario/placeholders
    disabled: "#D1D5DB", // Texto deshabilitado
    inverse: "#FFFFFF", // Texto sobre fondos oscuros
  },

  // Overlay & States
  overlay: {
    light: "rgba(15, 23, 36, 0.05)",
    medium: "rgba(15, 23, 36, 0.15)",
    dark: "rgba(15, 23, 36, 0.25)",
    heavy: "rgba(15, 23, 36, 0.50)",
  },
} as const;

// =================== TIPOGRAFÍA ===================
export const typography = {
  // Font Families
  fontFamily: {
    primary: "Inter", // Fuente principal para UI
    heading: "Inter", // Para títulos (se puede cambiar por Poppins)
    mono: "SF Mono", // Para código (si se necesita)
  },

  // Font Weights
  fontWeight: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },

  // Font Sizes - Sistema escalable
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16, // Base para inputs y cuerpo
    lg: 18, // Subtítulos
    xl: 20,
    "2xl": 24,
    "3xl": 28, // Títulos principales
    "4xl": 32,
    "5xl": 40,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
} as const;

// =================== ESPACIADO ===================
// Sistema base de 8px para spacing consistente
export const spacing = {
  0: 0,
  1: 4, // 4px
  2: 8, // 8px - base unit
  3: 12, // 12px
  4: 16, // 16px
  5: 20, // 20px
  6: 24, // 24px
  8: 32, // 32px
  10: 40, // 40px
  12: 48, // 48px
  16: 64, // 64px
  20: 80, // 80px
  24: 96, // 96px
} as const;

// =================== BORDER RADIUS ===================
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10, // Botones
  lg: 14, // Cards y containers
  xl: 20,
  full: 9999, // Círculos
} as const;

// =================== SHADOWS ===================
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  lg: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// =================== ANIMACIONES ===================
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  easing: {
    easeInOut: "easeInOut",
    easeOut: "easeOut",
    easeIn: "easeIn",
    spring: "spring",
  },
} as const;

// =================== BREAKPOINTS ===================
export const breakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// =================== TIPOS TYPESCRIPT ===================
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Animations = typeof animations;

// Export del theme completo
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
} as const;

export type Theme = typeof theme;
