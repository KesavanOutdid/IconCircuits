const database = require('../../config/db');

const getServicesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('services');
};

const getAllServices = async (req, res) => {
    try {
        const { status, category } = req.query;

        const filter = {};

        if (status !== undefined) {
            filter.status = status === 'true';
        }

        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        const servicesCollection = await getServicesCollection();
        const services = await servicesCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Services retrieved successfully',
            data: services
        });
    } catch (error) {
        console.error('Getting services failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllServices,
};
