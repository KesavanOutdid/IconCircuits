const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const database = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const getAdminsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const adminsCollection = await getAdminsCollection();
        const admin = await adminsCollection.findOne({ email: normalizedEmail });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (admin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id.toString(), roleId: admin.roleId || null, userId: admin.userId || null }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error('Admin login failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req;

        if (!userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const adminsCollection = await getAdminsCollection();
        const admin = await adminsCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json({
            message: 'Profile fetched successfully',
            data: admin,
        });
    } catch (error) {
        console.error('Fetching admin profile failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    login,
    getProfile,
};
