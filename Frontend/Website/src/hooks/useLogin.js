import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
    const { login, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
        if (validationErrors[id]) {
            setValidationErrors({
                ...validationErrors,
                [id]: '',
            });
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.email) errors.email = 'Please enter email address';
        if (!formData.password) errors.password = 'Please enter password';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter valid email address';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return { success: false, error: null };
        }

        try {
            await login(formData.email, formData.password);
            return { success: true, error: null };
        } catch (err) {
            const errorMsg = err.message || 'Login failed';
            setValidationErrors({ submit: errorMsg });
            return { success: false, error: errorMsg };
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const resetForm = () => {
        setFormData({ email: '', password: '' });
        setValidationErrors({});
    };

    return {
        formData,
        showPassword,
        isLoading,
        error,
        validationErrors,
        handleChange,
        handleSubmit,
        togglePasswordVisibility,
        resetForm,
    };
};
