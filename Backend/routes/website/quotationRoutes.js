const express = require('express');
const { 
    createQuotation,
    getUserQuotations,
    getQuotationById,
    updateQuotation
} = require('../../controllers/website/quotationControllers');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website - Quotations
 *     description: User quotation request and management endpoints
 */

/**
 * @swagger
 * /api/website/quotations/create:
 *   post:
 *     summary: Create a new quotation request
 *     tags: [Website - Quotations]
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
 *             properties:
 *               service_id:
 *                 type: string
 *                 description: Service ID
 *                 example: service-123
 *               service_code:
 *                 type: string
 *                 description: Service code
 *                 example: PCB-FAB
 *               service_name:
 *                 type: string
 *                 description: Service name
 *                 example: PCB Fabrication
 *               pcb_name:
 *                 type: string
 *                 description: PCB name
 *                 example: My Custom Board
 *               config:
 *                 type: string
 *                 description: Configuration object as JSON string
 *                 example: '{"layers": 2, "size": "100x100"}'
 *               description:
 *                 type: string
 *                 description: Additional description
 *                 example: Need urgent delivery
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload 1-5 files (Gerber, design files, etc.)
 *     responses:
 *       201:
 *         description: Quotation created successfully
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
 *                   example: Quotation created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     quotation_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: pending
 *                     service_id:
 *                       type: string
 *                     service_name:
 *                       type: string
 *                     files:
 *                       type: array
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or too many files
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
router.post('/create', authMiddleware, upload.array('files', 5), createQuotation);

/**
 * @swagger
 * /api/website/quotations/list:
 *   get:
 *     summary: Get all quotations for the logged-in user
 *     tags: [Website - Quotations]
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
 *           enum: [pending, quoted, accepted, requote_requested, rejected, cancelled]
 *         description: Filter by quotation status
 *     responses:
 *       200:
 *         description: Quotations retrieved successfully
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
 *                   example: Quotations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quotation_id:
 *                         type: string
 *                       service_id:
 *                         type: string
 *                       service_code:
 *                         type: string
 *                       service_name:
 *                         type: string
 *                       pcb_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, quoted, accepted, requote_requested, rejected, cancelled]
 *                       quoted_amount:
 *                         type: number
 *                       admin_reason:
 *                         type: string
 *                       user_reason:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
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
router.get('/list', authMiddleware, getUserQuotations);

/**
 * @swagger
 * /api/website/quotations/{quotationId}:
 *   get:
 *     summary: Get quotation details by ID
 *     tags: [Website - Quotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quotationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quotation ID
 *     responses:
 *       200:
 *         description: Quotation retrieved successfully
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
 *                   example: Quotation retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     quotation_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     service_id:
 *                       type: string
 *                     service_code:
 *                       type: string
 *                     service_name:
 *                       type: string
 *                     pcb_name:
 *                       type: string
 *                     config:
 *                       type: object
 *                     description:
 *                       type: string
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
 *                           path:
 *                             type: string
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                     status:
 *                       type: string
 *                       enum: [pending, quoted, accepted, requote_requested, rejected, cancelled]
 *                     quoted_amount:
 *                       type: number
 *                     admin_reason:
 *                       type: string
 *                     user_reason:
 *                       type: string
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           reason:
 *                             type: string
 *                           status:
 *                             type: string
 *                           updatedBy:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 *         description: Quotation not found
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
 *   put:
 *     summary: Update quotation with action-based operations
 *     tags: [Website - Quotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quotationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quotation ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [update, accept, requote, reject]
 *                 description: Action to perform (update - modify quotation details, accept - accept admin quote, requote - request new quote, reject - reject quotation)
 *               pcb_name:
 *                 type: string
 *                 description: PCB name (for update action)
 *                 example: Updated Board Name
 *               config:
 *                 type: string
 *                 description: Configuration object as JSON string (for update action)
 *                 example: '{"layers": 4, "size": "150x150"}'
 *               description:
 *                 type: string
 *                 description: Additional description (for update action)
 *                 example: Updated requirements
 *               reason:
 *                 type: string
 *                 description: Required for requote and reject actions. Optional for update and accept
 *                 example: Need lower price or different specifications
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload new files (for update action, 1-5 files max)
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, requote, reject]
 *                 description: Action to perform
 *               reason:
 *                 type: string
 *                 description: Required for requote and reject actions
 *                 example: Need lower price
 *             examples:
 *               accept:
 *                 value:
 *                   action: accept
 *                   reason: Quote accepted
 *               requote:
 *                 value:
 *                   action: requote
 *                   reason: Price is too high, need better quote
 *               reject:
 *                 value:
 *                   action: reject
 *                   reason: Not interested anymore
 *     responses:
 *       200:
 *         description: Quotation updated successfully
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
 *                   example: Quotation updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input or invalid status transition
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
 *       404:
 *         description: Quotation not found
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
router.get('/:quotationId', authMiddleware, getQuotationById);

router.put('/:quotationId', authMiddleware, upload.array('files', 5), updateQuotation);

router.get('/health-check', (req, res) => {
    res.json({ success: true, message: 'Quotation endpoint is healthy' });
});

module.exports = router;
