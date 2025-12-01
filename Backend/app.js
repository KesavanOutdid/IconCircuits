// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// Core Modules and Dependencies
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./middlewares/requestLogger');
const { connectToDatabase } = require('./config/db');

// Import Routes
const adminRoutes = require('./routes/admin/adminRoutes');
const websiteRoutes = require('./routes/websiteRoutes');

const path = require('path');

const ensureInitialData = async (db) => {
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');

    const roles = [
        { role_id: 1, name: 'Superadmin' },
        { role_id: 2, name: 'Enduser' },
    ];

    for (const role of roles) {
        const existingRole = await rolesCollection.findOne({ role_id: role.role_id });
        if (!existingRole) {
            const timestamp = new Date();
            await rolesCollection.insertOne({
                role_id: role.role_id,
                name: role.name,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
        }
    }

    const adminEmail = 'admin@gmail.com';
    const normalizedEmail = adminEmail.trim().toLowerCase();
    const adminExists = await usersCollection.findOne({ email: normalizedEmail });

    if (!adminExists) {
        const latestUser = await usersCollection.find().sort({ userId: -1 }).limit(1).toArray();
        const nextUserId = latestUser.length ? (Number(latestUser[0].userId) || 0) + 1 : 1;
        const timestamp = new Date();
        await usersCollection.insertOne({
            userId: nextUserId,
            name: 'Default Admin',
            email: normalizedEmail,
            password: '1234',
            roleId: 1,
            phone: null,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }
};

// Initialize Express App
const app = express();

// Middleware: Secure HTTP Headers
app.use(helmet());

// Middleware: CORS - Allow all origins (can be restricted later)
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
}));

// Middleware: Parse incoming JSON
app.use(express.json());

// Logger Middleware for Incoming Requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/website', websiteRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
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

        httpServer.listen(HTTP_PORT, () => {
            const logMessage = `HTTP Server listening on port ${HTTP_PORT}`;
            console.log(logMessage);
            logger.info(logMessage);
        });
    } catch (err) {
        console.error('Failed to initialize application:', err);
        process.exit(1);
    }
};

startApplication();
