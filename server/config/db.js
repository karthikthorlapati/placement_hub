const dns = require('dns');
const mongoose = require('mongoose');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI not set. Starting server without a database connection.');
        return;
    }

    const tryConnect = async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 8000,
                connectTimeoutMS: 8000,
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.error('⚠️ MongoDB connection failed. Retrying in 10 seconds...');
            console.error(error.message);
            setTimeout(tryConnect, 10000);
        }
    };

    await tryConnect();
};

module.exports = connectDB;