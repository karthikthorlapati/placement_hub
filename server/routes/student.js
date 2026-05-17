const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')

// ✅ Get all active companies
router.get('/companies', auth, async (req, res) => {
  try {
    const companies = await Company.find({ status: 'active' })
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Apply for a company
router.post('/apply/:companyId', auth, async (req, res) => {
  try {
    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user.userId,
      company: req.params.companyId
    })

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this company' })
    }

    // Create new application
    const application = new Application({
      student: req.user.userId,
      company: req.params.companyId
    })

    await application.save()
    res.status(201).json({ message: 'Applied successfully!' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get my applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.userId
    }).populate('company')

    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId).select('-password')
    res.json(student)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router