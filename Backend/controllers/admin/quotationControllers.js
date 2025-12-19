const { ObjectId } = require('mongodb');
const database = require('../../config/db');

const getQuotationsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('quotations');
};

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
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

const getAllQuotations = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;

        const quotationsCollection = await getQuotationsCollection();
        const usersCollection = await getUsersCollection();
        
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (userId) {
            const userIdInt = parseInt(userId, 10);
            filter.userId = isNaN(userIdInt) ? userId : userIdInt;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const totalCount = await quotationsCollection.countDocuments(filter);
        
        const quotations = await quotationsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .toArray();

        const enrichedQuotations = await Promise.all(
            quotations.map(async (quotation) => {
                const numericUserId = Number(quotation.userId);
                const searchCriteria = isNaN(numericUserId) ? { userId: quotation.userId } : { userId: numericUserId };
                const user = await usersCollection.findOne(
                    searchCriteria,
                    { projection: { password: 0 } }
                );
                return {
                    ...quotation,
                    userDetails: user || null,
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: 'Quotations fetched successfully',
            data: {
                quotations: enrichedQuotations,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Fetching all quotations failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getQuotationById = async (req, res) => {
    try {
        const { quotationId } = req.params;

        const quotationsCollection = await getQuotationsCollection();
        const usersCollection = await getUsersCollection();

        const quotation = await quotationsCollection.findOne({
            quotation_id: quotationId,
        });

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const numericUserId = Number(quotation.userId);
        const searchCriteria = isNaN(numericUserId) ? { userId: quotation.userId } : { userId: numericUserId };
        const user = await usersCollection.findOne(
            searchCriteria,
            { projection: { password: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Quotation fetched successfully',
            data: {
                ...quotation,
                userDetails: user || null,
            },
        });
    } catch (error) {
        console.error('Fetching quotation failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateQuotation = async (req, res) => {
    try {
        const { userEmail } = req;
        const { quotationId } = req.params;
        const { action, quoted_amount, reason } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'action is required (quote/accept/reject/cancel)',
            });
        }

        const quotationsCollection = await getQuotationsCollection();
        const quotation = await quotationsCollection.findOne({
            quotation_id: quotationId,
        });

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found',
            });
        }

        const timestamp = new Date();
        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp
        };

        if (action === 'quote') {
            if (!quoted_amount || quoted_amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid quoted_amount is required',
                });
            }

            if (!reason || !reason.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Reason is required for quoting price',
                });
            }

            if (quotation.status !== 'pending' && quotation.status !== 'requote_requested') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only quote for pending or requote_requested quotations',
                });
            }

            updateData.status = 'quoted';
            updateData.quoted_amount = Number(quoted_amount);
            updateData.admin_reason = reason.trim();

            addHistoryEntry(quotation, 'quoted_by_admin', reason.trim(), userEmail, {
                quoted_amount: Number(quoted_amount)
            });
            updateData.history = quotation.history;

        } else if (action === 'accept') {
            if (quotation.status !== 'requote_requested') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only accept requote_requested quotations',
                });
            }

            updateData.status = 'pending';
            updateData.admin_reason = reason || 'Admin accepted user requote request';

            addHistoryEntry(quotation, 'accepted_by_admin', reason || 'Admin accepted user requote request', userEmail);
            updateData.history = quotation.history;

        } else if (action === 'reject') {
            if (!reason || !reason.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Reason is required for rejecting quotation',
                });
            }

            if (quotation.status === 'rejected' || quotation.status === 'paid' || quotation.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reject quotation in current status',
                });
            }

            updateData.status = 'rejected';
            updateData.admin_reason = reason.trim();

            addHistoryEntry(quotation, 'rejected_by_admin', reason.trim(), userEmail);
            updateData.history = quotation.history;

        } else if (action === 'cancel') {
            if (!reason || !reason.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Reason is required for cancelling quotation',
                });
            }

            if (quotation.status === 'paid' || quotation.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel quotation in current status',
                });
            }

            updateData.status = 'cancelled';
            updateData.admin_reason = reason.trim();

            addHistoryEntry(quotation, 'cancelled_by_admin', reason.trim(), userEmail);
            updateData.history = quotation.history;

        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Allowed: quote/accept/reject/cancel',
            });
        }

        await quotationsCollection.updateOne(
            { quotation_id: quotationId },
            { $set: updateData }
        );

        const updatedQuotation = await quotationsCollection.findOne({
            quotation_id: quotationId,
        });

        const messages = {
            quote: 'Price quoted successfully',
            accept: 'User requote request accepted successfully',
            reject: 'Quotation rejected successfully',
            cancel: 'Quotation cancelled successfully'
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
    getAllQuotations,
    getQuotationById,
    updateQuotation,
};
