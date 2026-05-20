const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const Company = require('../models/Company')
const Application = require('../models/Application')

// Admin middleware check
router.use(auth)

router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied'
    })
  }
  next()
})


// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' })
    const totalCompanies = await Company.countDocuments()
    const totalApplications = await Application.countDocuments()

    res.json({
      totalStudents,
      totalCoordinators,
      totalCompanies,
      totalApplications
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})


// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})


// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId)

    res.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})


// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find()
    res.json(companies)

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})


// Delete company
router.delete('/companies/:companyId', async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.companyId)

    res.json({
      message: 'Company deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})


// Get all applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email')
      .populate('company', 'name role')

    res.json(applications)

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router