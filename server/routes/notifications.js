const express = require('express')
const router = express.Router()

// Temporary dummy notifications route
router.get('/', async (req, res) => {
  res.json([])
})

// Mark single notification
router.put('/:id', async (req, res) => {
  res.json({ message: 'Notification marked as read' })
})

// Mark all notifications
router.put('/mark-all/read', async (req, res) => {
  res.json({ message: 'All notifications marked as read' })
})

module.exports = router