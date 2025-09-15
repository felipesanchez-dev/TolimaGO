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
  title: string;
  subtitle?: string;

  logo?: ImageSourcePropType;
  logoComponent?: React.ReactNode;
  showLogo?: boolean;

  showBackButton?: boolean;
  onBackPress?: () => void;

  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;

  animated?: boolean;

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

    return (
      <View style={[styles.logoContainer, styles.defaultLogoContainer]}>
        <Image
          source={require("@/assets/images/tolimago.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
      <View style={styles.topSection}>
        <BackButton />
        <View style={styles.spacer} />
      </View>

      <LogoComponent />

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
    minHeight: 24,
  },

  backButton: {
  padding: theme.spacing[2],
  borderRadius: theme.borderRadius.md,
  backgroundColor: theme.colors.neutral.surface,
  ...theme.shadows.sm,
  position: "absolute",
  left: theme.spacing[0],
  top: theme.spacing[1],
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
    width: 200,
    height: 200,
    borderRadius: 90,
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
