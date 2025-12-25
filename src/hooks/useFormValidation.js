import { useState, useCallback } from 'react';
import { VALIDATION_RULES } from '../utils/constants';

const useFormValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!VALIDATION_RULES.EMAIL.PATTERN.test(value)) {
          error = VALIDATION_RULES.EMAIL.MESSAGE;
        }
        break;

      case 'name':
        if (!value) {
          error = 'Name is required';
        } else if (value.length < VALIDATION_RULES.CATEGORY_NAME.MIN_LENGTH) {
          error = VALIDATION_RULES.CATEGORY_NAME.MESSAGE;
        } else if (value.length > VALIDATION_RULES.CATEGORY_NAME.MAX_LENGTH) {
          error = VALIDATION_RULES.CATEGORY_NAME.MESSAGE;
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return isValid;
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0 || Object.values(errors).every(error => !error)
  };
};

export default useFormValidation;