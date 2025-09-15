import { useCallback, useRef, useState } from "react";

/**
 * TolimaGO - Hook profesional para manejo de formularios
 * Incluye validación en tiempo real, debounce, y manejo avanzado de errores
 */

export interface ValidationRule<T = any> {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | string;
  phone?: boolean | string;
  custom?: (value: T) => string | null | Promise<string | null>;
}

export interface FieldConfig<T = any> {
  initialValue?: T;
  validation?: ValidationRule<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  transform?: (value: any) => T;
}

export interface FormConfig<T extends Record<string, any>> {
  initialValues?: Partial<T>;
  validation?: { [K in keyof T]?: ValidationRule<T[K]> };
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
}

export interface FieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  dirty: { [K in keyof T]?: boolean };
  validating: { [K in keyof T]?: boolean };
  isValid: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isTouched: boolean;
  submitCount: number;
}

export interface FormActions<T extends Record<string, any>> {
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(name: K, error: string | null) => void;
  setErrors: (errors: Partial<{ [K in keyof T]: string }>) => void;
  setTouched: <K extends keyof T>(name: K, touched?: boolean) => void;
  setFieldState: <K extends keyof T>(
    name: K,
    state: Partial<FieldState>
  ) => void;
  validateField: <K extends keyof T>(name: K) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  resetField: <K extends keyof T>(name: K) => void;
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => (e?: any) => Promise<void>;
  getFieldProps: <K extends keyof T>(
    name: K
  ) => {
    value: any;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error: string | null;
    touched: boolean;
  };
}

