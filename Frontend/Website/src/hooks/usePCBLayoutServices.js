import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export const usePCBLayoutServices = () => {
    const [services, setServices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/services`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const data = await response.json();
                if (data.success && data.data) {
                    const pcbLayoutService = data.data.find(service => 
                        service.code === 'PCB_LAYOU' || 
                        service.code === 'PCB_LAY' || 
                        service.code?.includes('PCB LAYOUT') || 
                        service.name?.toLowerCase().includes('pcb layout')
                    );
                    setServices(pcbLayoutService || null);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return { services, loading, error };
};
