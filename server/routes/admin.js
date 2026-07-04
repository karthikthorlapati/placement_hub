const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/role')
const User = require('../models/User')
const Company = require('../models/Company')
const Application = require('../models/Application')
const University = require('../models/University')

// ✅ Get all users across all universities
router.get('/users', auth, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .populate('university', 'name code')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Delete user
router.delete('/users/:userId', auth,
  checkRole('admin'),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.userId)
      res.json({ message: 'User deleted successfully!' })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Get all companies across all universities
router.get('/companies', auth, checkRole('admin'), async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('university', 'name code')
      .sort({ createdAt: -1 })
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Delete company
router.delete('/companies/:companyId', auth,
  checkRole('admin'),
  async (req, res) => {
    try {
      await Company.findByIdAndDelete(req.params.companyId)
      res.json({ message: 'Company deleted successfully!' })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Get all applications across all universities
router.get('/applications', auth, checkRole('admin'),
  async (req, res) => {
    try {
      const applications = await Application.find()
        .populate('student', '-password')
        .populate('company')
        .populate('university', 'name code')
        .sort({ createdAt: -1 })

      const valid = applications.filter(
        app => app.student !== null && app.company !== null
      )
      res.json(valid)
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Get all universities (admin sees everything)
router.get('/universities', auth, checkRole('admin'),
  async (req, res) => {
    try {
      const universities = await University.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
      res.json(universities)
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Toggle university active/inactive
router.put('/universities/:id', auth, checkRole('admin'),
  async (req, res) => {
    try {
      const university = await University.findByIdAndUpdate(
        req.params.id,
        { isActive: req.body.isActive },
        { new: true }
      )
      res.json({ message: 'University updated!', university })
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

// ✅ Get overall platform stats
router.get('/stats', auth, checkRole('admin'), async (req, res) => {
  try {
    const totalUniversities = await University.countDocuments()
    const totalUsers = await User.countDocuments({
      role: { $ne: 'admin' }
    })
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalCoordinators = await User.countDocuments({
      role: 'coordinator'
    })
    const totalHeads = await User.countDocuments({ role: 'head' })
    const totalCompanies = await Company.countDocuments()
    const totalApplications = await Application.countDocuments()
    const totalSelected = await Application.countDocuments({
      status: 'selected'
    })

    res.json({
      totalUniversities,
      totalUsers,
      totalStudents,
      totalCoordinators,
      totalHeads,
      totalCompanies,
      totalApplications,
      totalSelected
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router