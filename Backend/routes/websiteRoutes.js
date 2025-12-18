const express = require('express');
const webAuthRoutes = require('./website/webAuthRoutes');
const servicesRoutes = require('./website/servicesRoutes');
const cartRoutes = require('./website/cartRoutes');
const ordersRoutes = require('./website/ordersRoutes');
const contactRoutes = require('./website/contactRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website
 *     description: Public website endpoints
 */

router.use('/auth', webAuthRoutes);
router.use('/services', servicesRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/', contactRoutes);

/**
 * @swagger
 * /api/website/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Website]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 */
router.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Service is healthy', data: { status: 'ok' } });
});

module.exports = router;
