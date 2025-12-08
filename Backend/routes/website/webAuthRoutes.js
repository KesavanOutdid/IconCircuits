const express = require('express');
const { signup, login, getProfile, updateProfile, addAddress, updateAddress, deleteAddress, removeTypeFromAddress } = require('../../controllers/website/webAuthControllers');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Website - Auth
 *     description: Website user authentication endpoints
 */

/**
 * @swagger
 * /api/website/auth/signup:
 *   post:
 *     summary: User registration
 *     tags: [Website - Auth]
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: SecurePass123
 *               phone:
 *                 type: string
 *                 description: User phone number (optional)
 *                 example: "+1234567890"
 *               roleId:
 *                 type: integer
 *                 description: Role ID (default is 2 - Enduser)
 *                 example: 2
 *               addresses:
 *                 type: array
 *                 description: User addresses (optional, invoice type is optional)
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
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         userId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         roleId:
 *                           type: integer
 *                         phone:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Missing required fields, invalid roleId, role not found, or role deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
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
router.post('/signup', signup);

/**
 * @swagger
 * /api/website/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Website - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         userId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         roleId:
 *                           type: integer
 *                         phone:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account is deactivated
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
router.post('/login', login);

/**
 * @swagger
 * /api/website/auth/getprofile:
 *   get:
 *     summary: Get user profile
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch profile for (supports both numeric and UUID formats)
 *         example: 3
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                   example: Profile fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       oneOf:
 *                         - type: integer
 *                         - type: string
 *                       description: User ID (can be numeric or UUID string)
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
router.get('/getprofile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/website/auth/updateprofile:
 *   put:
 *     summary: Update user profile
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (supports both numeric and UUID formats)
 *                 example: 3
 *               name:
 *                 type: string
 *                 description: Updated name
 *                 example: John Updated
 *               phone:
 *                 type: string
 *                 description: Updated phone number
 *                 example: "+9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Updated password
 *                 example: NewSecurePass123
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
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       oneOf:
 *                         - type: integer
 *                         - type: string
 *                       description: User ID (can be numeric or UUID string)
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
 *         description: Bad request - userId is required or email cannot be updated
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
router.put('/updateprofile', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/website/auth/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [invoice, delivery]
 *                 description: Address type (invoice or delivery)
 *                 example: "delivery"
 *               street:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               location:
 *                 type: string
 *                 example: "Near Central Park"
 *               district:
 *                 type: string
 *                 example: "Mumbai City"
 *               state:
 *                 type: string
 *                 example: "Maharashtra"
 *               country:
 *                 type: string
 *                 example: "India"
 *               pincode:
 *                 type: string
 *                 example: "400001"
 *               companyName:
 *                 type: string
 *                 description: Company name (optional)
 *                 example: "ABC Corporation"
 *               gstNo:
 *                 type: string
 *                 description: GST number (optional)
 *                 example: "29ABCDE1234F1Z5"
 *     responses:
 *       201:
 *         description: Address added successfully
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
 *                   example: Address added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     location:
 *                       type: string
 *                     district:
 *                       type: string
 *                     state:
 *                       type: string
 *                     country:
 *                       type: string
 *                     pincode:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     gstNo:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid address type
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
router.post('/addresses', authMiddleware, addAddress);

/**
 * @swagger
 * /api/website/auth/addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [invoice, delivery]
 *                 description: Address type (invoice or delivery)
 *                 example: "delivery"
 *               street:
 *                 type: string
 *                 example: "456 Updated Street"
 *               city:
 *                 type: string
 *                 example: "Delhi"
 *               location:
 *                 type: string
 *                 example: "Near India Gate"
 *               district:
 *                 type: string
 *                 example: "Central Delhi"
 *               state:
 *                 type: string
 *                 example: "Delhi"
 *               country:
 *                 type: string
 *                 example: "India"
 *               pincode:
 *                 type: string
 *                 example: "110001"
 *               companyName:
 *                 type: string
 *                 description: Company name (optional)
 *                 example: "XYZ Industries"
 *               gstNo:
 *                 type: string
 *                 description: GST number (optional)
 *                 example: "07XYZAB5678G1H2"
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: Address updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     location:
 *                       type: string
 *                     district:
 *                       type: string
 *                     state:
 *                       type: string
 *                     country:
 *                       type: string
 *                     pincode:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     gstNo:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid address ID or type
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
 *         description: User or address not found
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
router.put('/addresses/:addressId', authMiddleware, updateAddress);

/**
 * @swagger
 * /api/website/auth/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID to delete
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *       400:
 *         description: Bad request - Invalid address ID
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
 *         description: User or address not found
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
router.delete('/addresses/:addressId', authMiddleware, deleteAddress);

/**
 * @swagger
 * /api/website/auth/addresses/{addressId}/type/{type}:
 *   delete:
 *     summary: Remove a specific type from an address
 *     description: Removes a specific type (invoice or delivery) from an address's type array. If the address has no types left after removal, the entire address is deleted.
 *     tags: [Website - Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [invoice, delivery]
 *         description: Type to remove from address (invoice or delivery)
 *     responses:
 *       200:
 *         description: Type removed successfully
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
 *                   example: Type "delivery" removed from address successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     type:
 *                       type: array
 *                       items:
 *                         type: string
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     location:
 *                       type: string
 *                     district:
 *                       type: string
 *                     state:
 *                       type: string
 *                     country:
 *                       type: string
 *                     pincode:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     gstNo:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid address ID, type, or address doesn't have the specified type
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
 *         description: User or address not found
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
router.delete('/addresses/:addressId/type/:type', authMiddleware, removeTypeFromAddress);

module.exports = router;
