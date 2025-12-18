const express = require('express');
const { 
    createOrder, 
    verifyPayment, 
    cancelOrder, 
    getOrders, 
    getOrderById 
} = require('../../controllers/website/orderControllers');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website - Orders
 *     description: User order management endpoints
 */

/**
 * @swagger
 * /api/website/orders/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Website - Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItems
 *               - shippingAddress
 *               - cartSummary
 *             properties:
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Array of cart items
 *               shippingAddress:
 *                 type: object
 *                 description: Shipping address details
 *               cartSummary:
 *                 type: object
 *                 properties:
 *                   totalValue:
 *                     type: number
 *                     description: Total order value
 *               userProfile:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   userId:
 *                     type: integer
 *               paymentType:
 *                 type: string
 *                 enum: [cod, razorpay]
 *                 default: cod
 *                 description: Payment method
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     razorpayOrder:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', authMiddleware, createOrder);

/**
 * @swagger
 * /api/website/orders/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Website - Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 description: Razorpay order ID
 *               razorpay_payment_id:
 *                 type: string
 *                 description: Razorpay payment ID
 *               razorpay_signature:
 *                 type: string
 *                 description: Razorpay signature for verification
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Payment verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *       400:
 *         description: Bad request or payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify', authMiddleware, verifyPayment);

/**
 * @swagger
 * /api/website/orders/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Website - Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID to cancel
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *                 default: User cancelled
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cancel', authMiddleware, cancelOrder);

/**
 * @swagger
 * /api/website/orders/list:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     tags: [Website - Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Orders fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           orderId:
 *                             type: string
 *                           userId:
 *                             type: integer
 *                           userEmail:
 *                             type: string
 *                           userProfile:
 *                             type: object
 *                           cartItems:
 *                             type: array
 *                           shippingAddress:
 *                             type: object
 *                           cartSummary:
 *                             type: object
 *                           paymentType:
 *                             type: string
 *                           paymentStatus:
 *                             type: string
 *                             enum: [pending, completed, failed]
 *                           orderStatus:
 *                             type: string
 *                             enum: [created, confirmed, processing, shipped, delivered, cancelled, completed]
 *                           razorpayOrderId:
 *                             type: string
 *                           razorpayPaymentId:
 *                             type: string
 *                           razorpaySignature:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of orders
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/list', authMiddleware, getOrders);

/**
 * @swagger
 * /api/website/orders/{orderId}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Website - Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID (UUID)
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         orderId:
 *                           type: string
 *                         userId:
 *                           type: integer
 *                         userEmail:
 *                           type: string
 *                         userProfile:
 *                           type: object
 *                         cartItems:
 *                           type: array
 *                         shippingAddress:
 *                           type: object
 *                         cartSummary:
 *                           type: object
 *                         paymentType:
 *                           type: string
 *                         paymentStatus:
 *                           type: string
 *                           enum: [pending, completed, failed]
 *                         orderStatus:
 *                           type: string
 *                           enum: [created, confirmed, processing, shipped, delivered, cancelled, completed]
 *                         razorpayOrderId:
 *                           type: string
 *                         razorpayPaymentId:
 *                           type: string
 *                         razorpaySignature:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:orderId', authMiddleware, getOrderById);

/**
 * @swagger
 * /api/website/orders/health/razorpay-check:
 *   get:
 *     summary: Check Razorpay configuration status
 *     tags: [Website - Orders]
 *     responses:
 *       200:
 *         description: Razorpay configuration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 razorpay:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                       description: Whether both key_id and key_secret are configured
 *                     keyId:
 *                       type: string
 *                       enum: [SET, NOT SET]
 *                     keySecret:
 *                       type: string
 *                       enum: [SET, NOT SET]
 */
router.get('/health/razorpay-check', (req, res) => {
    const hasKeyId = !!process.env.RAZORPAY_KEY_ID;
    const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET;
    
    res.status(200).json({
        success: true,
        razorpay: {
            configured: hasKeyId && hasKeySecret,
            keyId: hasKeyId ? 'SET' : 'NOT SET',
            keySecret: hasKeySecret ? 'SET' : 'NOT SET'
        }
    });
});

module.exports = router;
