const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const database = require('../../config/db');

const getQuotationsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('quotations');
};

const addHistoryEntry = (quotation, action, reason, updatedBy, additionalData = {}) => {
    const historyEntry = {
        action,
        reason: reason || null,
        status: quotation.status,
        updatedBy,
        updatedAt: new Date(),
        ...additionalData
    };
    
    if (!quotation.history) {
        quotation.history = [];
    }
    quotation.history.push(historyEntry);
};

const createQuotation = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { 
            service_id, 
            service_code, 
            service_name, 
            pcb_name, 
            config, 
            description
        } = req.body;

        if (!service_id || !service_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'service_id and service_name are required' 
            });
        }

        let parsedConfig = {};
        if (config) {
            try {
                parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
            } catch (e) {
                parsedConfig = {};
            }
        }

        const uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            if (req.files.length > 5) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Maximum 5 files allowed' 
                });
            }

            req.files.forEach(file => {
                uploadedFiles.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: new Date()
                });
            });
        }

        const quotationsCollection = await getQuotationsCollection();
        const quotationId = uuidv4();
        const timestamp = new Date();

        const quotationDocument = {
            quotation_id: quotationId,
            user_id: userEmail,
            userId: userId,
            service_id: service_id,
            service_code: service_code || null,
            service_name: service_name.trim(),
            pcb_name: pcb_name ? pcb_name.trim() : null,
            config: parsedConfig,
            description: description ? description.trim() : null,
            files: uploadedFiles,
            status: 'pending',
            quoted_amount: null,
            admin_reason: null,
            user_reason: null,
            history: [],
            createdBy: userEmail,
            createdTime: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        addHistoryEntry(quotationDocument, 'created', 'Quotation created by user', userEmail);

        const insertResult = await quotationsCollection.insertOne(quotationDocument);

        return res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: {
                _id: insertResult.insertedId,
                quotation_id: quotationId,
                ...quotationDocument
            },
        });
    } catch (error) {
        console.error('Create quotation failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getUserQuotations = async (req, res) => {
    try {
        const { userId: authUserId } = req;
        const { userId: queryUserId, status, page = 1, limit = 10 } = req.query;

        let targetUserId = queryUserId || authUserId;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const filter = { userId: targetUserId };
        if (status) {
            filter.status = status;
        }

        const quotationsCollection = await getQuotationsCollection();
        
        const totalQuotations = await quotationsCollection.countDocuments(filter);
        
        const quotations = await quotationsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Quotations retrieved successfully',
            data: {
                quotations: quotations,
                pagination: {
                    total: totalQuotations,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalQuotations / limitNum)
                }
            }
        });
    } catch (error) {
        console.error('Get quotations failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getQuotationById = async (req, res) => {
    try {
        const { userId } = req;
        const { quotationId } = req.params;

        if (!quotationId) {
            return res.status(400).json({ success: false, message: 'quotationId is required' });
        }

        const quotationsCollection = await getQuotationsCollection();
        const quotation = await quotationsCollection.findOne({ 
            quotation_id: quotationId,
            userId: userId 
        });

        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Quotation retrieved successfully',
            data: quotation,
        });
    } catch (error) {
        console.error('Get quotation failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateQuotation = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { quotationId } = req.params;
        const { 
            action,
            pcb_name, 
            config, 
            description,
            reason
        } = req.body;

        if (!quotationId) {
            return res.status(400).json({ success: false, message: 'quotationId is required' });
        }

        if (!action) {
            return res.status(400).json({ success: false, message: 'action is required (update/accept/requote/reject)' });
        }

        const quotationsCollection = await getQuotationsCollection();
        const quotation = await quotationsCollection.findOne({ 
            quotation_id: quotationId,
            userId: userId 
        });

        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        const timestamp = new Date();
        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp
        };

        if (action === 'update') {
            if (quotation.status !== 'pending' && quotation.status !== 'requote_requested') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only update quotations with pending or requote_requested status' 
                });
            }

            if (pcb_name !== undefined) {
                updateData.pcb_name = pcb_name ? pcb_name.trim() : null;
            }

            if (config !== undefined) {
                try {
                    updateData.config = typeof config === 'string' ? JSON.parse(config) : config;
                } catch (e) {
                    updateData.config = config;
                }
            }

            if (description !== undefined) {
                updateData.description = description ? description.trim() : null;
            }

            if (req.files && req.files.length > 0) {
                if (req.files.length > 5) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Maximum 5 files allowed' 
                    });
                }

                const uploadedFiles = [];
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
                updateData.files = uploadedFiles;
            }

            addHistoryEntry(quotation, 'updated', reason || 'Quotation updated by user', userEmail, {
                updatedFields: Object.keys(updateData)
            });
            updateData.history = quotation.history;

        } else if (action === 'accept') {
            if (quotation.status !== 'quoted') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only accept quotations with quoted status' 
                });
            }

            if (!quotation.quoted_amount) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Admin has not provided a quote yet' 
                });
            }

            updateData.status = 'accepted';
            updateData.user_reason = reason || 'User accepted the quotation';

            addHistoryEntry(quotation, 'accepted_by_user', reason || 'User accepted the quotation', userEmail, {
                quoted_amount: quotation.quoted_amount
            });
            updateData.history = quotation.history;

        } else if (action === 'requote') {
            if (quotation.status !== 'quoted') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only request requote for quoted quotations' 
                });
            }

            if (!reason || !reason.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Reason is required for requesting requote' 
                });
            }

            updateData.status = 'requote_requested';
            updateData.user_reason = reason.trim();

            addHistoryEntry(quotation, 'requote_requested', reason.trim(), userEmail);
            updateData.history = quotation.history;

        } else if (action === 'reject') {
            if (quotation.status !== 'quoted' && quotation.status !== 'pending') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Can only reject quotations with quoted or pending status' 
                });
            }

            if (!reason || !reason.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Reason is required for rejecting quotation' 
                });
            }

            updateData.status = 'rejected';
            updateData.user_reason = reason.trim();

            addHistoryEntry(quotation, 'rejected_by_user', reason.trim(), userEmail);
            updateData.history = quotation.history;

        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Allowed: update/accept/requote/reject' 
            });
        }

        await quotationsCollection.updateOne(
            { quotation_id: quotationId, userId: userId },
            { $set: updateData }
        );

        const updatedQuotation = await quotationsCollection.findOne({ quotation_id: quotationId });

        const messages = {
            update: 'Quotation updated successfully',
            accept: 'Quotation accepted successfully',
            requote: 'Requote requested successfully',
            reject: 'Quotation rejected successfully'
        };

        return res.status(200).json({
            success: true,
            message: messages[action],
            data: updatedQuotation,
        });
    } catch (error) {
        console.error('Update quotation failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    createQuotation,
    getUserQuotations,
    getQuotationById,
    updateQuotation,
};
