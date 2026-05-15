const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Load Environment Variables FIRST
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');

const app = express();

// 2. Debugging Check
console.log("------------------------------------");
console.log("Checking URI:", process.env.MONGODB_URI ? "Found ✅" : "Not Found ❌");
console.log("------------------------------------");

// 3. Connect to Database
connectDB();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Basic Route
app.get('/', (req, res) => {
    res.json({ message: "Placement Hub API is running!" });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});