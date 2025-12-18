import { useMemo } from 'react';

const TAX_RATE = 0.18;

export const usePriceCalculation = (selections, config, basePrice) => {
    const pricing = useMemo(() => {
        if (!selections || !config) return null;

        const BASE_PRICE = basePrice || 100;
        let multiplier = 1;

        if (config.layers && selections.layers) {
            multiplier *= config.layers.multiplier[selections.layers] || 1;
        }

        if (config.components && selections.components && Object.keys(config.components.multiplier || {}).length > 0) {
            multiplier *= config.components.multiplier[selections.components] || 1;
        }

        if (config.controlled_impedance) {
            const impedanceValue = selections.controlled_impedance ? 'true' : 'false';
            multiplier *= config.controlled_impedance.multiplier[impedanceValue] || 1;
        }

        if (config.lead_time_days && selections.lead_time && Object.keys(config.lead_time_days.multiplier || {}).length > 0) {
            multiplier *= config.lead_time_days.multiplier[selections.lead_time] || 1;
        }

        if (config.pcb_type && selections.pcb_type && Object.keys(config.pcb_type.multiplier || {}).length > 0) {
            multiplier *= config.pcb_type.multiplier[selections.pcb_type] || 1;
        }

        if (selections.pcb_type === 'flex') {
            if (config.material && selections.material && Object.keys(config.material.multiplier || {}).length > 0) {
                multiplier *= config.material.multiplier[selections.material] || 1;
            }

            if (config.surface_finish && selections.surface_finish && Object.keys(config.surface_finish.multiplier || {}).length > 0) {
                multiplier *= config.surface_finish.multiplier[selections.surface_finish] || 1;
            }

            if (config.fpc_thickness && selections.fpc_thickness && Object.keys(config.fpc_thickness.multiplier || {}).length > 0) {
                multiplier *= config.fpc_thickness.multiplier[selections.fpc_thickness] || 1;
            }
        }

        const orderValue = Math.round(BASE_PRICE * multiplier);
        const tax = Math.round(orderValue * TAX_RATE);
        const totalPrice = orderValue + tax;

        let shipmentDate = new Date();
        if (selections.lead_time) {
            const leadDays = parseInt(selections.lead_time);
            shipmentDate.setDate(shipmentDate.getDate() + leadDays);
        }

        return {
            orderValue,
            tax,
            totalPrice,
            shipmentDate: shipmentDate.toLocaleDateString('en-GB'),
            multiplier,
        };
    }, [selections, config, basePrice]);

    return pricing;
};
