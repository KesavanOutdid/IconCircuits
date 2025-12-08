const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const getServicesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('services');
};



const createService = async (req, res) => {
    try {
        const { userEmail } = req;
        const body = req.body;

        if (!body.name || !body.code) {
            return res.status(400).json({ success: false, message: 'Service name and code are required' });
        }

        const servicesCollection = await getServicesCollection();
        
        const existingService = await servicesCollection.findOne({ code: body.code.trim().toUpperCase() });
        if (existingService) {
            return res.status(400).json({ success: false, message: `Service code "${body.code}" already exists` });
        }

        const serviceId = uuidv4();
        const now = new Date();

        const serviceDoc = {
            service_id: serviceId,
            name: body.name.trim(),
            code: body.code.trim().toUpperCase(),
            description: body.description ? body.description.trim() : '',
            category: body.category ? body.category.trim() : '',
            type: body.type ? body.type.trim() : '',
            base_price: body.base_price ? Number(body.base_price) : 0,
            status: body.status !== undefined ? Boolean(body.status) : true,
            config: body.config || {},
            createdBy: userEmail,
            createdTime: now,
            modifiedBy: userEmail,
            modifiedTime: now,
            createdAt: now,
            updatedAt: now
        };

        await servicesCollection.insertOne(serviceDoc);

        return res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: serviceDoc
        });
    } catch (error) {
        console.error('Creating service failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'serviceId param is required' });
        }

        const servicesCollection = await getServicesCollection();
        const service = await servicesCollection.findOne({ service_id: serviceId });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Service retrieved successfully',
            data: service
        });
    } catch (error) {
        console.error('Getting service failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getServices = async (req, res) => {
    try {
        const { page, limit, skip } = req.pagination;
        const { status, category, search } = req.query;

        const filter = {};

        if (status !== undefined) {
            filter.status = status === 'true';
        }

        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const servicesCollection = await getServicesCollection();
        const total = await servicesCollection.countDocuments(filter);
        const services = await servicesCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        req.paginationTotal = total;

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

const updateService = async (req, res) => {
    try {
        const { userEmail } = req;
        const { serviceId } = req.params;
        const body = req.body;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'serviceId param is required' });
        }

        const servicesCollection = await getServicesCollection();
        const service = await servicesCollection.findOne({ service_id: serviceId });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const now = new Date();
        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: now,
            updatedAt: now
        };

        if (body.name && body.name.trim()) {
            updateData.name = body.name.trim();
        }

        if (body.description !== undefined) {
            updateData.description = body.description ? body.description.trim() : '';
        }

        if (body.category !== undefined) {
            updateData.category = body.category ? body.category.trim() : '';
        }

        if (body.type !== undefined) {
            updateData.type = body.type ? body.type.trim() : '';
        }

        if (body.base_price !== undefined) {
            updateData.base_price = Number(body.base_price);
        }

        if (body.status !== undefined) {
            updateData.status = Boolean(body.status);
        }

        if (body.config !== undefined) {
            updateData.config = body.config;
        }

        await servicesCollection.updateOne(
            { service_id: serviceId },
            { $set: updateData }
        );

        const updatedService = await servicesCollection.findOne({ service_id: serviceId });

        return res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
        });
    } catch (error) {
        console.error('Updating service failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'serviceId param is required' });
        }

        const servicesCollection = await getServicesCollection();
        const result = await servicesCollection.deleteOne({ service_id: serviceId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Deleting service failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    createService,
    getService,
    getServices,
    updateService,
    deleteService,
};
