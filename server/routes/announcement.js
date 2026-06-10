const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/role')
const Announcement = require('../models/Announcement')
const User = require('../models/User')

// ✅ Get announcements for student
router.get('/student', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
    const department = student.department

    // Get announcements for student's department or all
    const announcements = await Announcement.find({
      isActive: true,
      $or: [
        { department: department },
        { department: 'all' }
      ]
    })
    .populate('postedBy', 'name role')
    .sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all announcements for coordinator
router.get('/coordinator', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const announcements = await Announcement.find({
      $or: [
        { department: coordinator.department },
        { department: 'all' }
      ]
    })
    .populate('postedBy', 'name role')
    .sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all announcements for head/admin
router.get('/all', auth,
  checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const announcements = await Announcement.find()
        .populate('postedBy', 'name role')
        .sort({ createdAt: -1 })
      res.json(announcements)
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Create announcement (coordinator/head/admin)
router.post('/', auth,
  checkRole('coordinator', 'head', 'admin'),
  async (req, res) => {
    try {
      const { title, message, department, priority } = req.body
      const poster = await User.findById(req.user.userId)

      if (!title || !message) {
        return res.status(400).json({
          message: 'Title and message are required!'
        })
      }

      const announcement = new Announcement({
        title,
        message,
        postedBy: req.user.userId,
        postedByRole: req.user.role,
        department: department || poster.department || 'all',
        priority: priority || 'medium'
      })

      await announcement.save()
      res.status(201).json({
        message: 'Announcement posted successfully!',
        announcement
      })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Delete announcement
router.delete('/:id', auth,
  checkRole('coordinator', 'head', 'admin'),
  async (req, res) => {
    try {
      await Announcement.findByIdAndDelete(req.params.id)
      res.json({ message: 'Announcement deleted successfully!' })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Toggle announcement active/inactive
router.put('/:id', auth,
  checkRole('coordinator', 'head', 'admin'),
  async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        { isActive: req.body.isActive },
        { new: true }
      )
      res.json({
        message: 'Announcement updated!',
        announcement
      })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

module.exports = router