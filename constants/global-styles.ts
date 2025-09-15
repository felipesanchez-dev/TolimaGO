import { StyleSheet } from "react-native";
import { theme } from "./design-tokens";

/**
 * TolimaGO Design System - Estilos globales
 * Estilos reutilizables basados en el design system
 */

export const globalStyles = StyleSheet.create({
  // =================== CONTENEDORES ===================
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.background,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.neutral.background,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral.background,
  },

  // =================== CARDS Y SURFACES ===================
  card: {
    backgroundColor: theme.colors.neutral.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    ...theme.shadows.md,
  },

  surface: {
    backgroundColor: theme.colors.neutral.surface,
    borderRadius: theme.borderRadius.lg,
  },

  // =================== TIPOGRAFÍA ===================
  // Headings
  h1: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight:
      theme.typography.fontSize["4xl"] * theme.typography.lineHeight.tight,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.tight,
  },

  h2: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight:
      theme.typography.fontSize["3xl"] * theme.typography.lineHeight.tight,
    color: theme.colors.text.primary,
  },

  h3: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.semiBold,
    lineHeight:
      theme.typography.fontSize["2xl"] * theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  },

  h4: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    lineHeight:
      theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  },

  // Body Text
  bodyLarge: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight:
      theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  },

  body: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    color: theme.colors.text.primary,
  },

  bodySmall: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight:
      theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    color: theme.colors.text.secondary,
  },

  caption: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight:
      theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
    color: theme.colors.text.tertiary,
  },

  // =================== UTILIDADES DE TEXTO ===================
  textCenter: {
    textAlign: "center",
  },

  textBold: {
    fontWeight: theme.typography.fontWeight.bold,
  },

  textSemiBold: {
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  textMedium: {
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Text Colors
  textPrimary: {
    color: theme.colors.text.primary,
  },

  textSecondary: {
    color: theme.colors.text.secondary,
  },

  textTertiary: {
    color: theme.colors.text.tertiary,
  },

  textError: {
    color: theme.colors.error.main,
  },

  textSuccess: {
    color: theme.colors.success.main,
  },

  // =================== LAYOUT Y SPACING ===================
  // Flex utilities
  flexRow: {
    flexDirection: "row",
  },

  flexColumn: {
    flexDirection: "column",
  },

  flexCenter: {
    justifyContent: "center",
    alignItems: "center",
  },

  flexBetween: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  flexStart: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  flexEnd: {
    justifyContent: "flex-end",
    alignItems: "center",
  },

  // Padding utilities
  p1: { padding: theme.spacing[1] },
  p2: { padding: theme.spacing[2] },
  p3: { padding: theme.spacing[3] },
  p4: { padding: theme.spacing[4] },
  p5: { padding: theme.spacing[5] },
  p6: { padding: theme.spacing[6] },
  p8: { padding: theme.spacing[8] },

  px1: { paddingHorizontal: theme.spacing[1] },
  px2: { paddingHorizontal: theme.spacing[2] },
  px3: { paddingHorizontal: theme.spacing[3] },
  px4: { paddingHorizontal: theme.spacing[4] },
  px5: { paddingHorizontal: theme.spacing[5] },
  px6: { paddingHorizontal: theme.spacing[6] },

  py1: { paddingVertical: theme.spacing[1] },
  py2: { paddingVertical: theme.spacing[2] },
  py3: { paddingVertical: theme.spacing[3] },
  py4: { paddingVertical: theme.spacing[4] },
  py5: { paddingVertical: theme.spacing[5] },
  py6: { paddingVertical: theme.spacing[6] },

  // Margin utilities
  m1: { margin: theme.spacing[1] },
  m2: { margin: theme.spacing[2] },
  m3: { margin: theme.spacing[3] },
  m4: { margin: theme.spacing[4] },
  m5: { margin: theme.spacing[5] },
  m6: { margin: theme.spacing[6] },

  mx1: { marginHorizontal: theme.spacing[1] },
  mx2: { marginHorizontal: theme.spacing[2] },
  mx3: { marginHorizontal: theme.spacing[3] },
  mx4: { marginHorizontal: theme.spacing[4] },
  mx5: { marginHorizontal: theme.spacing[5] },
  mx6: { marginHorizontal: theme.spacing[6] },

  my1: { marginVertical: theme.spacing[1] },
  my2: { marginVertical: theme.spacing[2] },
  my3: { marginVertical: theme.spacing[3] },
  my4: { marginVertical: theme.spacing[4] },
  my5: { marginVertical: theme.spacing[5] },
  my6: { marginVertical: theme.spacing[6] },

  mb1: { marginBottom: theme.spacing[1] },
  mb2: { marginBottom: theme.spacing[2] },
  mb3: { marginBottom: theme.spacing[3] },
  mb4: { marginBottom: theme.spacing[4] },
  mb5: { marginBottom: theme.spacing[5] },
  mb6: { marginBottom: theme.spacing[6] },

  mt1: { marginTop: theme.spacing[1] },
  mt2: { marginTop: theme.spacing[2] },
  mt3: { marginTop: theme.spacing[3] },
  mt4: { marginTop: theme.spacing[4] },
  mt5: { marginTop: theme.spacing[5] },
  mt6: { marginTop: theme.spacing[6] },

  // =================== BORDERS ===================
  border: {
    borderWidth: 1,
    borderColor: theme.colors.neutral.border,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.border,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.border,
  },

  borderRadius: {
    borderRadius: theme.borderRadius.md,
  },

  borderRadiusLg: {
    borderRadius: theme.borderRadius.lg,
  },

  // =================== BACKGROUNDS ===================
  bgPrimary: {
    backgroundColor: theme.colors.primary.main,
  },

  bgSecondary: {
    backgroundColor: theme.colors.secondary.main,
  },

  bgSurface: {
    backgroundColor: theme.colors.neutral.surface,
  },

  bgBackground: {
    backgroundColor: theme.colors.neutral.background,
  },

  bgError: {
    backgroundColor: theme.colors.error.main,
  },

  bgSuccess: {
    backgroundColor: theme.colors.success.main,
  },

  // =================== ESTADOS INTERACTIVOS ===================
  touchableOpacity: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },

  // =================== ESPECÍFICOS PARA AUTH ===================
  authContainer: {
    flex: 1,
    backgroundColor: theme.colors.neutral.background,
    paddingHorizontal: theme.spacing[6],
  },

  authCard: {
    backgroundColor: theme.colors.neutral.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[8],
    marginHorizontal: theme.spacing[4],
    ...theme.shadows.lg,
  },

  authHeader: {
    marginBottom: theme.spacing[8],
    alignItems: "center",
  },

  authLogo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing[4],
  },

  authTitle: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing[2],
  },

  authSubtitle: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});

export default globalStyles;
