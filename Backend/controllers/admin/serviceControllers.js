const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const getServicesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('services');
};

const getServiceRequestsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('serviceRequests');
};

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
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

const getAllServiceRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const usersCollection = await getUsersCollection();
        
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (userId) {
            filter.userId = userId;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const totalCount = await serviceRequestsCollection.countDocuments(filter);
        
        const serviceRequests = await serviceRequestsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .toArray();

        const enrichedRequests = await Promise.all(
            serviceRequests.map(async (request) => {
                const user = await usersCollection.findOne(
                    { userId: request.userId },
                    { projection: { password: 0 } }
                );
                return {
                    ...request,
                    userDetails: user || null,
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: 'Service requests fetched successfully',
            data: {
                serviceRequests: enrichedRequests,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Fetching all service requests failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getServiceRequestByIdAdmin = async (req, res) => {
    try {
        const { requestId } = req.params;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const usersCollection = await getUsersCollection();

        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        const user = await usersCollection.findOne(
            { userId: serviceRequest.userId },
            { projection: { password: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Service request fetched successfully',
            data: {
                ...serviceRequest,
                userDetails: user || null,
            },
        });
    } catch (error) {
        console.error('Fetching service request failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateServiceRequestStatus = async (req, res) => {
    try {
        const { userEmail } = req;
        const { requestId } = req.params;
        const { status, adminResponse } = req.body;

        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status (accepted/rejected) is required',
            });
        }

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        if (serviceRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot update status. Current status is ${serviceRequest.status}`,
            });
        }

        const timestamp = new Date();
        const updateData = {
            status: status,
            adminResponse: adminResponse || null,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp,
        };

        await serviceRequestsCollection.updateOne(
            { requestId: requestId },
            { $set: updateData }
        );

        const updatedRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        return res.status(200).json({
            success: true,
            message: `Service request ${status} successfully`,
            data: updatedRequest,
        });
    } catch (error) {
        console.error('Updating service request status failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const markServiceRequestCompleted = async (req, res) => {
    try {
        const { userEmail } = req;
        const { requestId } = req.params;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        if (serviceRequest.status !== 'accepted') {
            return res.status(400).json({
                success: false,
                message: `Cannot mark as completed. Current status is ${serviceRequest.status}`,
            });
        }

        const timestamp = new Date();
        const updateData = {
            status: 'completed',
            completedAt: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp,
        };

        await serviceRequestsCollection.updateOne(
            { requestId: requestId },
            { $set: updateData }
        );

        const updatedRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        return res.status(200).json({
            success: true,
            message: 'Service request marked as completed successfully',
            data: updatedRequest,
        });
    } catch (error) {
        console.error('Marking service request as completed failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const downloadRequestFile = async (req, res) => {
    try {
        const { requestId, filename } = req.params;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
        });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        const file = serviceRequest.files?.find(f => f.filename === filename);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }

        const path = require('path');
        const filePath = path.resolve(file.path);
        
        res.download(filePath, file.originalName, (err) => {
            if (err) {
                console.error('File download error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error downloading file',
                });
            }
        });
    } catch (error) {
        console.error('Download file failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    createService,
    getService,
    getServices,
    updateService,
    deleteService,
    getAllServiceRequests,
    getServiceRequestByIdAdmin,
    updateServiceRequestStatus,
    markServiceRequestCompleted,
    downloadRequestFile,
};
