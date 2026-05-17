const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const studentRoutes = require('./routes/student')
const coordinatorRoutes = require('./routes/coordinator')

const app = express()
app.use(express.json())
app.use(cors())

// Connect Database
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/coordinator', coordinatorRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Placement Hub Server Running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})