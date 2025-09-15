import { theme } from "@/constants/design-tokens";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

/**
 * TolimaGO - AuthHeader Component
 * Header profesional para pantallas de autenticación
 */

export interface AuthHeaderProps {
  // Contenido
  title: string;
  subtitle?: string;

  // Logo
  logo?: ImageSourcePropType;
  logoComponent?: React.ReactNode;
  showLogo?: boolean;

  // Navegación
  showBackButton?: boolean;
  onBackPress?: () => void;

  // Estilos
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;

  // Animaciones
  animated?: boolean;

  // Accesibilidad
  testID?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  logo,
  logoComponent,
  showLogo = true,
  showBackButton = false,
  onBackPress,
  containerStyle,
  titleStyle,
  subtitleStyle,
  animated = true,
  testID,
}) => {
  // =================== COMPONENTES ===================
  const LogoComponent = () => {
    if (!showLogo) return null;

    if (logoComponent) {
      return <View style={styles.logoContainer}>{logoComponent}</View>;
    }

    if (logo) {
      return (
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </View>
      );
    }

    // Logo por defecto si no se proporciona uno
    return (
      <View style={[styles.logoContainer, styles.defaultLogoContainer]}>
        <Text style={styles.defaultLogoText}>TolimaGO</Text>
      </View>
    );
  };

  const BackButton = () => {
    if (!showBackButton) return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        accessibilityHint="Regresar a la pantalla anterior"
      >
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
    );
  };

  const TitleComponent = animated ? Animated.Text : Text;
  const SubtitleComponent = animated ? Animated.Text : Text;
  const ContainerComponent = animated ? Animated.View : View;

  // =================== PROPS DE ANIMACIÓN ===================
  const titleAnimationProps = animated
    ? {
        entering: FadeInUp.delay(200).duration(600),
      }
    : {};

  const subtitleAnimationProps = animated
    ? {
        entering: FadeInDown.delay(400).duration(600),
      }
    : {};

  const containerAnimationProps = animated
    ? {
        entering: FadeInUp.duration(600),
      }
    : {};

  return (
    <ContainerComponent
      style={[styles.container, containerStyle]}
      testID={testID}
      {...containerAnimationProps}
    >
      {/* Header superior con back button */}
      <View style={styles.topSection}>
        <BackButton />
        <View style={styles.spacer} />
      </View>

      {/* Logo */}
      <LogoComponent />

      {/* Contenido de texto */}
      <View style={styles.textContent}>
        <TitleComponent
          style={[styles.title, titleStyle]}
          {...titleAnimationProps}
        >
          {title}
        </TitleComponent>

        {subtitle && (
          <SubtitleComponent
            style={[styles.subtitle, subtitleStyle]}
            {...subtitleAnimationProps}
          >
            {subtitle}
          </SubtitleComponent>
        )}
      </View>
    </ContainerComponent>
  );
};

// =================== ESTILOS ===================
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
  },

  topSection: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: theme.spacing[4],
    minHeight: 24, // Para mantener espacio consistente
  },

  backButton: {
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral.surface,
    ...theme.shadows.sm,
  },

  spacer: {
    flex: 1,
  },

  logoContainer: {
    marginBottom: theme.spacing[6],
    alignItems: "center",
    justifyContent: "center",
  },

  logoImage: {
    width: 80,
    height: 80,
  },

  defaultLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },

  defaultLogoText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.contrast,
    textAlign: "center",
  },

  textContent: {
    alignItems: "center",
    width: "100%",
  },

  title: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing[2],
    lineHeight:
      theme.typography.fontSize["3xl"] * theme.typography.lineHeight.tight,
  },

  subtitle: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    paddingHorizontal: theme.spacing[4],
  },
});

export default AuthHeader;
