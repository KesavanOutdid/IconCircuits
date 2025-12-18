const express = require('express');
const adminAuthRoutes = require('./adminAuthRoutes');
const { createRole, getRole, getRoles, updateRole, createUser, getUser, getUsers, updateUser, getDashboardAnalytics } = require('../../controllers/admin/adminControllers');
const { 
    createService, 
    getService, 
    getServices, 
    updateService, 
    deleteService
} = require('../../controllers/admin/serviceControllers');
const {
    getAllOrders,
    getOrderByIdAdmin,
    // updateOrderStatus,
    markOrderCompleted
} = require('../../controllers/admin/ordersController');
const {
    getNewsletterSubscribers,
    getContacts,
    updateNewsletterStatus,
    deleteNewsletterSubscriber,
    updateContactStatus,
    deleteContact
} = require('../../controllers/admin/contactControllers');
const authMiddleware = require('../../middleware/authMiddleware');
const pagination = require('../../middleware/pagination');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Auth
 *     description: Admin authentication endpoints
 *   - name: Admin - Dashboard
 *     description: Dashboard analytics and statistics
 *   - name: Admin - Roles
 *     description: Role management endpoints
 *   - name: Admin - Users
 *     description: User management endpoints
 *   - name: Admin - Services
 *     description: Unified service management with nested config options, pricing rules, and lead times
 *   - name: Admin - Orders
 *     description: Admin orders management endpoints
 *   - name: Admin - Contacts
 *     description: Newsletter subscribers and contact form submissions management
 */

router.use('/auth', adminAuthRoutes);

