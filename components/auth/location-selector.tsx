import { theme } from "@/constants/design-tokens";
import {
    citiesByCountry,
    colombianDepartments,
    countries,
    LocationData,
    tolimaMunicipalities,
} from "@/constants/locations";
import { ChevronDown, MapPin, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

/**
 * TolimaGO - Location Selector Component
 * Selector inteligente de ubicación basado en residencia del Tolima
 */

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  isTolima: boolean;
  error?: string;
  disabled?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  isTolima,
  error,
  disabled = false,
}: LocationSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "country" | "state" | "city" | "municipality"
  >("country");

  const getDisplayText = () => {
    if (isTolima) {
      if (value.city) {
        return `${value.city}`;
      }
      return "Selecciona tu municipio en Tolima";
    } else {
      if (value.country && value.city) {
        const country = countries.find((c) => c.code === value.country);
        return `${country?.flag || ""} ${value.city}, ${
          country?.name || value.country
        }`;
      }
      if (value.country) {
        const country = countries.find((c) => c.code === value.country);
        return `${country?.flag || ""} ${country?.name || value.country}`;
      }
      return "Selecciona tu ubicación";
    }
  };

  const getCurrentData = () => {
    const search = searchText.toLowerCase();

    if (isTolima || currentStep === "municipality") {
      return tolimaMunicipalities
        .filter((municipality) => municipality.toLowerCase().includes(search))
        .map((municipality) => ({
          id: municipality,
          label: municipality,
          value: municipality,
          subtitle: "Tolima, Colombia",
        }));
    }

    if (currentStep === "country") {
      return countries
        .filter((country) => country.name.toLowerCase().includes(search))
        .map((country) => ({
          id: country.code,
          label: `${country.flag} ${country.name}`,
          value: country.code,
          subtitle: country.code === "CO" ? "Colombia" : "",
        }));
    }

    if (currentStep === "state" && value.country === "CO") {
      return colombianDepartments
        .filter((dept) => dept.toLowerCase().includes(search))
        .map((dept) => ({
          id: dept,
          label: dept,
          value: dept,
          subtitle: "Colombia",
        }));
    }

    if (currentStep === "city") {
      const cities = citiesByCountry[value.country || ""] || [];
      return cities
        .filter((city) => city.toLowerCase().includes(search))
        .map((city) => ({
          id: city,
          label: city,
          value: city,
          subtitle: value.state || value.country || "",
        }));
    }

    return [];
  };

  const handleSelection = (selectedValue: string) => {
    if (isTolima) {
      onChange({
        country: "CO",
        state: "Tolima",
        city: selectedValue,
        isTolima: true,
      });
      setModalVisible(false);
      setSearchText("");
      return;
    }

    if (currentStep === "country") {
      const newLocation = {
        ...value,
        country: selectedValue,
        state: undefined,
        city: undefined,
        isTolima: false,
      };
      onChange(newLocation);

      if (selectedValue === "CO") {
        setCurrentStep("state");
      } else {
        setCurrentStep("city");
      }
    } else if (currentStep === "state") {
      const newLocation = {
        ...value,
        state: selectedValue,
        city: undefined,
        isTolima: selectedValue === "Tolima",
      };
      onChange(newLocation);

      if (selectedValue === "Tolima") {
        setCurrentStep("municipality");
      } else {
        setCurrentStep("city");
      }
    } else if (currentStep === "city" || currentStep === "municipality") {
      onChange({
        ...value,
        city: selectedValue,
      });
      setModalVisible(false);
      setSearchText("");
      setCurrentStep("country");
    }
  };

  const openModal = () => {
    if (disabled) return;

    if (isTolima) {
      setCurrentStep("municipality");
    } else {
      setCurrentStep("country");
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchText("");
    setCurrentStep("country");
  };

  const goBack = () => {
    if (currentStep === "state") {
      setCurrentStep("country");
    } else if (currentStep === "city") {
      if (value.country === "CO") {
        setCurrentStep("state");
      } else {
        setCurrentStep("country");
      }
    } else if (currentStep === "municipality") {
      setCurrentStep("state");
    }
  };

  const getModalTitle = () => {
    if (isTolima || currentStep === "municipality") {
      return "Municipios del Tolima";
    }
    if (currentStep === "country") {
      return "Selecciona tu país";
    }
    if (currentStep === "state") {
      return "Departamentos de Colombia";
    }
    if (currentStep === "city") {
      const country = countries.find((c) => c.code === value.country);
      return `${country?.flag || ""} Ciudades de ${
        country?.name || value.country
      }`;
    }
    return "Seleccionar ubicación";
  };

  const data = getCurrentData();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isTolima ? "Tu Municipio" : "Tu Ubicación"}
      </Text>

      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
          disabled && styles.selectorDisabled,
        ]}
        onPress={openModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <MapPin size={20} color={theme.colors.text.secondary} />
          <Text
            style={[styles.selectorText, !value.city && styles.placeholderText]}
          >
            {getDisplayText()}
          </Text>
        </View>
        <ChevronDown
          size={20}
          color={theme.colors.text.secondary}
          style={[disabled && styles.iconDisabled]}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <Animated.View
          style={styles.modal}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={
                currentStep !== "country" && !isTolima ? goBack : closeModal
              }
            >
              <Text style={styles.modalButtonText}>
                {currentStep !== "country" && !isTolima
                  ? "← Atrás"
                  : "Cancelar"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{getModalTitle()}</Text>

            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelection(item.value)}
                activeOpacity={0.7}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron resultados
                </Text>
              </View>
            )}
          />
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing[2],
  },

  label: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.neutral.surface,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    minHeight: 56,
  },

  selectorError: {
    borderColor: theme.colors.error.main,
  },

  selectorDisabled: {
    backgroundColor: theme.colors.neutral.disabled,
    opacity: 0.6,
  },

  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing[2],
  },

  selectorText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    flex: 1,
  },

  placeholderText: {
    color: theme.colors.text.secondary,
  },

  iconDisabled: {
    opacity: 0.5,
  },

  errorText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    marginTop: theme.spacing[1],
  },

  modal: {
    flex: 1,
    backgroundColor: theme.colors.neutral.surface,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.border,
    backgroundColor: theme.colors.neutral.background,
  },

  modalButton: {
    paddingVertical: theme.spacing[2],
    minWidth: 80,
  },

  modalButtonText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.medium,
  },

  modalTitle: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    textAlign: "center",
    flex: 1,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.neutral.background,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    margin: theme.spacing[4],
    gap: theme.spacing[2],
  },

  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[1],
  },

  list: {
    flex: 1,
  },

  listItem: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.neutral.surface,
  },

  listItemContent: {
    flex: 1,
  },

  listItemLabel: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },

  listItemSubtitle: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },

  separator: {
    height: 1,
    backgroundColor: theme.colors.neutral.border,
    marginLeft: theme.spacing[4],
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing[8],
  },

  emptyText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});