// Utilidades de validación
const validators = {
  required: (
    value: any,
    message = "Este campo es requerido"
  ): string | null => {
    if (value === null || value === undefined || value === "") {
      return message;
    }
    return null;
  },

  minLength: (value: string, min: number, message?: string): string | null => {
    if (value && value.length < min) {
      return message || `Debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (value: string, max: number, message?: string): string | null => {
    if (value && value.length > max) {
      return message || `No puede tener más de ${max} caracteres`;
    }
    return null;
  },

  pattern: (value: string, regex: RegExp, message?: string): string | null => {
    if (value && !regex.test(value)) {
      return message || "Formato inválido";
    }
    return null;
  },

  email: (value: string, message = "Email inválido"): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (value: string, message = "Teléfono inválido"): string | null => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (value && !phoneRegex.test(value.replace(/\s/g, ""))) {
      return message;
    }
    return null;
  },
};

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T> = {}
): FormState<T> & FormActions<T> {
  const {
    initialValues = {} as T,
    validation = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    debounceMs = 300,
  } = config;

  const [formState, setFormState] = useState<FormState<T>>(() => ({
    values: { ...initialValues } as T,
    errors: {} as { [K in keyof T]?: string },
    touched: {} as { [K in keyof T]?: boolean },
    dirty: {} as { [K in keyof T]?: boolean },
    validating: {} as { [K in keyof T]?: boolean },
    isValid: true,
    isValidating: false,
    isDirty: false,
    isTouched: false,
    submitCount: 0,
  }));

  const debounceTimeouts = useRef<{ [key: string]: any }>({});
  const validationCache = useRef<{ [key: string]: string | null }>({});

  // Función para validar un campo individual
  const validateField = useCallback(
    async <K extends keyof T>(name: K): Promise<string | null> => {
      const value = formState.values[name];
      const rules = (validation as any)[name];

      if (!rules) return null;

      // Marcar como validando
      setFormState((prev) => ({
        ...prev,
        validating: { ...prev.validating, [name]: true },
        isValidating: true,
      }));

      let error: string | null = null;

      try {
        // Validación requerido
        if (rules.required) {
          const message =
            typeof rules.required === "string"
              ? rules.required
              : "Este campo es requerido";
          error = validators.required(value, message);
          if (error) throw new Error(error);
        }

        // Si el campo está vacío y no es requerido, no validar más reglas
        if (!value) {
          return null;
        }

        // Validación de longitud mínima
        if (rules.minLength) {
          const { value: min, message } =
            typeof rules.minLength === "object"
              ? rules.minLength
              : { value: rules.minLength, message: undefined };
          error = validators.minLength(String(value), min, message);
          if (error) throw new Error(error);
        }

        // Validación de longitud máxima
        if (rules.maxLength) {
          const { value: max, message } =
            typeof rules.maxLength === "object"
              ? rules.maxLength
              : { value: rules.maxLength, message: undefined };
          error = validators.maxLength(String(value), max, message);
          if (error) throw new Error(error);
        }

        // Validación de patrón
        if (rules.pattern) {
          const { value: regex, message } =
            typeof rules.pattern === "object"
              ? rules.pattern
              : { value: rules.pattern, message: undefined };
          error = validators.pattern(String(value), regex, message);
          if (error) throw new Error(error);
        }

        // Validación de email
        if (rules.email) {
          const message =
            typeof rules.email === "string" ? rules.email : "Email inválido";
          error = validators.email(String(value), message);
          if (error) throw new Error(error);
        }

        // Validación de teléfono
        if (rules.phone) {
          const message =
            typeof rules.phone === "string" ? rules.phone : "Teléfono inválido";
          error = validators.phone(String(value), message);
          if (error) throw new Error(error);
        }

        // Validación personalizada
        if (rules.custom) {
          error = await rules.custom(value);
          if (error) throw new Error(error);
        }
      } catch (validationError) {
        error = (validationError as Error).message;
      } finally {
        // Actualizar estado con resultado de validación
        setFormState((prev) => {
          const newErrors = { ...prev.errors };
          const newValidating = { ...prev.validating };

          if (error) {
            newErrors[name] = error;
          } else {
            delete newErrors[name];
          }

          delete newValidating[name];

          const isValidating = Object.keys(newValidating).length > 0;
          const isValid = Object.keys(newErrors).length === 0;

          return {
            ...prev,
            errors: newErrors,
            validating: newValidating,
            isValidating,
            isValid,
          };
        });

        // Cachear resultado
        validationCache.current[String(name)] = error;
      }

      return error;
    },
    [formState.values, validation]
  );

  // Validar todo el formulario
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldNames = Object.keys(validation) as (keyof T)[];
    const validationPromises = fieldNames.map((name) => validateField(name));

    const results = await Promise.all(validationPromises);
    return results.every((error) => error === null);
  }, [validation, validateField]);

  // Establecer valor de un campo
  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const isDirty =
          JSON.stringify(newValues) !== JSON.stringify(initialValues);

        return {
          ...prev,
          values: newValues,
          dirty: { ...prev.dirty, [name]: true },
          isDirty,
        };
      });

      // Validación con debounce si está habilitada
      if (validateOnChange) {
        // Limpiar timeout anterior
        if (debounceTimeouts.current[String(name)]) {
          clearTimeout(debounceTimeouts.current[String(name)]);
        }

        // Establecer nuevo timeout
        debounceTimeouts.current[String(name)] = setTimeout(() => {
          validateField(name);
          delete debounceTimeouts.current[String(name)];
        }, debounceMs);
      }
    },
    [initialValues, validateOnChange, validateField, debounceMs]
  );

  // Establecer múltiples valores
  const setValues = useCallback(
    (values: Partial<T>) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, ...values };
        const newDirty = { ...prev.dirty };

        // Marcar campos como dirty
        Object.keys(values).forEach((key) => {
          newDirty[key as keyof T] = true;
        });

        const isDirty =
          JSON.stringify(newValues) !== JSON.stringify(initialValues);

        return {
          ...prev,
          values: newValues,
          dirty: newDirty,
          isDirty,
        };
      });
    },
    [initialValues]
  );

  // Establecer error de un campo
  const setError = useCallback(
    <K extends keyof T>(name: K, error: string | null) => {
      setFormState((prev) => {
        const newErrors = { ...prev.errors };

        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    []
  );

  // Establecer múltiples errores
  const setErrors = useCallback(
    (errors: Partial<{ [K in keyof T]: string }>) => {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, ...errors },
        isValid: Object.keys({ ...prev.errors, ...errors }).length === 0,
      }));
    },
    []
  );

  // Marcar campo como tocado
  const setTouched = useCallback(
    <K extends keyof T>(name: K, touched = true) => {
      setFormState((prev) => {
        const newTouched = { ...prev.touched, [name]: touched };
        return {
          ...prev,
          touched: newTouched,
          isTouched: Object.values(newTouched).some(Boolean),
        };
      });

      // Validar en blur si está habilitado
      if (touched && validateOnBlur) {
        validateField(name);
      }
    },
    [validateOnBlur, validateField]
  );

  // Establecer estado completo de un campo
  const setFieldState = useCallback(
    <K extends keyof T>(name: K, state: Partial<FieldState>) => {
      setFormState((prev) => {
        const updates: any = {};

        if ("value" in state) {
          updates.values = { ...prev.values, [name]: state.value };
          updates.dirty = { ...prev.dirty, [name]: true };
        }

        if ("error" in state) {
          updates.errors = { ...prev.errors };
          if (state.error) {
            updates.errors[name] = state.error;
          } else {
            delete updates.errors[name];
          }
          updates.isValid = Object.keys(updates.errors).length === 0;
        }

        if ("touched" in state) {
          updates.touched = { ...prev.touched, [name]: state.touched };
          updates.isTouched = Object.values(updates.touched).some(Boolean);
        }

        if ("validating" in state) {
          updates.validating = { ...prev.validating };
          if (state.validating) {
            updates.validating[name] = true;
          } else {
            delete updates.validating[name];
          }
          updates.isValidating = Object.keys(updates.validating).length > 0;
        }

        return { ...prev, ...updates };
      });
    },
    []
  );

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormState({
      values: { ...initialValues } as T,
      errors: {} as { [K in keyof T]?: string },
      touched: {} as { [K in keyof T]?: boolean },
      dirty: {} as { [K in keyof T]?: boolean },
      validating: {} as { [K in keyof T]?: boolean },
      isValid: true,
      isValidating: false,
      isDirty: false,
      isTouched: false,
      submitCount: 0,
    });

    // Limpiar timeouts
    Object.values(debounceTimeouts.current).forEach(clearTimeout);
    debounceTimeouts.current = {};
    validationCache.current = {};
  }, [initialValues]);

  // Resetear campo específico
  const resetField = useCallback(
    <K extends keyof T>(name: K) => {
      setFormState((prev) => {
        const newValues = { ...prev.values };
        const newErrors = { ...prev.errors };
        const newTouched = { ...prev.touched };
        const newDirty = { ...prev.dirty };

        newValues[name] = (initialValues as any)[name];
        delete newErrors[name];
        delete newTouched[name];
        delete newDirty[name];

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          touched: newTouched,
          dirty: newDirty,
          isValid: Object.keys(newErrors).length === 0,
          isTouched: Object.values(newTouched).some(Boolean),
          isDirty: Object.values(newDirty).some(Boolean),
        };
      });

      // Limpiar timeout del campo
      if (debounceTimeouts.current[String(name)]) {
        clearTimeout(debounceTimeouts.current[String(name)]);
        delete debounceTimeouts.current[String(name)];
      }

      delete validationCache.current[String(name)];
    },
    [initialValues]
  );

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async (e?: any) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setFormState((prev) => ({ ...prev, submitCount: prev.submitCount + 1 }));

      // Marcar todos los campos como tocados
      const touchedFields: { [K in keyof T]?: boolean } = {};
      Object.keys(formState.values).forEach((key) => {
        touchedFields[key as keyof T] = true;
      });

      setFormState((prev) => ({
        ...prev,
        touched: { ...prev.touched, ...touchedFields },
        isTouched: true,
      }));

      // Validar formulario si está habilitado
      if (validateOnSubmit) {
        const isValid = await validateForm();
        if (!isValid) {
          console.log("📋 [Form] Validation failed, not submitting");
          return;
        }
      }

      try {
        console.log("📋 [Form] Submitting form with values:", formState.values);
        await onSubmit(formState.values);
      } catch (error) {
        console.error("📋 [Form] Submit error:", error);
        throw error;
      }
    },
    [formState.values, validateOnSubmit, validateForm]
  );

  // Propiedades para componentes de campo
  const getFieldProps = useCallback(
    <K extends keyof T>(name: K) => ({
      value: formState.values[name] || "",
      onChangeText: (text: string) => setValue(name, text as T[K]),
      onBlur: () => setTouched(name, true),
      error: formState.errors[name] || null,
      touched: formState.touched[name] || false,
    }),
    [
      formState.values,
      formState.errors,
      formState.touched,
      setValue,
      setTouched,
    ]
  );

  return {
    // Estado
    ...formState,

    // Acciones
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setFieldState,
    validateField,
    validateForm,
    resetForm,
    resetField,
    handleSubmit,
    getFieldProps,
  };
}
