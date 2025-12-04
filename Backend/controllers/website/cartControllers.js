const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const database = require('../../config/db');

const getCartsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('carts');
};

const addToCart = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { 
            service_id, 
            service_code, 
            service_name, 
            pcb_name, 
            config, 
            lead_time, 
            order_value, 
            tax, 
            total_price, 
            shipment_date 
        } = req.body;

        if (!service_id || !service_name || !order_value) {
            return res.status(400).json({ 
                success: false, 
                message: 'service_id, service_name, and order_value are required' 
            });
        }

        let parsedConfig = {};
        if (config) {
            try {
                parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
            } catch (e) {
                parsedConfig = {};
            }
        }

        const uploadedFiles = {};
        if (req.files) {
            if (req.files.schematic && req.files.schematic[0]) {
                const file = req.files.schematic[0];
                uploadedFiles.schematic = {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: new Date()
                };
            }
            if (req.files.bom && req.files.bom[0]) {
                const file = req.files.bom[0];
                uploadedFiles.bom = {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: new Date()
                };
            }
        }

        const cartsCollection = await getCartsCollection();
        const cartId = uuidv4();
        const timestamp = new Date();

        const cartDocument = {
            cart_id: cartId,
            user_id: userEmail,
            userId: userId,
            service_id: service_id,
            service_code: service_code || null,
            service_name: service_name.trim(),
            pcb_name: pcb_name ? pcb_name.trim() : null,
            config: parsedConfig,
            lead_time: lead_time ? Number(lead_time) : null,
            order_value: Number(order_value),
            tax: tax ? Number(tax) : 0,
            total_price: total_price ? Number(total_price) : Number(order_value),
            shipment_date: shipment_date || null,
            files: uploadedFiles,
            createdBy: userEmail,
            createdTime: timestamp,
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const insertResult = await cartsCollection.insertOne(cartDocument);

        return res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                _id: insertResult.insertedId,
                cart_id: cartId,
                ...cartDocument
            },
        });
    } catch (error) {
        console.error('Add to cart failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getCart = async (req, res) => {
    try {
        const { userId: authUserId } = req;
        const { userId: queryUserId } = req.query;

        let targetUserId = queryUserId || authUserId;

        const cartsCollection = await getCartsCollection();
        const cartItems = await cartsCollection
            .find({ userId: targetUserId })
            .sort({ createdAt: -1 })
            .toArray();

        const totalItems = cartItems.length;
        const totalValue = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

        return res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: {
                items: cartItems,
                summary: {
                    totalItems,
                    totalValue,
                },
            },
        });
    } catch (error) {
        console.error('Get cart failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { userId, userEmail } = req;
        const { cartId } = req.params;
        const { 
            pcb_name, 
            config, 
            lead_time, 
            order_value, 
            tax, 
            total_price, 
            shipment_date 
        } = req.body;

        if (!cartId) {
            return res.status(400).json({ success: false, message: 'cartId is required' });
        }

        const cartsCollection = await getCartsCollection();
        const cartItem = await cartsCollection.findOne({ 
            cart_id: cartId,
            userId: userId 
        });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        const timestamp = new Date();
        const updateData = {
            modifiedBy: userEmail,
            modifiedTime: timestamp,
            updatedAt: timestamp
        };

        if (pcb_name !== undefined) {
            updateData.pcb_name = pcb_name ? pcb_name.trim() : null;
        }

        if (config !== undefined) {
            try {
                updateData.config = typeof config === 'string' ? JSON.parse(config) : config;
            } catch (e) {
                updateData.config = config;
            }
        }

        if (lead_time !== undefined) {
            updateData.lead_time = lead_time ? Number(lead_time) : null;
        }

        if (order_value !== undefined) {
            updateData.order_value = Number(order_value);
        }

        if (tax !== undefined) {
            updateData.tax = Number(tax);
        }

        if (total_price !== undefined) {
            updateData.total_price = Number(total_price);
        }

        if (shipment_date !== undefined) {
            updateData.shipment_date = shipment_date;
        }

        if (req.files) {
            const uploadedFiles = { ...cartItem.files };
            if (req.files.schematic && req.files.schematic[0]) {
                const file = req.files.schematic[0];
                uploadedFiles.schematic = {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: timestamp
                };
            }
            if (req.files.bom && req.files.bom[0]) {
                const file = req.files.bom[0];
                uploadedFiles.bom = {
                    filename: file.filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: timestamp
                };
            }
            updateData.files = uploadedFiles;
        }

        await cartsCollection.updateOne(
            { cart_id: cartId, userId: userId },
            { $set: updateData }
        );

        const updatedCartItem = await cartsCollection.findOne({ cart_id: cartId });

        return res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: updatedCartItem,
        });
    } catch (error) {
        console.error('Update cart item failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { userId } = req;
        const { cartId } = req.params;

        if (!cartId) {
            return res.status(400).json({ success: false, message: 'cartId is required' });
        }

        const cartsCollection = await getCartsCollection();
        const result = await cartsCollection.deleteOne({ 
            cart_id: cartId,
            userId: userId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
        });
    } catch (error) {
        console.error('Remove from cart failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const clearCart = async (req, res) => {
    try {
        const { userId } = req;

        const cartsCollection = await getCartsCollection();
        const result = await cartsCollection.deleteMany({ userId: userId });

        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error('Clear cart failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
