import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useRegister = () => {
    const { signup, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        roleId: 2,
        address: {
            street: '',
            city: '',
            location: '',
            district: '',
            state: '',
            country: 'India',
            pincode: '',
        },
    });
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id.includes('address.')) {
            const addressField = id.split('.')[1];
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    [addressField]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [id]: value,
            });
        }
        if (validationErrors[id]) {
            setValidationErrors({
                ...validationErrors,
                [id]: '',
            });
        }
    };

    const validateStep1 = () => {
        const errors = {};
        
        if (!formData.name) errors.name = 'Please enter full name';
        if (!formData.email) errors.email = 'Please enter email address';
        if (!formData.password) errors.password = 'Please enter password';
        if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm password';
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter valid email address';
        }
        
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return errors;
    };

    const validateStep2 = () => {
        const errors = {};
        const { street, city, district, state, pincode } = formData.address;

        if (!formData.phone) errors.phone = 'Please enter phone number';
        if (!street) errors['address.street'] = 'Please enter street address';
        if (!city) errors['address.city'] = 'Please enter city';
        if (!district) errors['address.district'] = 'Please enter district';
        if (!state) errors['address.state'] = 'Please enter state';
        if (!pincode) errors['address.pincode'] = 'Please enter pincode';

        if (pincode && !/^\d{6}$/.test(pincode)) {
            errors['address.pincode'] = 'Pincode must be 6 digits';
        }

        return errors;
    };

    const handleNextStep = () => {
        const errors = validateStep1();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }
        setValidationErrors({});
        setCurrentStep(2);
        return true;
    };

    const handlePrevStep = () => {
        setCurrentStep(1);
        setValidationErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateStep2();

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return false;
        }

        try {
            await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                roleId: formData.roleId,
                address: formData.address,
            });
            return true;
        } catch (err) {
            setValidationErrors({ submit: error || 'Registration failed' });
            return false;
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            roleId: 2,
            address: {
                street: '',
                city: '',
                location: '',
                district: '',
                state: '',
                country: 'India',
                pincode: '',
            },
        });
        setCurrentStep(1);
        setValidationErrors({});
    };

    return {
        formData,
        showPassword,
        currentStep,
        isLoading,
        error,
        validationErrors,
        handleChange,
        handleNextStep,
        handlePrevStep,
        handleSubmit,
        togglePasswordVisibility,
        resetForm,
    };
};
