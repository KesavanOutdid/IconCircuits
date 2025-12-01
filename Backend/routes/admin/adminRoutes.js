const express = require('express');
const adminAuthRoutes = require('./adminAuthRoutes');
const { createRole, createUser, getUser, getUsers } = require('../../controllers/admin/adminControllers');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use('/auth', adminAuthRoutes);
router.post('/roles', authMiddleware, createRole);
router.post('/users', authMiddleware, createUser);
router.get('/users', authMiddleware, getUsers);
router.get('/users/:userId', authMiddleware, getUser);

module.exports = router;
