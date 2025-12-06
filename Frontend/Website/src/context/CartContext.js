import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const CartContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartSummary, setCartSummary] = useState({ totalItems: 0, totalValue: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async (token) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/cart/getcart`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }

            const data = await response.json();
            if (data.success && data.data) {
                setCartItems(data.data.items || []);
                setCartSummary(data.data.summary || { totalItems: 0, totalValue: 0 });
            }
        } catch (err) {
            setError(err.message);
            console.error('Cart fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart(token);
        } else {
            setCartItems([]);
            setCartSummary({ totalItems: 0, totalValue: 0 });
        }
    }, [fetchCart]);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            if (token) {
                fetchCart(token);
            } else {
                setCartItems([]);
                setCartSummary({ totalItems: 0, totalValue: 0 });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchCart]);

    const removeCart = useCallback(async (cartId, token) => {
        try {
            const response = await fetch(`${API_URL}/cart/removecart/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }

            const data = await response.json();
            if (data.success) {
                setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
                setCartSummary(prev => ({
                    totalItems: Math.max(0, prev.totalItems - 1),
                    totalValue: Math.max(0, prev.totalValue - (data.data?.price || 0))
                }));
                return data;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const clearCart = useCallback(async (token) => {
        try {
            const response = await fetch(`${API_URL}/cart/clearcart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }

            const data = await response.json();
            if (data.success) {
                setCartItems([]);
                setCartSummary({ totalItems: 0, totalValue: 0 });
                return data;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateCart = useCallback(async (cartId, updateData, token) => {
        try {
            const response = await fetch(`${API_URL}/cart/updatecart/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: updateData,
            });

            if (!response.ok) {
                throw new Error('Failed to update cart');
            }

            const data = await response.json();
            if (data.success) {
                setCartItems(prev =>
                    prev.map(item =>
                        item.cart_id === cartId ? { ...item, ...data.data } : item
                    )
                );
                return data;
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const clearCartLocal = useCallback(() => {
        setCartItems([]);
        setCartSummary({ totalItems: 0, totalValue: 0 });
    }, []);

    const value = {
        cartItems,
        cartSummary,
        loading,
        error,
        setError,
        fetchCart,
        removeCart,
        clearCart,
        updateCart,
        setCartItems,
        clearCartLocal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
