const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const getUsersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('users');
};

const getRolesCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('roles');
};

const getOrdersCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('orders');
};

const getQuotationsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('quotations');
};

const getContactsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('contacts');
};

const getNewsletterCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('newsletter');
};

const createRole = async (req, res) => {
    try {
        const { userEmail } = req;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Role name is required' });
        }

        const normalizedName = name.trim();
        const rolesCollection = await getRolesCollection();
        const existingRole = await rolesCollection.findOne({ name: { $regex: `^${normalizedName}$`, $options: 'i' } });

        if (existingRole) {
            return res.status(409).json({ success: false, message: 'Role already exists' });
        }

        const lastRole = await rolesCollection.find({}).sort({ role_id: -1 }).limit(1).toArray();
        const roleId = lastRole.length > 0 && typeof lastRole[0].role_id === 'number' ? lastRole[0].role_id + 1 : 1;
        const timestamp = new Date();

        const roleDocument = {
            role_id: roleId,
            name: normalizedName,
            status: true,
            createdBy: userEmail,
            createdTime: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        await rolesCollection.insertOne(roleDocument);

        return res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: {
                roleId: roleDocument.role_id,
                name: roleDocument.name,
                status: roleDocument.status,
            },
        });
    } catch (error) {
        console.error('Creating role failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        if (!roleId) {
            return res.status(400).json({ success: false, message: 'roleId param is required' });
        }

        const roleIdInt = parseInt(roleId, 10);
        if (isNaN(roleIdInt)) {
            return res.status(400).json({ success: false, message: 'Invalid roleId' });
        }

        const rolesCollection = await getRolesCollection();
        const role = await rolesCollection.findOne({ role_id: roleIdInt });

        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Role fetched successfully',
            data: role,
        });
    } catch (error) {
        console.error('Fetching role failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getRoles = async (req, res) => {
    try {
        const { skip, limit } = req.pagination;
        const rolesCollection = await getRolesCollection();

        const totalRoles = await rolesCollection.countDocuments({});
        req.paginationTotal = totalRoles;

        const roles = await rolesCollection
            .find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Roles fetched successfully',
            data: roles,
        });
    } catch (error) {
        console.error('Fetching roles failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateRole = async (req, res) => {
    try {
        const { userEmail } = req;
        const { roleId } = req.params;
        const { name, status } = req.body;

        if (!roleId) {
            return res.status(400).json({ success: false, message: 'roleId param is required' });
        }

        const roleIdInt = parseInt(roleId, 10);
        if (isNaN(roleIdInt)) {
            return res.status(400).json({ success: false, message: 'Invalid roleId' });
        }

        const rolesCollection = await getRolesCollection();
        const role = await rolesCollection.findOne({ role_id: roleIdInt });

        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: new Date(),
            updatedAt: new Date(),
        };

        if (name && name.trim()) {
            const normalizedName = name.trim();
            if (normalizedName !== role.name) {
                const existingRole = await rolesCollection.findOne({
                    name: { $regex: `^${normalizedName}$`, $options: 'i' },
                    role_id: { $ne: roleIdInt }
                });
                if (existingRole) {
                    return res.status(409).json({ success: false, message: 'Role name already exists' });
                }
                updateData.name = normalizedName;
            }
        }

        if (status !== undefined) {
            updateData.status = Boolean(status);
        }

        await rolesCollection.updateOne(
            { role_id: roleIdInt },
            { $set: updateData }
        );

        const updatedRole = await rolesCollection.findOne({ role_id: roleIdInt });

        return res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: updatedRole,
        });
    } catch (error) {
        console.error('Updating role failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { userEmail } = req;
        const { name, email, password, roleId, phone, addresses } = req.body;

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
            const roleIdInt = parseInt(roleId, 10);
            if (isNaN(roleIdInt)) {
                return res.status(400).json({ success: false, message: 'Invalid roleId' });
            }
            roleDocument = await rolesCollection.findOne({ role_id: roleIdInt });
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
            return res.status(400).json({ success: false, message: 'Cannot create user with deactivated role' });
        }

        const lastUser = await usersCollection.find({}).sort({ userId: -1 }).limit(1).toArray();
        const userId = lastUser.length > 0 && typeof lastUser[0].userId === 'number' ? lastUser[0].userId + 1 : 1;
        const timestamp = new Date();

        const userDocument = {
            userId: userId,
            name: name.trim(),
            email: normalizedEmail,
            password: password,
            roleId: roleDocument.role_id,
            phone: phone ? phone.trim() : null,
            status: true,
            createdBy: userEmail,
            createdTime: timestamp,
            modifiedBy: userEmail,
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

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: insertResult.insertedId,
                userId: userDocument.userId,
                name: userDocument.name,
                email: userDocument.email,
                roleId: userDocument.roleId,
                phone: userDocument.phone,
                addresses: userDocument.addresses || [],
                status: userDocument.status,
            },
        });
    } catch (error) {
        console.error('Creating user failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId param is required' });
        }

        let objectId;
        try {
            objectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid userId' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: objectId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error('Fetching user failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { skip, limit } = req.pagination;
        const usersCollection = await getUsersCollection();

        const totalUsers = await usersCollection.countDocuments({});
        req.paginationTotal = totalUsers;

        const users = await usersCollection
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Fetching users failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userEmail } = req;
        const { userId } = req.params;
        const { name, email, phone, roleId, addresses, status, password } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId param is required' });
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

        let objectId;
        try {
            objectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid userId' });
        }

        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ _id: objectId });

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

        if (email && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();
            if (normalizedEmail !== user.email) {
                const existingUser = await usersCollection.findOne({
                    email: normalizedEmail,
                    _id: { $ne: objectId }
                });
                if (existingUser) {
                    return res.status(409).json({ success: false, message: 'Email already in use' });
                }
                updateData.email = normalizedEmail;
            }
        }

        if (roleId !== undefined) {
            const roleIdInt = parseInt(roleId, 10);
            if (isNaN(roleIdInt)) {
                return res.status(400).json({ success: false, message: 'Invalid roleId' });
            }

            const rolesCollection = await getRolesCollection();
            const roleDocument = await rolesCollection.findOne({ role_id: roleIdInt });

            if (!roleDocument) {
                return res.status(400).json({ success: false, message: 'Role not found' });
            }

            updateData.roleId = roleDocument.role_id;
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
            { _id: objectId },
            { $set: updateData }
        );

        const updatedUser = await usersCollection.findOne(
            { _id: objectId },
            { projection: { password: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Updating user failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getDashboardAnalytics = async (req, res) => {
    try {
        const usersCollection = await getUsersCollection();
        const rolesCollection = await getRolesCollection();
        const ordersCollection = await getOrdersCollection();
        const quotationsCollection = await getQuotationsCollection();
        const contactsCollection = await getContactsCollection();
        const newsletterCollection = await getNewsletterCollection();

        const totalUsers = await usersCollection.countDocuments({});
        const activeUsers = await usersCollection.countDocuments({ status: true });
        const inactiveUsers = await usersCollection.countDocuments({ status: false });

        const roles = await rolesCollection.find({}).toArray();
        const userCountByRole = await Promise.all(
            roles.map(async (role) => {
                const totalByRole = await usersCollection.countDocuments({ roleId: role.role_id });
                const activeByRole = await usersCollection.countDocuments({ roleId: role.role_id, status: true });
                const inactiveByRole = await usersCollection.countDocuments({ roleId: role.role_id, status: false });
                
                return {
                    roleId: role.role_id,
                    roleName: role.name,
                    total: totalByRole,
                    active: activeByRole,
                    inactive: inactiveByRole,
                };
            })
        );

        const totalQuotations = await quotationsCollection.countDocuments({});
        const pendingQuotations = await quotationsCollection.countDocuments({ status: 'pending' });
        const quotedQuotations = await quotationsCollection.countDocuments({ status: 'quoted' });
        const acceptedQuotations = await quotationsCollection.countDocuments({ status: 'accepted' });
        const rejectedQuotations = await quotationsCollection.countDocuments({ status: 'rejected' });
        const requoteRequestedQuotations = await quotationsCollection.countDocuments({ status: 'requote_requested' });
        const cancelledQuotations = await quotationsCollection.countDocuments({ status: 'cancelled' });

        const totalOrders = await ordersCollection.countDocuments({});
        const createdOrders = await ordersCollection.countDocuments({ orderStatus: 'created' });
        const confirmedOrders = await ordersCollection.countDocuments({ orderStatus: 'confirmed' });
        const completedOrders = await ordersCollection.countDocuments({ orderStatus: 'confirmed' });
        const cancelledOrders = await ordersCollection.countDocuments({ orderStatus: 'cancelled' });

        const totalContacts = await contactsCollection.countDocuments({});

        const totalNewsletterSubscribers = await newsletterCollection.countDocuments({});
        const activeNewsletterSubscribers = await newsletterCollection.countDocuments({ status: true });
        const inactiveNewsletterSubscribers = await newsletterCollection.countDocuments({ status: false });

        // Daily analytics (only today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dailyPayments = await ordersCollection.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const dailyOrders = await ordersCollection.aggregate([
            {
                $match: {
                    orderStatus: 'confirmed',
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    completed: { $sum: 1 }
                }
            }
        ]).toArray();

        // Weekly analytics (current week - Sunday to today)
        const currentDate = new Date();
        const first = currentDate.getDate() - currentDate.getDay();
        const sundayOfCurrentWeek = new Date(currentDate.setDate(first));
        sundayOfCurrentWeek.setHours(0, 0, 0, 0);
        const nextMonday = new Date(sundayOfCurrentWeek);
        nextMonday.setDate(nextMonday.getDate() + 7);

        const weeklyPayments = await ordersCollection.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    createdAt: { $gte: sundayOfCurrentWeek, $lt: nextMonday }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]).toArray();

        const weeklyOrders = await ordersCollection.aggregate([
            {
                $match: {
                    orderStatus: 'confirmed',
                    createdAt: { $gte: sundayOfCurrentWeek, $lt: nextMonday }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    completed: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]).toArray();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyOrdersFormatted = dayNames.map((day, index) => {
            const dayDate = new Date(sundayOfCurrentWeek);
            dayDate.setDate(dayDate.getDate() + index);
            const dateStr = dayDate.toISOString().split('T')[0];
            const orderData = weeklyOrders.find(o => o._id === dateStr);
            return {
                day: day,
                date: dateStr,
                completed: orderData ? orderData.completed : 0
            };
        });

        // Monthly analytics (all 12 months of current year)
        const monthlyPayments = await ordersCollection.aggregate([
            {
                $match: { paymentStatus: 'completed' }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]).toArray();

        const monthlyOrders = await ordersCollection.aggregate([
            {
                $match: { orderStatus: 'confirmed' }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    completed: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]).toArray();

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const paymentsByMonth = monthNames.map((month, index) => {
            const monthData = monthlyPayments.find(m => m._id.month === index + 1);
            return {
                month: month,
                monthNumber: index + 1,
                total: monthData ? monthData.total : 0,
                count: monthData ? monthData.count : 0,
            };
        });

        const ordersByMonth = monthNames.map((month, index) => {
            const monthData = monthlyOrders.find(m => m._id.month === index + 1);
            return {
                month: month,
                monthNumber: index + 1,
                completed: monthData ? monthData.completed : 0,
            };
        });

        // Yearly analytics
        const yearlyPayments = await ordersCollection.aggregate([
            {
                $match: { paymentStatus: 'completed' }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]).toArray();

        const yearlyOrders = await ordersCollection.aggregate([
            {
                $match: { orderStatus: 'confirmed' }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    completed: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]).toArray();

        const totalRevenue = paymentsByMonth.reduce((sum, m) => sum + m.total, 0);

        const dailyOrdersFormatted = dailyOrders.map(d => ({
            date: d._id,
            completed: d.completed || 0
        }));

        const yearlyOrdersFormatted = yearlyOrders.map(y => ({
            year: y._id,
            completed: y.completed || 0
        }));

        return res.status(200).json({
            success: true,
            message: 'Dashboard analytics fetched successfully',
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers,
                    byRole: userCountByRole,
                },
                quotations: {
                    summary: {
                        total: totalQuotations,
                        pending: pendingQuotations,
                        quoted: quotedQuotations,
                        accepted: acceptedQuotations,
                        rejected: rejectedQuotations,
                        requoteRequested: requoteRequestedQuotations,
                        cancelled: cancelledQuotations,
                    },
                },
                orders: {
                    summary: {
                        total: totalOrders,
                        created: createdOrders,
                        confirmed: confirmedOrders,
                        completed: completedOrders,
                        cancelled: cancelledOrders,
                    },
                    daily: dailyOrdersFormatted,
                    weekly: weeklyOrdersFormatted,
                    monthly: ordersByMonth,
                    yearly: yearlyOrdersFormatted,
                },
                contacts: {
                    total: totalContacts,
                },
                newsletter: {
                    total: totalNewsletterSubscribers,
                    active: activeNewsletterSubscribers,
                    inactive: inactiveNewsletterSubscribers,
                },
                payments: {
                    totalRevenue: totalRevenue,
                    daily: dailyPayments,
                    weekly: weeklyPayments,
                    monthly: paymentsByMonth,
                    yearly: yearlyPayments,
                },
            },
        });
    } catch (error) {
        console.error('Fetching dashboard analytics failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    createRole,
    getRole,
    getRoles,
    updateRole,
    createUser,
    getUser,
    getUsers,
    updateUser,
    getDashboardAnalytics,
};
