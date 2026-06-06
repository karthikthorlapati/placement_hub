const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/role')
const User = require('../models/User')
const Company = require('../models/Company')
const Application = require('../models/Application')

// ✅ Get all users
router.get('/users', auth, checkRole('admin'), async (req, res) => {
  try {
    console.log('Admin route hit by role:', req.user.role)
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Delete a user
router.delete('/users/:userId', auth, checkRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId)
    res.json({ message: 'User deleted successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all companies
router.get('/companies', auth, checkRole('admin'), async (req, res) => {
  try {
    const companies = await Company.find()
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Delete a company
router.delete('/companies/:companyId', auth, checkRole('admin'), async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.companyId)
    res.json({ message: 'Company deleted successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all applications
// ✅ Get all applications
router.get('/applications', auth, checkRole('admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', '-password')
      .populate('company')

    // Filter out null companies and students
    const validApplications = applications.filter(
      app => app.company !== null && app.student !== null
    )

    res.json(validApplications)

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get admin dashboard stats
router.get('/stats', auth, checkRole('admin'), async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router