/**
 * @swagger
 * /api/admin/dashboard/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Retrieve comprehensive analytics including user counts, orders, contacts, and newsletter statistics
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics fetched successfully
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
 *                   example: Dashboard analytics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         active:
 *                           type: integer
 *                           example: 120
 *                         inactive:
 *                           type: integer
 *                           example: 30
 *                         byRole:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               roleId:
 *                                 type: integer
 *                               roleName:
 *                                 type: string
 *                               total:
 *                                 type: integer
 *                               active:
 *                                 type: integer
 *                               inactive:
 *                                 type: integer
 *                     orders:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 500
 *                         completed:
 *                           type: integer
 *                           example: 450
 *                         pending:
 *                           type: integer
 *                           example: 50
 *                     contacts:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 75
 *                     newsletter:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1000
 *                         active:
 *                           type: integer
 *                           example: 950
 *                         inactive:
 *                           type: integer
 *                           example: 50
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
router.get('/dashboard/analytics', authMiddleware, getDashboardAnalytics);

/**
 * @swagger
 * /api/admin/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Admin - Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *                 example: Manager
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     roleId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *       400:
 *         description: Bad request - Role name is required
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
 *       409:
 *         description: Role already exists
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
router.post('/roles', authMiddleware, createRole);

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: Get paginated list of roles
 *     tags: [Admin - Roles]
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
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Roles fetched successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       role_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       status:
 *                         type: boolean
 *                       createdBy:
 *                         type: string
 *                       createdTime:
 *                         type: string
 *                         format: date-time
 *                       modifiedBy:
 *                         type: string
 *                       modifiedTime:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.get('/roles', authMiddleware, pagination, getRoles);

/**
 * @swagger
 * /api/admin/roles/{roleId}:
 *   get:
 *     summary: Get a single role by ID
 *     tags: [Admin - Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role fetched successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     createdBy:
 *                       type: string
 *                     createdTime:
 *                       type: string
 *                       format: date-time
 *                     modifiedBy:
 *                       type: string
 *                     modifiedTime:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid roleId
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
 *         description: Role not found
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
router.get('/roles/:roleId', authMiddleware, getRole);

/**
 * @swagger
 * /api/admin/roles/{roleId}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Admin - Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated role name
 *                 example: Senior Manager
 *               status:
 *                 type: boolean
 *                 description: Updated role status (true for active, false for inactive)
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: Role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     role_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     createdBy:
 *                       type: string
 *                     createdTime:
 *                       type: string
 *                       format: date-time
 *                     modifiedBy:
 *                       type: string
 *                     modifiedTime:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid roleId
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
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Role name already exists
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
router.put('/roles/:roleId', authMiddleware, updateRole);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: StrongPass123
 *               roleId:
 *                 type: integer
 *                 description: Role ID (default is 2 - Enduser)
 *                 example: 2
 *               phone:
 *                 type: string
 *                 description: User phone number (optional)
 *                 example: "+1234567890"
 *               addresses:
 *                 type: array
 *                 description: User addresses (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                   properties:
 *                     type:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [invoice, delivery]
 *                       description: Address types (can be invoice, delivery, or both)
 *                       example: ["delivery"]
 *                     street:
 *                       type: string
 *                       example: "123 Main Street"
 *                     city:
 *                       type: string
 *                       example: "Mumbai"
 *                     location:
 *                       type: string
 *                       example: "Near Central Park"
 *                     district:
 *                       type: string
 *                       example: "Mumbai City"
 *                     state:
 *                       type: string
 *                       example: "Maharashtra"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     pincode:
 *                       type: string
 *                       example: "400001"
 *                     companyName:
 *                       type: string
 *                       description: Company name (optional)
 *                       example: "ABC Corporation"
 *                     gstNo:
 *                       type: string
 *                       description: GST number (optional)
 *                       example: "29ABCDE1234F1Z5"
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: integer
 *                     phone:
 *                       type: string
 *       400:
 *         description: Bad request - Missing required fields, invalid roleId, role not found, or role deactivated
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
 *       409:
 *         description: User with this email already exists
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
router.post('/users', authMiddleware, createUser);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get paginated list of users
 *     tags: [Admin - Users]
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
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       roleId:
 *                         type: integer
 *                       phone:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.get('/users', authMiddleware, pagination, getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User fetched successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: integer
 *                     phone:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid userId
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
 *         description: User not found
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
router.get('/users/:userId', authMiddleware, getUser);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated user name
 *                 example: John Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: updated@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Updated password
 *                 example: NewPassword123
 *               roleId:
 *                 type: integer
 *                 description: Updated role ID
 *                 example: 2
 *               phone:
 *                 type: string
 *                 description: Updated phone number
 *                 example: "+9876543210"
 *               status:
 *                 type: boolean
 *                 description: Updated user status (true for active, false for inactive)
 *               addresses:
 *                 type: array
 *                 description: Updated addresses (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                   properties:
 *                     type:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [invoice, delivery]
 *                       description: Address types (can be invoice, delivery, or both)
 *                       example: ["delivery", "invoice"]
 *                     street:
 *                       type: string
 *                       example: "456 Updated Street"
 *                     city:
 *                       type: string
 *                       example: "Delhi"
 *                     location:
 *                       type: string
 *                       example: "Near India Gate"
 *                     district:
 *                       type: string
 *                       example: "Central Delhi"
 *                     state:
 *                       type: string
 *                       example: "Delhi"
 *                     country:
 *                       type: string
 *                       example: "India"
 *                     pincode:
 *                       type: string
 *                       example: "110001"
 *                     companyName:
 *                       type: string
 *                       description: Company name (optional)
 *                       example: "XYZ Industries"
 *                     gstNo:
 *                       type: string
 *                       description: GST number (optional)
 *                       example: "07XYZAB5678G1H2"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleId:
 *                       type: integer
 *                     phone:
 *                       type: string
 *                     addresses:
 *                       type: array
 *                     status:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid userId or roleId
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already in use
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
router.put('/users/:userId', authMiddleware, updateUser);

/**
 * @swagger
 * /api/admin/services:
 *   post:
 *     summary: Create service with nested config structure
 *     tags: [Admin - Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               base_price:
 *                 type: number
 *                 description: Base price for the service
 *                 example: 100000
 *               status:
 *                 type: boolean
 *               config:
 *                 type: object
 *                 description: Service configuration with nested parameter structure
 *                 additionalProperties:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [select, boolean, numeric_xy, multi_select]
 *                     options:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - type: string
 *                           - type: number
 *                     multiplier:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *           examples:
 *             pcb_layout_service:
 *               summary: PCB Layout Design Service
 *               value:
 *                 name: PCB Layout Design
 *                 code: PCB_LAYOUT
 *                 description: Professional PCB layout design service
 *                 category: Design
 *                 base_price: 100000
 *                 status: true
 *                 config:
 *                   layers:
 *                     type: select
 *                     options: ["1", "2", "4", "6", "8"]
 *                     multiplier:
 *                       "1": 1.0
 *                       "2": 1.2
 *                       "4": 1.5
 *                       "6": 1.8
 *                       "8": 2.2
 *                   components:
 *                     type: select
 *                     options: [75, 150, 250, 750]
 *                     multiplier:
 *                       "75": 1.0
 *                       "150": 1.3
 *                       "250": 1.6
 *                       "750": 2.2
 *                   pcb_type:
 *                     type: select
 *                     options: ["regular_rigid", "flex", "power"]
 *                     multiplier:
 *                       regular_rigid: 1.0
 *                       flex: 1.8
 *                       power: 1.5
 *                   dimension:
 *                     type: numeric_xy
 *                     unit: mm
 *                     min:
 *                       x: 5
 *                       y: 5
 *                     max:
 *                       x: 415
 *                       y: 280
 *                     area_pricing:
 *                       min_area_sqmm: 25
 *                       max_area_sqmm: 116200
 *                       slabs:
 *                         - min: 0
 *                           max: 5000
 *                           multiplier: 1.0
 *                         - min: 5001
 *                           max: 20000
 *                           multiplier: 1.2
 *                         - min: 20001
 *                           max: 50000
 *                           multiplier: 1.5
 *                         - min: 50001
 *                           max: 116200
 *                           multiplier: 2.0
 *                   component_placement:
 *                     type: select
 *                     options: ["top", "bottom", "top_and_bottom"]
 *                     multiplier:
 *                       top: 1.0
 *                       bottom: 1.0
 *                       top_and_bottom: 1.3
 *                   controlled_impedance:
 *                     type: boolean
 *                     multiplier:
 *                       "true": 1.4
 *                       "false": 1.0
 *                   lead_time_days:
 *                     type: select
 *                     options: [3, 5, 7, 10]
 *                     multiplier:
 *                       "3": 1.5
 *                       "5": 1.3
 *                       "7": 1.1
 *                       "10": 1.0
 *                   delivery_format:
 *                     type: multi_select
 *                     options: ["gerber", "bom", "step_file", "dxf", "layer_pdf"]
 *                     multiplier:
 *                       gerber: 1.0
 *                       bom: 1.1
 *                       step_file: 1.2
 *                       dxf: 1.15
 *                       layer_pdf: 1.05
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Bad request - Missing required fields or service code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/services', authMiddleware, createService);

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: Get paginated list of services
 *     tags: [Admin - Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/services', authMiddleware, pagination, getServices);

/**
 * @swagger
 * /api/admin/services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Admin - Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID (UUID)
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       400:
 *         description: Invalid serviceId
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.get('/services/:serviceId', authMiddleware, getService);

/**
 * @swagger
 * /api/admin/services/{serviceId}:
 *   put:
 *     summary: Update service with nested config structure
 *     tags: [Admin - Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               base_price:
 *                 type: number
 *                 description: Base price for the service
 *                 example: 100000
 *               status:
 *                 type: boolean
 *               config:
 *                 type: object
 *                 description: Service configuration with nested parameter structure (replaces existing)
 *                 additionalProperties:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [select, boolean, numeric_xy, multi_select]
 *                     options:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - type: string
 *                           - type: number
 *                     multiplier:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *           examples:
 *             updateStatus:
 *               summary: Update Service Status
 *               value:
 *                 status: false
 *             updateConfig:
 *               summary: Update Config
 *               value:
 *                 config:
 *                   layers:
 *                     type: select
 *                     options: ["2", "4", "6"]
 *                     multiplier:
 *                       "2": 1.0
 *                       "4": 1.5
 *                       "6": 1.8
 *             updateComplete:
 *               summary: Update Complete Service
 *               value:
 *                 name: PCB Layout Design Updated
 *                 description: Updated PCB layout service
 *                 category: Design
 *                 base_price: 120000
 *                 status: true
 *                 config:
 *                   layers:
 *                     type: select
 *                     options: ["2", "4", "6", "8"]
 *                     multiplier:
 *                       "2": 1.0
 *                       "4": 1.5
 *                       "6": 1.8
 *                       "8": 2.2
 *                   components:
 *                     type: select
 *                     options: [100, 200, 500]
 *                     multiplier:
 *                       "100": 1.0
 *                       "200": 1.5
 *                       "500": 2.0
 *                   dimension:
 *                     type: numeric_xy
 *                     unit: mm
 *                     min:
 *                       x: 5
 *                       y: 5
 *                     max:
 *                       x: 415
 *                       y: 280
 *                     area_pricing:
 *                       min_area_sqmm: 25
 *                       max_area_sqmm: 116200
 *                       slabs:
 *                         - min: 0
 *                           max: 5000
 *                           multiplier: 1.0
 *                         - min: 5001
 *                           max: 20000
 *                           multiplier: 1.2
 *                   controlled_impedance:
 *                     type: boolean
 *                     multiplier:
 *                       "true": 1.4
 *                       "false": 1.0
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Invalid serviceId
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.put('/services/:serviceId', authMiddleware, updateService);

/**
 * @swagger
 * /api/admin/services/{serviceId}:
 *   delete:
 *     summary: Delete service by ID
 *     tags: [Admin - Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID (UUID)
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       400:
 *         description: Invalid serviceId
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.delete('/services/:serviceId', authMiddleware, deleteService);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filters
 *     tags: [Admin - Orders]
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
 *           enum: [created, confirmed, processing, shipped, delivered, cancelled, completed]
 *         description: Filter by order status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
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
 *                           adminResponse:
 *                             type: string
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                           userDetails:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               userId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
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
router.get('/orders', authMiddleware, getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   get:
 *     summary: Get a specific order by ID (Admin view with user details)
 *     tags: [Admin - Orders]
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
 *                     _id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     userEmail:
 *                       type: string
 *                     userProfile:
 *                       type: object
 *                     cartItems:
 *                       type: array
 *                     shippingAddress:
 *                       type: object
 *                     cartSummary:
 *                       type: object
 *                     paymentType:
 *                       type: string
 *                     paymentStatus:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                     orderStatus:
 *                       type: string
 *                       enum: [created, confirmed, processing, shipped, delivered, cancelled, completed]
 *                     razorpayOrderId:
 *                       type: string
 *                     razorpayPaymentId:
 *                       type: string
 *                     razorpaySignature:
 *                       type: string
 *                     adminResponse:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     userDetails:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         userId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
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
router.get('/orders/:requestId', authMiddleware, getOrderByIdAdmin);

// /**
//  * @swagger
//  * /api/admin/orders/{orderId}/status:
//  *   put:
//  *     summary: Accept or reject an order
//  *     tags: [Admin - Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: orderId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Order ID (UUID)
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - status
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [processing, shipped, delivered, cancelled]
//  *                 description: New status for the order
//  *                 example: processing
//  *               adminResponse:
//  *                 type: string
//  *                 description: Admin's response message
//  *                 example: We can process your order within 5 business days
//  *     responses:
//  *       200:
//  *         description: Order status updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Order status updated to processing successfully
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     _id:
//  *                       type: string
//  *                     orderId:
//  *                       type: string
//  *                     orderStatus:
//  *                       type: string
//  *                     adminResponse:
//  *                       type: string
//  *                     updatedAt:
//  *                       type: string
//  *                       format: date-time
//  *       400:
//  *         description: Bad request - Invalid status or order cannot be updated
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  *       401:
//  *         description: Unauthorized
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  *       404:
//  *         description: Order not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  *       500:
//  *         description: Internal server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.put('/orders/:requestId/status', authMiddleware, updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{orderId}/complete:
 *   put:
 *     summary: Mark an order as completed
 *     tags: [Admin - Orders]
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
 *         description: Order marked as completed successfully
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
 *                   example: Order marked as completed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     orderStatus:
 *                       type: string
 *                       example: completed
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Order cannot be marked as completed
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
router.put('/orders/:requestId/complete', authMiddleware, markOrderCompleted);

/**
 * @swagger
 * /api/admin/newsletter:
 *   get:
 *     summary: Get all newsletter subscribers
 *     tags: [Admin - Contacts]
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
 *           enum: [true, false]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Newsletter subscribers retrieved successfully
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
 *                   example: Newsletter subscribers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                         example: kesav@gmail.com
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
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
router.get('/newsletter', authMiddleware, pagination, getNewsletterSubscribers);

/**
 * @swagger
 * /api/admin/contacts:
 *   get:
 *     summary: Get all contact form submissions
 *     tags: [Admin - Contacts]
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
 *           enum: [true, false]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
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
 *                   example: Contacts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         example: Kesavan D
 *                       email:
 *                         type: string
 *                         example: kesav@gmail.com
 *                       subject:
 *                         type: string
 *                         example: I need help
 *                       message:
 *                         type: string
 *                         example: hi, I need help
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
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
router.get('/contacts', authMiddleware, pagination, getContacts);

/**
 * @swagger
 * /api/admin/newsletter/{id}:
 *   put:
 *     summary: Update newsletter subscriber status
 *     tags: [Admin - Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Newsletter subscriber ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Newsletter subscriber status updated successfully
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
 *                   example: Newsletter subscriber status updated successfully
 *       400:
 *         description: Invalid input
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
 *         description: Newsletter subscriber not found
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
 *   delete:
 *     summary: Delete newsletter subscriber
 *     tags: [Admin - Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Newsletter subscriber ID
 *     responses:
 *       200:
 *         description: Newsletter subscriber deleted successfully
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
 *                   example: Newsletter subscriber deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Newsletter subscriber not found
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
router.put('/newsletter/:id', authMiddleware, updateNewsletterStatus);
router.delete('/newsletter/:id', authMiddleware, deleteNewsletterSubscriber);

/**
 * @swagger
 * /api/admin/contacts/{id}:
 *   put:
 *     summary: Update contact status
 *     tags: [Admin - Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Contact status updated successfully
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
 *                   example: Contact status updated successfully
 *       400:
 *         description: Invalid input
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
 *         description: Contact not found
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
 *   delete:
 *     summary: Delete contact
 *     tags: [Admin - Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
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
 *                   example: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact not found
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
router.put('/contacts/:id', authMiddleware, updateContactStatus);
router.delete('/contacts/:id', authMiddleware, deleteContact);

module.exports = router;