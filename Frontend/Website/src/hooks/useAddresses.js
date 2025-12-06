import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;

export const useAddresses = () => {
    const { token } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addAddress = useCallback(
        async (addressData) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/auth/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(addressData),
                });

                if (!response.ok) {
                    throw new Error('Failed to add address');
                }

                const data = await response.json();
                if (data.success) {
                    if (addresses.find(a => a._id === data.data._id)) {
                        setAddresses(addresses.map(a => (a._id === data.data._id ? data.data : a)));
                    } else {
                        setAddresses([...addresses, data.data]);
                    }
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to add address');
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [token, addresses]
    );

    const updateAddress = useCallback(
        async (addressId, addressData) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/auth/addresses/${addressId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(addressData),
                });

                if (!response.ok) {
                    throw new Error('Failed to update address');
                }

                const data = await response.json();
                if (data.success) {
                    setAddresses(addresses.map(a => (a._id === addressId ? data.data : a)));
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update address');
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [token, addresses]
    );

    const deleteAddress = useCallback(
        async (addressId) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/auth/addresses/${addressId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete address');
                }

                const data = await response.json();
                if (data.success) {
                    setAddresses(addresses.filter(a => a._id !== addressId));
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to delete address');
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [token, addresses]
    );

    const deleteAddressType = useCallback(
        async (addressId, type) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/auth/addresses/${addressId}/type/${type}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete address type');
                }

                const data = await response.json();
                if (data.success) {
                    setAddresses(
                        addresses.map(a => {
                            if (a._id === addressId && a.type) {
                                return {
                                    ...a,
                                    type: Array.isArray(a.type) 
                                        ? a.type.filter(t => t !== type)
                                        : (a.type !== type ? a.type : null),
                                };
                            }
                            return a;
                        })
                    );
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to delete address type');
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [token, addresses]
    );

    const setAddressesList = useCallback((addressesList) => {
        setAddresses(addressesList);
    }, []);

    return {
        addresses,
        isLoading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        deleteAddressType,
        setAddressesList,
    };
};
