const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Notification = require('../models/Notification')

// ✅ Get all notifications for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId
    }).sort({ createdAt: -1 })

    res.json(notifications)

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Mark notification as read
router.put('/:notificationId', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    )

    res.json({ message: 'Notification marked as read!', notification })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Mark all notifications as read
router.put('/mark-all/read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId },
      { isRead: true }
    )

    res.json({ message: 'All notifications marked as read!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get unread notifications count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.userId,
      isRead: false
    })

    res.json({ count })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router