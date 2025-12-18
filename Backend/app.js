// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config({ quiet: true });

// Core Modules and Dependencies
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const logger = require('./middlewares/requestLogger');
const { connectToDatabase } = require('./config/db');
const { setupSwagger } = require('./config/swagger');

// Import Routes
const adminRoutes = require('./routes/admin/adminRoutes');
const websiteRoutes = require('./routes/websiteRoutes');

const path = require('path');

const ensureInitialData = async (db) => {
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    console.log('Initializing default data...');

    const roles = [
        { name: 'Superadmin' },
        { name: 'Enduser' },
    ];

    const roleIds = {};

    for (const role of roles) {
        const existingRole = await rolesCollection.findOne({ name: { $regex: `^${role.name}$`, $options: 'i' } });
        if (!existingRole) {
            const roleId = uuidv4();
            const timestamp = new Date();
            await rolesCollection.insertOne({
                role_id: roleId,
                name: role.name,
                status: true,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
            roleIds[role.name] = roleId;
            console.log(`✓ Role created: ${role.name} (ID: ${roleId})`);
        } else {
            roleIds[role.name] = existingRole.role_id;
            console.log(`✓ Role already exists: ${role.name} (ID: ${existingRole.role_id})`);
        }
    }

    const adminEmail = 'admin@gmail.com';
    const normalizedEmail = adminEmail.trim().toLowerCase();
    const adminExists = await usersCollection.findOne({ email: normalizedEmail });

    if (!adminExists) {
        const userId = uuidv4();
        const timestamp = new Date();
        await usersCollection.insertOne({
            userId: userId,
            name: 'Default Admin',
            email: normalizedEmail,
            password: '1234',
            roleId: roleIds['Superadmin'],
            phone: null,
            status: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        console.log(`✓ Admin user created: ${normalizedEmail} (userId: ${userId})`);
        console.log(`  Password: 1234 (Change this after first login!)`);
    } else {
        console.log(`✓ Admin user already exists: ${normalizedEmail} (userId: ${adminExists.userId})`);
    }

    console.log('Initial data setup complete!\n');
};

// Initialize Express App
const app = express();

// Middleware: CORS - Allow all origins (must be before other middleware)
app.use(cors());

// Middleware: Secure HTTP Headers (skip for Swagger docs and file serving)
app.use((req, res, next) => {
    if (req.path.startsWith('/api-docs') || req.path.includes('/cart/file')) {
        return next();
    }
    helmet({
        contentSecurityPolicy: false,
    })(req, res, next);
});

// Middleware: Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logger Middleware for Incoming Requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Swagger API Documentation
setupSwagger(app);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/website', websiteRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An error occurred, please try again later.',
    });
});

// Create HTTP Server
const httpServer = http.createServer(app);

// Set Port
const HTTP_PORT = process.env.HTTP_PORT || 6767;

// Start Server with Database Connection
const startApplication = async () => {
    try {
        const db = await connectToDatabase();
        await ensureInitialData(db);

        if (process.env.SEED_ONLY === 'true') {
            console.log('Initial data ensured');
            process.exit(0);
        }

        httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
            const logMessage = `HTTP Server listening on port ${HTTP_PORT}`;
            console.log(logMessage);
            console.log(`Swagger UI: http://localhost:${HTTP_PORT}/api-docs`);
            
            const os = require('os');
            const interfaces = os.networkInterfaces();
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        console.log(`Network Access: http://${iface.address}:${HTTP_PORT}/api-docs`);
                    }
                }
            }
            
            logger.info(logMessage);
        });
    } catch (err) {
        console.error('Failed to initialize application:', err);
        process.exit(1);
    }
};

startApplication();
