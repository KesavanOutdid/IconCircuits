const express = require('express');
const { getAllServices } = require('../../controllers/website/serviceControllers');

const router = express.Router();

/**
 * @swagger
 * /api/website/services:
 *   get:
 *     summary: Get all services without pagination
 *     tags: [Website - Services]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by service status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (case-insensitive partial match)
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                   example: Services retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       service_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: boolean
 *                       sections:
 *                         type: array
 *                       pricing_rules:
 *                         type: array
 *                       lead_times:
 *                         type: array
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllServices);

module.exports = router;
