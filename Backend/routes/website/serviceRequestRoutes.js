const express = require('express');
const { 
    createServiceRequest, 
    getUserServiceRequests, 
    getServiceRequestById,
    downloadFile,
    checkoutCart
} = require('../../controllers/website/serviceRequestControllers');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website - Service Requests
 *     description: User service request management endpoints
 */

/**
 * @swagger
 * /api/website/servicerequests/orderrequest:
 *   post:
 *     summary: Create a new service request with file uploads (max 5 files)
 *     tags: [Website - Service Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - serviceName
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 description: ID of the service
 *                 example: 1
 *               serviceName:
 *                 type: string
 *                 description: Name of the service
 *                 example: PCB Fabrication
 *               description:
 *                 type: string
 *                 description: Additional description for the request
 *                 example: Need 10 PCBs manufactured with 2 layers
 *               details:
 *                 type: string
 *                 description: Additional details as JSON string
 *                 example: '{"quantity":10,"layers":2,"material":"FR4"}'
 *               files:
 *                 type: array
 *                 description: Upload up to 5 files (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP, RAR - Max 10MB each)
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Service request created successfully
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
 *                   example: Service request created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     requestId:
 *                       type: integer
 *                     serviceId:
 *                       type: integer
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     details:
 *                       type: object
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           originalName:
 *                             type: string
 *                           mimetype:
 *                             type: string
 *                           size:
 *                             type: integer
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                     status:
 *                       type: string
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Missing required fields
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
router.post('/orderrequest', authMiddleware, upload.array('files', 5), createServiceRequest);

/**
 * @swagger
 * /api/website/servicerequests/getorderrequests:
 *   get:
 *     summary: Get user's service requests with pagination
 *     tags: [Website - Service Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, completed]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: Service requests fetched successfully
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
 *                   example: Service requests fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           requestId:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           userObjectId:
 *                             type: string
 *                           serviceId:
 *                             type: integer
 *                           serviceName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           details:
 *                             type: object
 *                           status:
 *                             type: string
 *                             enum: [pending, accepted, rejected, completed]
 *                           adminResponse:
 *                             type: string
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
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
router.get('/getorderrequests', authMiddleware, getUserServiceRequests);

/**
 * @swagger
 * /api/website/servicerequests/getorderrequest/{requestId}:
 *   get:
 *     summary: Get a specific service request by ID
 *     tags: [Website - Service Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service request ID
 *     responses:
 *       200:
 *         description: Service request fetched successfully
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
 *                   example: Service request fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     requestId:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     userObjectId:
 *                       type: string
 *                     serviceId:
 *                       type: integer
 *                     serviceName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     details:
 *                       type: object
 *                     status:
 *                       type: string
 *                       enum: [pending, accepted, rejected, completed]
 *                     adminResponse:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service request not found
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
router.get('/getorderrequest/:requestId', authMiddleware, getServiceRequestById);

/**
 * @swagger
 * /api/website/servicerequests/getorderrequest/{requestId}/download/{filename}:
 *   get:
 *     summary: Download a file from a service request
 *     tags: [Website - Service Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service request ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: File name to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Service request or file not found
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
router.get('/getorderrequest/:requestId/download/:filename', authMiddleware, downloadFile);

/**
 * @swagger
 * /api/website/servicerequests/checkout:
 *   post:
 *     summary: Checkout cart items and create orders
 *     tags: [Website - Service Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartIds
 *             properties:
 *               cartIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of cart IDs to checkout
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Orders created successfully
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
 *                   example: 3 order(s) created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totalOrders:
 *                       type: integer
 *       400:
 *         description: Bad request - Missing or invalid cartIds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No cart items found
 *       500:
 *         description: Internal server error
 */
router.post('/checkout', authMiddleware, checkoutCart);

module.exports = router;
