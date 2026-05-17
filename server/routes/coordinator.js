const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')

// ✅ Get all students
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password')
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Add a new company
router.post('/companies', auth, async (req, res) => {
  try {
    const { name, description, role, package: pkg, eligibility, lastDate } = req.body

    const company = new Company({
      name,
      description,
      role,
      package: pkg,
      eligibility,
      lastDate,
      createdBy: req.user.userId
    })

    await company.save()
    res.status(201).json({ message: 'Company added successfully!', company })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all companies
router.get('/companies', auth, async (req, res) => {
  try {
    const companies = await Company.find()
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all applications for a company
router.get('/applications/:companyId', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      company: req.params.companyId
    }).populate('student', '-password')

    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalCompanies = await Company.countDocuments()
    const totalApplications = await Application.countDocuments()

    res.json({
      totalStudents,
      totalCompanies,
      totalApplications
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router