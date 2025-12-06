import { useMemo } from 'react';

const BASE_PRICE = 5000;
const TAX_RATE = 0.18;

export const usePriceCalculation = (selections, config) => {
    const pricing = useMemo(() => {
        if (!selections || !config) return null;

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
    }, [selections, config]);

    return pricing;
};
