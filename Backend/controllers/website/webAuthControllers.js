const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const getRolesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('roles');
};

const signup = async (req, res) => {
    try {
        const { name, email, password, phone, addresses, roleId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        if (addresses && !Array.isArray(addresses)) {
            return res.status(400).json({ success: false, message: 'Addresses must be an array' });
        }

        if (addresses) {
            for (const addr of addresses) {
                if (!addr.type || !Array.isArray(addr.type) || addr.type.length === 0) {
                    return res.status(400).json({ success: false, message: 'Address type must be an array with at least one value' });
                }
                for (const t of addr.type) {
                    if (!['invoice', 'delivery'].includes(t)) {
                        return res.status(400).json({ success: false, message: 'Address type values must be "invoice" or "delivery"' });
                    }
                }
            }
        }

        const usersCollection = await getUsersCollection();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await usersCollection.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }

        const rolesCollection = await getRolesCollection();
        let roleDocument;
        
        if (roleId !== undefined) {
            roleDocument = await rolesCollection.findOne({ role_id: roleId });
        } else {
            roleDocument = await rolesCollection.findOne({ name: { $regex: '^user$', $options: 'i' } });
        }
        
        if (!roleDocument) {
            roleDocument = await rolesCollection.findOne({ name: { $regex: '^customer$', $options: 'i' } });
        }

        if (!roleDocument) {
            return res.status(400).json({ success: false, message: 'Role not found' });
        }

        if (roleDocument.status !== true) {
            return res.status(400).json({ success: false, message: 'Cannot signup with deactivated role' });
        }

        const userId = uuidv4();
        const timestamp = new Date();

        const userDocument = {
            userId: userId,
            name: name.trim(),
            email: normalizedEmail,
            password: password,
            roleId: roleDocument.role_id,
            phone: phone ? phone.trim() : null,
            status: true,
            createdBy: normalizedEmail,
            createdTime: timestamp,
            modifiedBy: normalizedEmail,
            modifiedTime: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        if (addresses && addresses.length > 0) {
            userDocument.addresses = addresses.map(addr => ({
                type: addr.type,
                street: addr.street ? addr.street.trim() : null,
                city: addr.city ? addr.city.trim() : null,
                location: addr.location ? addr.location.trim() : null,
                district: addr.district ? addr.district.trim() : null,
                state: addr.state ? addr.state.trim() : null,
                country: addr.country ? addr.country.trim() : null,
                pincode: addr.pincode ? addr.pincode.trim() : null,
                companyName: addr.companyName ? addr.companyName.trim() : null,
                gstNo: addr.gstNo ? addr.gstNo.trim() : null,
            }));
        } else {
            userDocument.addresses = [];
        }

        const insertResult = await usersCollection.insertOne(userDocument);

        const token = jwt.sign(
            { id: insertResult.insertedId.toString(), roleId: userDocument.roleId, userId: userId, email: userDocument.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: insertResult.insertedId,
                    userId: userId,
                    name: userDocument.name,
                    email: userDocument.email,
                    roleId: userDocument.roleId,
                    phone: userDocument.phone,
                    addresses: userDocument.addresses || [],
                    status: userDocument.status,
                    createdAt: userDocument.createdAt,
                    updatedAt: userDocument.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('User signup failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status !== true) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        const token = jwt.sign(
            { id: user._id.toString(), roleId: user.roleId || null, userId: user.userId || null, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    userId: user.userId,
                    name: user.name,
                    email: user.email,
                    roleId: user.roleId,
                    phone: user.phone,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('User login failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const usersCollection = await getUsersCollection();
        const numericUserId = Number(userId);
        const searchCriteria = isNaN(numericUserId) ? { userId: userId } : { userId: numericUserId };
        const user = await usersCollection.findOne(searchCriteria);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error('Fetching user profile failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userEmail } = req;
        const { userId, name, phone, email, addresses, status, password } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        if (addresses && !Array.isArray(addresses)) {
            return res.status(400).json({ success: false, message: 'Addresses must be an array' });
        }

        if (addresses) {
            for (const addr of addresses) {
                if (!addr.type || !Array.isArray(addr.type) || addr.type.length === 0) {
                    return res.status(400).json({ success: false, message: 'Address type must be an array with at least one value' });
                }
                for (const t of addr.type) {
                    if (!['invoice', 'delivery'].includes(t)) {
                        return res.status(400).json({ success: false, message: 'Address type values must be "invoice" or "delivery"' });
                    }
                }
            }
        }

        const usersCollection = await getUsersCollection();
        const numericUserId = Number(userId);
        const searchCriteria = isNaN(numericUserId) ? { userId: userId } : { userId: numericUserId };
        const user = await usersCollection.findOne(searchCriteria);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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

        if (status !== undefined) {
            updateData.status = Boolean(status);
        }

        if (password && password.trim()) {
            updateData.password = password.trim();
        }

        if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
            return res.status(400).json({ success: false, message: 'Email cannot be updated' });
        }

        if (addresses !== undefined) {
            updateData.addresses = addresses.map(addr => ({
                type: addr.type,
                street: addr.street ? addr.street.trim() : null,
                city: addr.city ? addr.city.trim() : null,
                location: addr.location ? addr.location.trim() : null,
                district: addr.district ? addr.district.trim() : null,
                state: addr.state ? addr.state.trim() : null,
                country: addr.country ? addr.country.trim() : null,
                pincode: addr.pincode ? addr.pincode.trim() : null,
                companyName: addr.companyName ? addr.companyName.trim() : null,
                gstNo: addr.gstNo ? addr.gstNo.trim() : null,
            }));
        }

        await usersCollection.updateOne(
            searchCriteria,
            { $set: updateData }
        );

        const updatedUser = await usersCollection.findOne(
            searchCriteria,
            { projection: { password: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Updating profile failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const addAddress = async (req, res) => {
    try {
        const { userObjectId, userEmail } = req;
        const { type, street, city, location, district, state, country, pincode, companyName, gstNo } = req.body;

        if (!userObjectId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!type || !Array.isArray(type) || type.length === 0) {
            return res.status(400).json({ success: false, message: 'Address type must be an array with at least one value' });
        }
        for (const t of type) {
            if (!['invoice', 'delivery'].includes(t)) {
                return res.status(400).json({ success: false, message: 'Address type values must be "invoice" or "delivery"' });
            }
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userObjectId) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newAddress = {
            _id: new ObjectId(),
            type: type,
            street: street ? street.trim() : null,
            city: city ? city.trim() : null,
            location: location ? location.trim() : null,
            district: district ? district.trim() : null,
            state: state ? state.trim() : null,
            country: country ? country.trim() : null,
            pincode: pincode ? pincode.trim() : null,
            companyName: companyName ? companyName.trim() : null,
            gstNo: gstNo ? gstNo.trim() : null,
        };

        await usersCollection.updateOne(
            { _id: new ObjectId(userObjectId) },
            { 
                $push: { addresses: newAddress },
                $set: { 
                    modifiedBy: userEmail,
                    modifiedTime: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: newAddress,
        });
    } catch (error) {
        console.error('Adding address failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { userObjectId, userEmail } = req;
        const { addressId } = req.params;
        const { type, street, city, location, district, state, country, pincode, companyName, gstNo } = req.body;

        if (!userObjectId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Address ID is required' });
        }

        if (type) {
            if (!Array.isArray(type) || type.length === 0) {
                return res.status(400).json({ success: false, message: 'Address type must be an array with at least one value' });
            }
            for (const t of type) {
                if (!['invoice', 'delivery'].includes(t)) {
                    return res.status(400).json({ success: false, message: 'Address type values must be "invoice" or "delivery"' });
                }
            }
        }

        let addressObjectId;
        try {
            addressObjectId = new ObjectId(addressId);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid address ID' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userObjectId) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressIndex = user.addresses?.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1 || addressIndex === undefined) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const updateFields = {};
        if (type) updateFields['addresses.$.type'] = type;
        if (street !== undefined) updateFields['addresses.$.street'] = street ? street.trim() : null;
        if (city !== undefined) updateFields['addresses.$.city'] = city ? city.trim() : null;
        if (location !== undefined) updateFields['addresses.$.location'] = location ? location.trim() : null;
        if (district !== undefined) updateFields['addresses.$.district'] = district ? district.trim() : null;
        if (state !== undefined) updateFields['addresses.$.state'] = state ? state.trim() : null;
        if (country !== undefined) updateFields['addresses.$.country'] = country ? country.trim() : null;
        if (pincode !== undefined) updateFields['addresses.$.pincode'] = pincode ? pincode.trim() : null;
        if (companyName !== undefined) updateFields['addresses.$.companyName'] = companyName ? companyName.trim() : null;
        if (gstNo !== undefined) updateFields['addresses.$.gstNo'] = gstNo ? gstNo.trim() : null;

        await usersCollection.updateOne(
            { _id: new ObjectId(userObjectId), 'addresses._id': addressObjectId },
            { 
                $set: {
                    ...updateFields,
                    modifiedBy: userEmail,
                    modifiedTime: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        const updatedUser = await usersCollection.findOne(
            { _id: new ObjectId(userObjectId) },
            { projection: { password: 0 } }
        );

        const updatedAddress = updatedUser.addresses?.find(addr => addr._id.toString() === addressId);

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddress,
        });
    } catch (error) {
        console.error('Updating address failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const { userObjectId, userEmail } = req;
        const { addressId } = req.params;

        if (!userObjectId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Address ID is required' });
        }

        let addressObjectId;
        try {
            addressObjectId = new ObjectId(addressId);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid address ID' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userObjectId) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressExists = user.addresses?.some(addr => addr._id.toString() === addressId);
        if (!addressExists) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await usersCollection.updateOne(
            { _id: new ObjectId(userObjectId) },
            { 
                $pull: { addresses: { _id: addressObjectId } },
                $set: {
                    modifiedBy: userEmail,
                    modifiedTime: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        console.error('Deleting address failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const removeTypeFromAddress = async (req, res) => {
    try {
        const { userObjectId, userEmail } = req;
        const { addressId, type } = req.params;

        if (!userObjectId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Address ID is required' });
        }

        if (!type || !['invoice', 'delivery'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type. Must be "invoice" or "delivery"' });
        }

        let addressObjectId;
        try {
            addressObjectId = new ObjectId(addressId);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid address ID' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userObjectId) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses?.find(addr => addr._id.toString() === addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (!address.type.includes(type)) {
            return res.status(400).json({ success: false, message: `Address does not have type "${type}"` });
        }

        await usersCollection.updateOne(
            { _id: new ObjectId(userObjectId), 'addresses._id': addressObjectId },
            { 
                $pull: { 'addresses.$.type': type },
                $set: {
                    modifiedBy: userEmail,
                    modifiedTime: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userObjectId) });
        const updatedAddress = updatedUser.addresses?.find(addr => addr._id.toString() === addressId);

        if (updatedAddress && updatedAddress.type.length === 0) {
            await usersCollection.updateOne(
                { _id: new ObjectId(userObjectId) },
                { 
                    $pull: { addresses: { _id: addressObjectId } },
                    $set: {
                        modifiedBy: userEmail,
                        modifiedTime: new Date(),
                        updatedAt: new Date()
                    }
                }
            );
            return res.status(200).json({
                success: true,
                message: 'Type removed and address deleted as it has no types left',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Type "${type}" removed from address successfully`,
            data: updatedAddress,
        });
    } catch (error) {
        console.error('Removing type from address failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    removeTypeFromAddress,
};
