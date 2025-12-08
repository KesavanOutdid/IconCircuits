const { ObjectId } = require('mongodb');
const database = require('../../config/db');

const getOrdersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('orders');
};

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;

        const ordersCollection = await getOrdersCollection();
        const usersCollection = await getUsersCollection();
        
        const filter = {};
        if (status) {
            filter.orderStatus = status;
        }
        if (userId) {
            const userIdInt = parseInt(userId, 10);
            filter.userId = isNaN(userIdInt) ? userId : userIdInt;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const totalCount = await ordersCollection.countDocuments(filter);
        
        const orders = await ordersCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .toArray();

        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const numericUserId = Number(order.userId);
                const searchCriteria = isNaN(numericUserId) ? { userId: order.userId } : { userId: numericUserId };
                const user = await usersCollection.findOne(
                    searchCriteria,
                    { projection: { password: 0 } }
                );
                return {
                    ...order,
                    userDetails: user || null,
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: {
                orders: enrichedOrders,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Fetching all orders failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getOrderByIdAdmin = async (req, res) => {
    try {
        const { requestId } = req.params;

        const ordersCollection = await getOrdersCollection();
        const usersCollection = await getUsersCollection();

        const order = await ordersCollection.findOne({
            orderId: requestId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const numericUserId = Number(order.userId);
        const searchCriteria = isNaN(numericUserId) ? { userId: order.userId } : { userId: numericUserId };
        const user = await usersCollection.findOne(
            searchCriteria,
            { projection: { password: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: {
                ...order,
                userDetails: user || null,
            },
        });
    } catch (error) {
        console.error('Fetching order failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// const updateOrderStatus = async (req, res) => {
//     try {
//         const { userEmail } = req;
//         const { requestId } = req.params;
//         const { status, adminResponse } = req.body;

//         if (!status || !['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid status (processing/shipped/delivered/cancelled) is required',
//             });
//         }

//         const ordersCollection = await getOrdersCollection();
//         const order = await ordersCollection.findOne({
//             orderId: requestId,
//         });

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found',
//             });
//         }

//         const timestamp = new Date();
//         const updateData = {
//             orderStatus: status,
//             adminResponse: adminResponse || null,
//             modifiedBy: userEmail,
//             modifiedTime: timestamp,
//             updatedAt: timestamp,
//         };

//         await ordersCollection.updateOne(
//             { orderId: requestId },
//             { $set: updateData }
//         );

//         const updatedOrder = await ordersCollection.findOne({
//             orderId: requestId,
//         });

//         return res.status(200).json({
//             success: true,
//             message: `Order status updated to ${status} successfully`,
//             data: updatedOrder,
//         });
//     } catch (error) {
//         console.error('Updating order status failed:', error);
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };

const markOrderCompleted = async (req, res) => {
    try {
        const { userEmail } = req;
        const { requestId } = req.params;

        const ordersCollection = await getOrdersCollection();
        const order = await ordersCollection.findOne({
            orderId: requestId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const timestamp = new Date();
        const updateData = {
            orderStatus: 'completed',
            completedAt: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp,
        };

        await ordersCollection.updateOne(
            { orderId: requestId },
            { $set: updateData }
        );

        const updatedOrder = await ordersCollection.findOne({
            orderId: requestId,
        });

        return res.status(200).json({
            success: true,
            message: 'Order marked as completed successfully',
            data: updatedOrder,
        });
    } catch (error) {
        console.error('Marking order as completed failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllOrders,
    getOrderByIdAdmin,
    // updateOrderStatus,
    markOrderCompleted,
};
