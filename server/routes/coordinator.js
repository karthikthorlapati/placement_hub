const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')

// Get all students
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password')
    res.json(students)
  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Add a new company
router.post('/companies', auth, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body)
    console.log("USER:", req.user)

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

    res.status(201).json({
      message: 'Company added successfully!',
      company
    })

  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Get all companies
router.get('/companies', auth, async (req, res) => {
  try {
    const companies = await Company.find()
    res.json(companies)
  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Update company
router.put('/companies/:companyId', auth, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { status: req.body.status },
      { new: true }
    )

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      })
    }

    res.json({
      message: 'Company updated successfully!',
      company
    })

  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Delete company
router.delete('/companies/:companyId', auth, async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.companyId)

    res.json({
      message: 'Company deleted successfully!'
    })

  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Get applications
router.get('/applications/:companyId', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      company: req.params.companyId
    }).populate('student', '-password')

    res.json(applications)

  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Update application
router.put('/applications/:applicationId', auth, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status: req.body.status },
      { new: true }
    )

    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      })
    }

    res.json({
      message: 'Application status updated!',
      application
    })

  } catch (error) {
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Dashboard stats
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
    console.log("REAL ERROR:", error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router