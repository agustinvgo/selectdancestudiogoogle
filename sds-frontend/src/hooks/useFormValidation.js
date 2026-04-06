/**
 * useFormValidation - Custom hook for inline form validation
 * 
 * Provides immediate feedback as users fill out forms,
 * building trust through clear guidance and error prevention.
 */

import { useState } from 'react';

export const useFormValidation = (initialValues, validationRules) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validate = (fieldName, value) => {
        const rules = validationRules[fieldName];
        if (!rules) return null;

        for (const rule of rules) {
            const error = rule(value, values);
            if (error) return error;
        }
        return null;
    };

    const handleChange = (fieldName, value) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));

        // Only validate if field has been touched
        if (touched[fieldName]) {
            const error = validate(fieldName, value);
            setErrors(prev => ({ ...prev, [fieldName]: error }));
        }
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const error = validate(fieldName, values[fieldName]);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    const validateAll = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(fieldName => {
            const error = validate(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(Object.keys(validationRules).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {}));

        return isValid;
    };

    const resetForm = (newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        resetForm,
        setValues
    };
};

// Common validation rules
export const validationRules = {
    required: (fieldLabel) => (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return `${fieldLabel} es requerido`;
        }
        return null;
    },

    minValue: (min, fieldLabel) => (value) => {
        if (value !== '' && Number(value) < min) {
            return `${fieldLabel} debe ser mayor o igual a ${min}`;
        }
        return null;
    },

    maxValue: (max, fieldLabel) => (value) => {
        if (value !== '' && Number(value) > max) {
            return `${fieldLabel} debe ser menor o igual a ${max}`;
        }
        return null;
    },

    minLength: (min, fieldLabel) => (value) => {
        if (value && value.length < min) {
            return `${fieldLabel} debe tener al menos ${min} caracteres`;
        }
        return null;
    },

    email: (fieldLabel) => (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return `${fieldLabel} debe ser un email válido`;
        }
        return null;
    },

    positiveNumber: (fieldLabel) => (value) => {
        if (value !== '' && (isNaN(value) || Number(value) <= 0)) {
            return `${fieldLabel} debe ser un número positivo`;
        }
        return null;
    }
};

export default useFormValidation;
