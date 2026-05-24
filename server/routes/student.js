const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const bcrypt = require('bcryptjs')


// ✅ Get all active companies
router.get('/companies', auth, async (req, res) => {
  try {
    const companies = await Company.find({ status: 'active' })
    res.json(companies)
  } catch (error) {
  console.log('Apply Error:', error)
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
// ✅ Get my applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.userId
    }).populate('company')

    // Filter out null companies
    const validApplications = applications.filter(
      app => app.company !== null && app.company !== undefined
    )

    res.json(validApplications)

  } catch (error) {
    console.log('Error:', error)
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

// ✅ Check if already applied
router.get('/check-application/:companyId', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      student: req.user.userId,
      company: req.params.companyId
    })

    res.json({ applied: !!application })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, department, rollNumber } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, department, rollNumber },
      { new: true }
    ).select('-password')

    res.json({
      message: 'Profile updated successfully!',
      user: updatedUser
    })

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    // Get user with password
    const user = await User.findById(req.user.userId)

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect!' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await User.findByIdAndUpdate(
      req.user.userId,
      { password: hashedPassword }
    )

    res.json({ message: 'Password changed successfully!' })

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router