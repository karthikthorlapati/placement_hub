const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/role')
const Announcement = require('../models/Announcement')
const User = require('../models/User')

// ✅ Get announcements for student — same university
router.get('/student', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
    const department = student.department.toUpperCase().trim()
    const now = new Date()

    const announcements = await Announcement.find({
      university: req.user.universityId,  // ← KEY FILTER
      isActive: true,
      expiryDate: { $gte: now },
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

// ✅ Get announcements for coordinator
router.get('/coordinator', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department.toUpperCase().trim()
    const now = new Date()

    const announcements = await Announcement.find({
      isActive: true,
      expiryDate: { $gte: now },
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

// ✅ Get all announcements for head/admin
router.get('/all', auth,
  checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const now = new Date()
      const announcements = await Announcement.find({
        isActive: true,
        expiryDate: { $gte: now }
      })
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
// ✅ Create announcement — auto-tagged with university
router.post('/', auth,
  checkRole('coordinator', 'head', 'admin'),
  async (req, res) => {
    try {
      const { title, message, department, expiryDate } = req.body
      const poster = await User.findById(req.user.userId)

      if (!title || !message) {
        return res.status(400).json({
          message: 'Title and message are required!'
        })
      }

      if (!expiryDate || new Date(expiryDate) <= new Date()) {
        return res.status(400).json({
          message: 'Valid future expiry date required!'
        })
      }

      const announcement = new Announcement({
        title,
        message,
        postedBy: req.user.userId,
        postedByRole: req.user.role,
        university: req.user.universityId,  // ← KEY
        department: department || poster.department || 'all',
        expiryDate: new Date(expiryDate)
      })

      await announcement.save()
      res.status(201).json({
        message: 'Announcement posted successfully!',
        announcement
      })
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
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

module.exports = router