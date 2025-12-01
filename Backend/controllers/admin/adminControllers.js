const { ObjectId } = require('mongodb');
const database = require('../../config/db');

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const getRolesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('roles');
};

const getNextSequentialId = async (collection, field) => {
    const latestDoc = await collection.find().sort({ [field]: -1 }).limit(1).toArray();
    if (!latestDoc.length) {
        return 1;
    }
    const currentMax = Number(latestDoc[0][field]) || 0;
    return currentMax + 1;
};

const createRole = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Role name is required' });
        }

        const normalizedName = name.trim();
        const rolesCollection = await getRolesCollection();
        const existingRole = await rolesCollection.findOne({ name: { $regex: `^${normalizedName}$`, $options: 'i' } });

        if (existingRole) {
            return res.status(409).json({ message: 'Role already exists' });
        }

        const nextRoleId = await getNextSequentialId(rolesCollection, 'role_id');
        const timestamp = new Date();

        const roleDocument = {
            role_id: nextRoleId,
            name: normalizedName,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await rolesCollection.insertOne(roleDocument);

        return res.status(201).json({
            message: 'Role created successfully',
            data: {
                roleId: roleDocument.role_id,
                name: roleDocument.name,
            },
        });
    } catch (error) {
        console.error('Creating role failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, roleId, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const usersCollection = await getUsersCollection();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await usersCollection.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const resolvedRoleId = roleId !== undefined ? Number(roleId) : 2;
        if (!Number.isInteger(resolvedRoleId) || resolvedRoleId <= 0) {
            return res.status(400).json({ message: 'Invalid roleId' });
        }

        const rolesCollection = await getRolesCollection();
        const roleDocument = await rolesCollection.findOne({ role_id: resolvedRoleId });

        if (!roleDocument) {
            return res.status(400).json({ message: 'Role not found' });
        }

        const nextUserId = await getNextSequentialId(usersCollection, 'userId');
        const timestamp = new Date();

        const userDocument = {
            userId: nextUserId,
            name: name.trim(),
            email: normalizedEmail,
            password: password,
            roleId: roleDocument.role_id,
            phone: phone ? phone.trim() : null,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const insertResult = await usersCollection.insertOne(userDocument);

        return res.status(201).json({
            message: 'User created successfully',
            data: {
                id: insertResult.insertedId,
                userId: userDocument.userId,
                name: userDocument.name,
                email: userDocument.email,
                roleId: userDocument.roleId,
                phone: userDocument.phone,
            },
        });
    } catch (error) {
        console.error('Creating user failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId param is required' });
        }

        let objectId;
        try {
            objectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: objectId }, { projection: { password: 0 } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error('Fetching user failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const usersCollection = await getUsersCollection();
        const users = await usersCollection
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Fetching users failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createRole,
    createUser,
    getUser,
    getUsers,
};
