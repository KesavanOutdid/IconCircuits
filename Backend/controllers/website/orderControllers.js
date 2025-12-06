const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const database = require('../../config/db');

const getOrdersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('orders');
};

const getCartsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('carts');
};

const createOrder = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { 
            cartItems, 
            shippingAddress, 
            cartSummary, 
            userProfile,
            paymentType 
        } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart items are required' 
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address is required' 
            });
        }

        const ordersCollection = await getOrdersCollection();
        const orderId = uuidv4();
        const timestamp = new Date();

        const orderDocument = {
            orderId: orderId,
            userId: userId,
            userEmail: userEmail,
            userProfile: {
                name: userProfile?.name,
                email: userProfile?.email,
                phone: userProfile?.phone,
                userId: userProfile?.userId,
            },
            cartItems: cartItems,
            shippingAddress: shippingAddress,
            cartSummary: cartSummary,
            paymentType: paymentType || 'cod',
            paymentStatus: paymentType === 'razorpay' ? 'pending' : 'completed',
            orderStatus: 'created',
            razorpayOrderId: null,
            razorpayPaymentId: null,
            razorpaySignature: null,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const insertResult = await ordersCollection.insertOne(orderDocument);

        if (!insertResult.insertedId) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create order'
            });
        }

        if (paymentType === 'razorpay') {
            if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
                console.error('❌ Razorpay credentials missing');
                console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '***' : 'NOT SET');
                console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***' : 'NOT SET');
                await ordersCollection.deleteOne({ orderId: orderId });
                return res.status(500).json({
                    success: false,
                    message: 'Razorpay credentials not configured',
                    error: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET'
                });
            }

            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            try {
                console.log('Creating Razorpay order with amount:', Math.round(cartSummary.totalValue * 100));
                
                const razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(cartSummary.totalValue * 100),
                    currency: 'INR',
                    receipt: orderId,
                    payment_capture: 1,
                });

                console.log('✅ Razorpay order created:', razorpayOrder.id);

                const generatedSignature = crypto
                    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpayOrder.id}|${orderId}`)
                    .digest('hex');

                await ordersCollection.updateOne(
                    { orderId: orderId },
                    { 
                        $set: { 
                            razorpayOrderId: razorpayOrder.id,
                            razorpaySignatureGenerated: generatedSignature
                        } 
                    }
                );

                return res.status(201).json({
                    success: true,
                    status: 'success',
                    message: 'Order created successfully',
                    data: {
                        orderId: orderId,
                        razorpayOrder: {
                            id: razorpayOrder.id,
                            amount: razorpayOrder.amount,
                            currency: razorpayOrder.currency,
                        }
                    }
                });
            } catch (razorpayErr) {
                console.error('❌ Razorpay error:', razorpayErr.message || razorpayErr);
                console.error('Error details:', razorpayErr);
                await ordersCollection.deleteOne({ orderId: orderId });
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create Razorpay order',
                    error: razorpayErr.message || 'Unknown Razorpay error',
                    details: {
                        statusCode: razorpayErr.statusCode,
                        description: razorpayErr.description
                    }
                });
            }
        } else {
            return res.status(201).json({
                success: true,
                status: 'success',
                message: 'Order placed successfully',
                data: {
                    orderId: orderId,
                    orderStatus: 'created',
                }
            });
        }
    } catch (err) {
        console.error('Create order error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to create order'
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { userId } = req;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment details'
            });
        }

        const ordersCollection = await getOrdersCollection();
        const order = await ordersCollection.findOne({ razorpayOrderId: razorpay_order_id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            await ordersCollection.updateOne(
                { orderId: order.orderId },
                {
                    $set: {
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
                        paymentStatus: 'completed',
                        orderStatus: 'confirmed',
                        updatedAt: new Date(),
                    }
                }
            );

            return res.status(200).json({
                success: true,
                status: 'success',
                message: 'Payment verified successfully',
                data: {
                    orderId: order.orderId,
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (err) {
        console.error('Verify payment error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Payment verification failed'
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const ordersCollection = await getOrdersCollection();
        const order = await ordersCollection.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await ordersCollection.updateOne(
            { orderId: orderId },
            {
                $set: {
                    orderStatus: 'cancelled',
                    cancellationReason: reason || 'User cancelled',
                    updatedAt: new Date(),
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: {
                orderId: orderId,
            }
        });
    } catch (err) {
        console.error('Cancel order error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to cancel order'
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const { userId } = req;

        const ordersCollection = await getOrdersCollection();
        const orders = await ordersCollection
            .find({ userId: userId })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: {
                orders: orders,
                count: orders.length,
            }
        });
    } catch (err) {
        console.error('Get orders error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch orders'
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const ordersCollection = await getOrdersCollection();
        const order = await ordersCollection.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: {
                order: order,
            }
        });
    } catch (err) {
        console.error('Get order error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch order'
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    cancelOrder,
    getOrders,
    getOrderById,
};
