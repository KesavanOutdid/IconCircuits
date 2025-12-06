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
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }

        try {
            await login(formData.email, formData.password);
            return true;
        } catch (err) {
            setValidationErrors({ submit: error || 'Login failed' });
            return false;
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
