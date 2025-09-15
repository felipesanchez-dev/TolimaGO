import { theme } from "@/constants/design-tokens";
import { ArrowRight, CheckCircle } from "lucide-react-native";
import React from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface SuccessModalProps {
  visible: boolean;
  userName: string;
  onContinue: () => void;
}

export function SuccessModal({
  visible,
  userName,
  onContinue,
}: SuccessModalProps) {
  const [scaleAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Ícono de éxito */}
          <View style={styles.iconContainer}>
            <CheckCircle size={64} color={theme.colors.success.main} />
          </View>

          {/* Título */}
          <Text style={styles.title}>¡Cuenta Creada!</Text>

          {/* Mensaje personalizado */}
          <Text style={styles.message}>
            Bienvenido <Text style={styles.userName}>{userName}</Text>
            {"\n"}
            Tu cuenta ha sido creada exitosamente.
          </Text>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • Tu cuenta está lista para usar{"\n"}• Ahora puedes iniciar
              sesión{"\n"}• Explora todo lo que TolimaGO tiene para ti
            </Text>
          </View>

          {/* Botón de continuar */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Iniciar Sesión</Text>
            <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing[6],
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: theme.spacing[8],
    alignItems: "center",
    maxWidth: 350,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  iconContainer: {
    marginBottom: theme.spacing[6],
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
    textAlign: "center",
  },

  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing[6],
  },

  userName: {
    fontWeight: "bold",
    color: theme.colors.primary.main,
  },

  infoContainer: {
    backgroundColor: theme.colors.success.light,
    borderRadius: 12,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    width: "100%",
  },

  infoText: {
    fontSize: 14,
    color: theme.colors.success.dark,
    lineHeight: 20,
  },

  continueButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: theme.colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: theme.spacing[2],
  },

  buttonIcon: {
    marginLeft: theme.spacing[1],
  },
});
