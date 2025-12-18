const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const getServiceRequestsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('serviceRequests');
};

const getCartsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('carts');
};

const createServiceRequest = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { serviceId, serviceName, description, details } = req.body;

        if (!serviceId || !serviceName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Service ID and Service Name are required' 
            });
        }

        let parsedDetails = {};
        if (details) {
            try {
                parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
            } catch (e) {
                parsedDetails = {};
            }
        }

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const requestId = uuidv4();
        const timestamp = new Date();

        const uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                uploadedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: timestamp
                });
            });
        }

        const serviceRequestDocument = {
            requestId: requestId,
            userId: userId,
            userEmail: userEmail,
            serviceId: serviceId,
            serviceName: serviceName.trim(),
            description: description ? description.trim() : null,
            details: parsedDetails,
            files: uploadedFiles,
            status: 'pending',
            adminResponse: null,
            completedAt: null,
            createdBy: userEmail,
            createdTime: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const insertResult = await serviceRequestsCollection.insertOne(serviceRequestDocument);

        return res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: {
                _id: insertResult.insertedId,
                requestId: requestId,
                serviceId: serviceRequestDocument.serviceId,
                serviceName: serviceRequestDocument.serviceName,
                description: serviceRequestDocument.description,
                details: serviceRequestDocument.details,
                files: uploadedFiles,
                status: serviceRequestDocument.status,
                createdAt: serviceRequestDocument.createdAt,
            },
        });
    } catch (error) {
        console.error('Create service request failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getUserServiceRequests = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { page = 1, limit = 10, status } = req.query;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        
        const filter = { userEmail: userEmail };
        if (status) {
            filter.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const totalCount = await serviceRequestsCollection.countDocuments(filter);
        
        const serviceRequests = await serviceRequestsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Service requests fetched successfully',
            data: {
                serviceRequests,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Fetching user service requests failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getServiceRequestById = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { requestId } = req.params;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
            userEmail: userEmail,
        });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Service request fetched successfully',
            data: serviceRequest,
        });
    } catch (error) {
        console.error('Fetching service request failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { requestId, filename } = req.params;

        const serviceRequestsCollection = await getServiceRequestsCollection();
        const serviceRequest = await serviceRequestsCollection.findOne({
            requestId: requestId,
            userEmail: userEmail,
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

const checkoutCart = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { cartIds } = req.body;

        if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'cartIds array is required and must not be empty' 
            });
        }

        const cartsCollection = await getCartsCollection();
        const serviceRequestsCollection = await getServiceRequestsCollection();

        const cartItems = await cartsCollection
            .find({ 
                cart_id: { $in: cartIds },
                userId: userId 
            })
            .toArray();

        if (cartItems.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No cart items found' 
            });
        }

        const createdOrders = [];
        const timestamp = new Date();

        for (const cartItem of cartItems) {
            const requestId = uuidv4();

            const orderFiles = [];
            if (cartItem.files) {
                if (cartItem.files.schematic) {
                    orderFiles.push({
                        ...cartItem.files.schematic,
                        fieldName: 'schematic'
                    });
                }
                if (cartItem.files.bom) {
                    orderFiles.push({
                        ...cartItem.files.bom,
                        fieldName: 'bom'
                    });
                }
            }

            const serviceRequestDocument = {
                requestId: requestId,
                userId: userId,
                userEmail: userEmail,
                serviceId: cartItem.service_id,
                serviceName: cartItem.service_name,
                serviceCode: cartItem.service_code || null,
                pcbName: cartItem.pcb_name || null,
                description: `Order from cart - ${cartItem.service_name}`,
                details: {
                    config: cartItem.config || {},
                    lead_time: cartItem.lead_time,
                    order_value: cartItem.order_value,
                    tax: cartItem.tax,
                    total_price: cartItem.total_price,
                    shipment_date: cartItem.shipment_date
                },
                files: orderFiles,
                status: 'pending',
                adminResponse: null,
                completedAt: null,
                createdBy: userEmail,
                createdTime: timestamp,
                modifiedBy: userEmail,
                modifiedTime: timestamp,
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            const insertResult = await serviceRequestsCollection.insertOne(serviceRequestDocument);
            
            createdOrders.push({
                _id: insertResult.insertedId,
                requestId: requestId,
                serviceId: serviceRequestDocument.serviceId,
                serviceName: serviceRequestDocument.serviceName,
                total_price: cartItem.total_price
            });
        }

        await cartsCollection.deleteMany({ 
            cart_id: { $in: cartIds },
            userId: userId 
        });

        return res.status(201).json({
            success: true,
            message: `${createdOrders.length} order(s) created successfully`,
            data: {
                orders: createdOrders,
                totalOrders: createdOrders.length
            },
        });
    } catch (error) {
        console.error('Checkout cart failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    createServiceRequest,
    getUserServiceRequests,
    getServiceRequestById,
    downloadFile,
    checkoutCart,
};
