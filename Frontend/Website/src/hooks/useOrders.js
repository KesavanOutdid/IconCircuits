import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

const API_URL = process.env.REACT_APP_API_URL;

export const useOrders = () => {
    const { user, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!user?.userId || !token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_URL}/orders/list`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            if (data.success) {
                setOrders(data.data.orders || []);
            } else {
                throw new Error(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, token]);

    const getOrderById = useCallback(
        async (orderId) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_URL}/orders/${orderId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }

                const data = await response.json();
                if (data.success) {
                    return data.data.order;
                } else {
                    throw new Error(data.message || 'Failed to fetch order');
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

    const cancelOrder = useCallback(
        async (orderId, reason) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_URL}/orders/cancel`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            orderId,
                            reason,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to cancel order');
                }

                const data = await response.json();
                if (data.success) {
                    setOrders(prev =>
                        prev.map(order =>
                            order.orderId === orderId
                                ? {
                                    ...order,
                                    orderStatus: 'cancelled',
                                    cancellationReason: reason,
                                }
                                : order
                        )
                    );
                    return data;
                } else {
                    throw new Error(data.message || 'Failed to cancel order');
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
        orders,
        isLoading,
        error,
        fetchOrders,
        getOrderById,
        cancelOrder,
    };
};
