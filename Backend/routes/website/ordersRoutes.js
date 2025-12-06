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

router.post('/create', authMiddleware, createOrder);

router.post('/verify', authMiddleware, verifyPayment);

router.post('/cancel', authMiddleware, cancelOrder);

router.get('/list', authMiddleware, getOrders);

router.get('/:orderId', authMiddleware, getOrderById);

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
