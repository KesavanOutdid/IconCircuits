const database = require('../../config/db');

const getNewsletterCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('newsletter');
};

const getContactsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('contacts');
};

const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const newsletterCollection = await getNewsletterCollection();

        const existingSubscriber = await newsletterCollection.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).json({
                success: false,
                message: 'Email already subscribed'
            });
        }

        const timestamp = new Date();
        await newsletterCollection.insertOne({
            email,
            status: true,
            createdAt: timestamp
        });

        return res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: { email }
        });
    } catch (error) {
        console.error('Newsletter subscription failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (name, email, subject, message)'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const contactsCollection = await getContactsCollection();

        const timestamp = new Date();
        await contactsCollection.insertOne({
            name,
            email,
            subject,
            message,
            status: true,
            createdAt: timestamp
        });

        return res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                email,
                name,
                subject,
                message
            }
        });
    } catch (error) {
        console.error('Contact form submission failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    subscribeNewsletter,
    submitContact
};
