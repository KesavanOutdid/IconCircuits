const express = require('express');
const { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart,
    clearCart
} = require('../../controllers/website/cartControllers');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website - Cart
 *     description: User cart management endpoints
 */

/**
 * @swagger
 * /api/website/cart/add:
 *   post:
 *     summary: Add item to cart with file uploads
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *               - service_name
 *               - order_value
 *             properties:
 *               service_id:
 *                 type: string
 *                 description: ID of the service
 *                 example: 6930345b988f4646bd9e4a04
 *               service_code:
 *                 type: string
 *                 description: Service code
 *                 example: PCB LAYOUT
 *               service_name:
 *                 type: string
 *                 description: Name of the service
 *                 example: PCB LAYOUT DESIGN
 *               pcb_name:
 *                 type: string
 *                 description: PCB name
 *                 example: New PCB
 *               config:
 *                 type: string
 *                 description: Configuration as JSON string
 *                 example: '{"pcb_name":"New PCB","layers":"1","components":"75","lead_time":"3","controlled_impedance":true,"dimension_x":"100","dimension_y":"150"}'
 *               lead_time:
 *                 type: integer
 *                 description: Lead time in days
 *                 example: 3
 *               order_value:
 *                 type: number
 *                 description: Order value
 *                 example: 9450
 *               tax:
 *                 type: number
 *                 description: Tax amount
 *                 example: 1701
 *               total_price:
 *                 type: number
 *                 description: Total price
 *                 example: 11151
 *               shipment_date:
 *                 type: string
 *                 description: Expected shipment date
 *                 example: 07/12/2025
 *               schematic:
 *                 type: string
 *                 format: binary
 *                 description: Schematic file (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP, RAR - Max 10MB)
 *               bom:
 *                 type: string
 *                 format: binary
 *                 description: BOM file (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP, RAR - Max 10MB)
 *     responses:
 *       201:
 *         description: Item added to cart successfully
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
 *                   example: Item added to cart successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/add', authMiddleware, upload.fields([
    { name: 'schematic', maxCount: 1 },
    { name: 'bom', maxCount: 1 }
]), addToCart);

/**
 * @swagger
 * /api/website/cart/getcart:
 *   get:
 *     summary: Get user's cart items
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: User ID to fetch cart for (optional, defaults to authenticated user)
 *         example: 3
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: Cart retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalValue:
 *                           type: number
 *       400:
 *         description: Bad request - Invalid userId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/getcart', authMiddleware, getCart);

/**
 * @swagger
 * /api/website/cart/updatecart/{cartId}:
 *   put:
 *     summary: Update cart item
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pcb_name:
 *                 type: string
 *               config:
 *                 type: string
 *               lead_time:
 *                 type: integer
 *               order_value:
 *                 type: number
 *               tax:
 *                 type: number
 *               total_price:
 *                 type: number
 *               shipment_date:
 *                 type: string
 *               schematic:
 *                 type: string
 *                 format: binary
 *               bom:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.put('/updatecart/:cartId', authMiddleware, upload.fields([
    { name: 'schematic', maxCount: 1 },
    { name: 'bom', maxCount: 1 }
]), updateCartItem);

/**
 * @swagger
 * /api/website/cart/removecart/{cartId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/removecart/:cartId', authMiddleware, removeFromCart);

/**
 * @swagger
 * /api/website/cart/clearcart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/clearcart', authMiddleware, clearCart);

router.get('/health-check', (req, res) => {
    res.json({ success: true, message: 'Cart endpoint is healthy' });
});

/**
 * @swagger
 * /api/website/cart/file:
 *   get:
 *     summary: Get uploaded file
 *     tags: [Website - Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename to retrieve
 *     responses:
 *       200:
 *         description: File served successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.get('/file', (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        req.userObjectId = decoded.id;
        req.roleId = decoded.roleId;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}, (req, res) => {
    try {
        const { filename } = req.query;
        
        if (!filename) {
            return res.status(400).json({ 
                success: false, 
                message: 'filename query parameter is required' 
            });
        }

        const fs = require('fs');
        const path = require('path');
        
        console.log('File request - filename:', filename);
        
        const uploadsDir = path.join(__dirname, '../../uploads/service-requests');
        const filePath = path.join(uploadsDir, filename);

        console.log('File request - uploadsDir:', uploadsDir);
        console.log('File request - filePath:', filePath);

        if (!filePath.startsWith(uploadsDir)) {
            console.log('File request - Invalid path (path traversal attempt)');
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid file path' 
            });
        }

        if (!fs.existsSync(filePath)) {
            console.log('File request - File not found:', filePath);
            return res.status(404).json({ 
                success: false, 
                message: 'File not found: ' + filePath
            });
        }

        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            contentType = `image/${ext.slice(1)}`;
        } else if (ext === '.pdf') {
            contentType = 'application/pdf';
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'inline; filename=' + filename);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        
        const stream = fs.createReadStream(filePath);
        
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error reading file' });
            }
        });

        stream.pipe(res);
        console.log('File request - File sent successfully');
    } catch (err) {
        console.error('File endpoint error:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error',
                error: err.message
            });
        }
    }
});

module.exports = router;
