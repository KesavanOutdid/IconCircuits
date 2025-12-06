import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;

export const useProfile = () => {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        if (!user?.userId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_URL}/auth/getprofile?userId=${user.userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, token]);

    const updateProfile = useCallback(
        async (profileData) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/auth/updateprofile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(profileData),
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                const data = await response.json();
                if (data.success) {
                    setProfile(data.data);
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to update profile');
                }
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [token]
    );

    return {
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
    };
};
