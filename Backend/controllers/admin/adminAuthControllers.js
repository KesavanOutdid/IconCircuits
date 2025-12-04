const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const database = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const getAdminsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const getRolesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('roles');
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const adminsCollection = await getAdminsCollection();
        const admin = await adminsCollection.findOne({ email: normalizedEmail });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (admin.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (admin.status !== true) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        const token = jwt.sign({ id: admin._id.toString(), roleId: admin.roleId || null, userId: admin.userId || null, email: admin.email }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: admin._id,
                    userId: admin.userId,
                    name: admin.name,
                    email: admin.email,
                    roleId: admin.roleId,
                    phone: admin.phone,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Admin login failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId, roleId } = req;
        const { profileId } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const rolesCollection = await getRolesCollection();
        const userRole = await rolesCollection.findOne({ role_id: roleId });
        
        if (!userRole || userRole.name.toLowerCase() !== 'admin') {
            return res.status(403).json({ success: false, message: 'This is not admin' });
        }

        if (!profileId) {
            return res.status(400).json({ success: false, message: 'Profile ID is required' });
        }

        const adminsCollection = await getAdminsCollection();
        
        const admin = await adminsCollection.findOne({ userId: profileId });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: admin,
        });
    } catch (error) {
        console.error('Fetching admin profile failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userObjectId, userEmail } = req;
        const { name, phone, email, status, password } = req.body;

        if (!userObjectId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const adminsCollection = await getAdminsCollection();
        const admin = await adminsCollection.findOne({ _id: new ObjectId(userObjectId) });

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: new Date(),
            updatedAt: new Date(),
        };

        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        if (phone !== undefined) {
            updateData.phone = phone ? phone.trim() : null;
        }

        if (status) {
            updateData.status = status;
        }

        if (password && password.trim()) {
            updateData.password = password.trim();
        }

        if (email && email.trim() && email.trim().toLowerCase() !== admin.email) {
            return res.status(400).json({ success: false, message: 'Email cannot be updated' });
        }

        await adminsCollection.updateOne(
            { _id: new ObjectId(userObjectId) },
            { $set: updateData }
        );

        const updatedAdmin = await adminsCollection.findOne({ _id: new ObjectId(userObjectId) });

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedAdmin,
        });
    } catch (error) {
        console.error('Updating profile failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    login,
    getProfile,
    updateProfile,
};
