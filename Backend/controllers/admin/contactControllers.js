const database = require('../../config/db');

const getNewsletterCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('newsletter');
};

const getContactsCollection = async () => {
    const db = await database.connectToDatabase();
    return db.collection('contacts');
};

const getNewsletterSubscribers = async (req, res) => {
    try {
        const { skip, limit } = req.pagination;
        const { status } = req.query;
        const newsletterCollection = await getNewsletterCollection();

        const filter = {};
        if (status !== undefined) {
            filter.status = status === 'true';
        }

        const subscribers = await newsletterCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await newsletterCollection.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Newsletter subscribers retrieved successfully',
            data: subscribers,
            pagination: {
                total,
                page: Math.floor(skip / limit) + 1,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Getting newsletter subscribers failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getContacts = async (req, res) => {
    try {
        const { skip, limit } = req.pagination;
        const { status } = req.query;
        const contactsCollection = await getContactsCollection();

        const filter = {};
        if (status !== undefined) {
            filter.status = status === 'true';
        }

        const contacts = await contactsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await contactsCollection.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Contacts retrieved successfully',
            data: contacts,
            pagination: {
                total,
                page: Math.floor(skip / limit) + 1,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Getting contacts failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateNewsletterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const newsletterCollection = await getNewsletterCollection();
        const { ObjectId } = require('mongodb');

        const result = await newsletterCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter subscriber not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Newsletter subscriber status updated successfully'
        });
    } catch (error) {
        console.error('Updating newsletter status failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const deleteNewsletterSubscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const newsletterCollection = await getNewsletterCollection();
        const { ObjectId } = require('mongodb');

        const result = await newsletterCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter subscriber not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Newsletter subscriber deleted successfully'
        });
    } catch (error) {
        console.error('Deleting newsletter subscriber failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const contactsCollection = await getContactsCollection();
        const { ObjectId } = require('mongodb');

        const result = await contactsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Contact status updated successfully'
        });
    } catch (error) {
        console.error('Updating contact status failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactsCollection = await getContactsCollection();
        const { ObjectId } = require('mongodb');

        const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Deleting contact failed:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    getNewsletterSubscribers,
    getContacts,
    updateNewsletterStatus,
    deleteNewsletterSubscriber,
    updateContactStatus,
    deleteContact
};
