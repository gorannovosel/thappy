import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface FormState<T> {
  values: T;
  errors: ValidationErrors;
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

export interface UseFormValidationOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: { [K in keyof T]?: ValidationRule[] };
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) {
  const {
    initialValues,
    validationRules = {},
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (fieldName: keyof T, value: string): string[] => {
      const rules =
        validationRules &&
        ((validationRules as any)[fieldName] as ValidationRule[] | undefined);
      if (!rules) return [];

      const fieldErrors: string[] = [];

      for (const rule of rules) {
        // Required validation
        if (rule.required && (!value || value.trim() === '')) {
          fieldErrors.push(rule.message || `${String(fieldName)} is required`);
          continue; // Skip other validations if required fails
        }

        // Skip other validations if value is empty and not required
        if (!value || value.trim() === '') {
          continue;
        }

        // Min length validation
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(
            rule.message ||
              `${String(fieldName)} must be at least ${rule.minLength} characters`
          );
        }

        // Max length validation
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(
            rule.message ||
              `${String(fieldName)} cannot exceed ${rule.maxLength} characters`
          );
        }

        // Email validation
        if (rule.email) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            fieldErrors.push(
              rule.message || 'Please enter a valid email address'
            );
          }
        }

        // Phone validation
        if (rule.phone) {
          const phonePattern = /^[+]?[\d\s()-]{10,}$/;
          if (!phonePattern.test(value.replace(/[\s()-]/g, ''))) {
            fieldErrors.push(
              rule.message || 'Please enter a valid phone number'
            );
          }
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(
            rule.message || `${String(fieldName)} format is invalid`
          );
        }

        // Custom validation
        if (rule.custom) {
          const customError = rule.custom(value);
          if (customError) {
            fieldErrors.push(customError);
          }
        }
      }

      return fieldErrors;
    },
    [validationRules]
  );

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(
        fieldName as keyof T,
        values[fieldName] || ''
      );
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    });

    return newErrors;
  }, [values, validationRules, validateField]);

  const setValue = useCallback(
    (fieldName: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [fieldName]: value }));

      if (validateOnChange) {
        const fieldErrors = validateField(fieldName, String(value || ''));
        setErrors(prev => {
          const newErrors = { ...prev };
          if (fieldErrors.length > 0) {
            newErrors[fieldName as string] = fieldErrors;
          } else {
            delete newErrors[fieldName as string];
          }
          return newErrors;
        });
      }
    },
    [validateField, validateOnChange]
  );

  const setFieldTouched = useCallback(
    (fieldName: keyof T, isTouched = true) => {
      setTouched(prev => ({ ...prev, [fieldName]: isTouched }));

      if (validateOnBlur && isTouched) {
        const fieldErrors = validateField(fieldName, values[fieldName] || '');
        setErrors(prev => {
          const newErrors = { ...prev };
          if (fieldErrors.length > 0) {
            newErrors[fieldName as string] = fieldErrors;
          } else {
            delete newErrors[fieldName as string];
          }
          return newErrors;
        });
      }
    },
    [validateField, validateOnBlur, values]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValue(name as keyof T, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T, true);
    },
    [setFieldTouched]
  );

  const isValid = useMemo(() => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  }, [validateForm]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);

      const formErrors = validateForm();
      setErrors(formErrors);

      // Mark all fields as touched
      const touchedFields: { [K in keyof T]?: boolean } = {};
      Object.keys(validationRules).forEach(fieldName => {
        touchedFields[fieldName as keyof T] = true;
      });
      setTouched(touchedFields);

      if (Object.keys(formErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          // Error handling is done by the submit function
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, validationRules]
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setTouched: setFieldTouched,
    handleChange,
    handleBlur,
    reset,
    submit,
    validateField,
    validateForm,
  };
}
