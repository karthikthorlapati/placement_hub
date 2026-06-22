const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const studentRoutes = require('./routes/student')
const coordinatorRoutes = require('./routes/coordinator')
const adminRoutes = require('./routes/admin')
const headRoutes = require('./routes/head')
const notificationRoutes = require('./routes/notification')
const announcementRoutes = require('./routes/announcement')
const universityRoutes = require('./routes/university')  // ← NEW

const app = express()
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000',
    'http://localhost:5500'
  ],
  credentials: true
}))

connectDB()

app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/coordinator', coordinatorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/head', headRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/universities', universityRoutes)  // ← NEW

app.get('/', (req, res) => {
  res.json({ message: 'Placement Hub Server Running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})