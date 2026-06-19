const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Notification = require('../models/Notification')  // ✅ Must be here!
const sendNotification = require('../utils/sendNotification')



// ✅ Get active companies — exclude expired
router.get('/companies', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
    const department = student.department.toUpperCase().trim()
    const today = new Date()

    const companies = await Company.find({
      status: 'active',
      lastDate: { $gte: today },  // ✅ Only future dates
      $or: [
        { department: department },
        { department: { $in: ['all', 'ALL', 'All'] } }
      ]
    })

    const companiesWithEligibility = companies.map(company => ({
      _id: company._id,
      name: company.name,
      description: company.description,
      role: company.role,
      package: company.package,
      minimumCgpa: company.minimumCgpa,
      department: company.department,
      lastDate: company.lastDate,
      registrationLink: company.registrationLink,
      status: company.status,
      createdBy: company.createdBy,
      createdAt: company.createdAt,
      isEligible: student.cgpa >= company.minimumCgpa
    }))

    res.json(companiesWithEligibility)
  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
// ✅ Apply for company with notification
router.post('/apply/:companyId', auth, async (req, res) => {
  try {
    console.log('=== APPLY DEBUG ===')
    console.log('Student ID:', req.user.userId)
    console.log('Company ID:', req.params.companyId)

    const company = await Company.findById(req.params.companyId)
    if (!company) {
      return res.status(404).json({ message: 'Company not found!' })
    }
    console.log('Company found:', company.name)

    const student = await User.findById(req.user.userId)
    console.log('Student found:', student.name, 'CGPA:', student.cgpa)

    // Check CGPA eligibility
    if (student.cgpa < company.minimumCgpa) {
      return res.status(403).json({
        message: `You need minimum ${company.minimumCgpa} CGPA to apply! Your CGPA is ${student.cgpa}`
      })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: req.user.userId,
      company: req.params.companyId
    })

    if (existingApplication) {
      return res.status(400).json({
        message: 'Already applied for this company!'
      })
    }

    console.log('Creating application...')
    // Create application
    const application = new Application({
      student: req.user.userId,
      company: req.params.companyId
    })

    await application.save()
    console.log('Application saved successfully')

    console.log('Creating notification...')

    await sendNotification(
      req.user.userId,
      `✅ You have successfully applied for ${company.name}!`,
      'application'
    )

    console.log('Notification saved successfully')


    res.status(201).json({ message: 'Applied successfully!' })

  } catch (error) {
    console.log('=== APPLY ERROR ===')
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})


// ✅ Get profile completion percentage
router.get('/profile-completion', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
      .select('-password')

    const fields = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'department', label: 'Department' },
      { key: 'rollNumber', label: 'Roll Number' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'resumeLink', label: 'Resume Link' },
      { key: 'skills', label: 'Skills' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'github', label: 'GitHub' }
    ]

    const completed = fields.filter(field => {
      const value = student[field.key]
      return value !== '' && value !== null &&
        value !== undefined && value !== 0
    })

    const missing = fields.filter(field => {
      const value = student[field.key]
      return value === '' || value === null ||
        value === undefined || value === 0
    })

    const percentage = Math.round(
      (completed.length / fields.length) * 100
    )

    res.json({
      percentage,
      completed: completed.map(f => f.label),
      missing: missing.map(f => f.label)
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})


// ✅ Get my applications — show all including expired
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.userId
    }).populate('company')

    // Show all applications even if company is expired
    const validApplications = applications.filter(
      app => app.company !== null
    )

    res.json(validApplications)

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})


// ✅ Delete student — head can delete any, coordinator can delete own department
router.delete('/delete/:userId', auth, async (req, res) => {
  try {
    const requester = await User.findById(req.user.userId)
    const targetStudent = await User.findById(req.params.userId)

    if (!targetStudent || targetStudent.role !== 'student') {
      return res.status(404).json({ message: 'Student not found!' })
    }

    // Head can delete any student
    if (requester.role === 'head') {
      await User.findByIdAndDelete(req.params.userId)
      return res.json({ message: 'Student deleted successfully!' })
    }

    // Coordinator can only delete students from their department
    if (requester.role === 'coordinator') {
      if (targetStudent.department !== requester.department) {
        return res.status(403).json({
          message: 'You can only delete students from your department!'
        })
      }
      await User.findByIdAndDelete(req.params.userId)
      return res.json({ message: 'Student deleted successfully!' })
    }

    return res.status(403).json({
      message: 'Only head or coordinator can delete students!'
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
      .select('-password')
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
    const {
      name,
      phone,
      cgpa,
      resumeLink,
      skills,
      linkedin,
      github
    } = req.body

    const updatedStudent = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        phone,
        cgpa,
        resumeLink,
        skills,
        linkedin,
        github
      },
      { new: true }
    ).select('-password')

    res.json({
      message: 'Profile updated successfully!',
      student: updatedStudent
    })
  } catch (error) {
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