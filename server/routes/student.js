const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const Notification = require('../models/Notification')  // ✅ Must be here!
const sendNotification = require('../utils/sendNotification')



// ✅ Get companies — filtered by university
router.get('/companies', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
    const department = student.department.toUpperCase().trim()
    const today = new Date()

    const companies = await Company.find({
      university: req.user.universityId,  // ← KEY FILTER
      status: 'active',
      lastDate: { $gte: today },
      $or: [
        { department: department },
        { department: { $in: ['all', 'ALL'] } }
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
      createdAt: company.createdAt,
      isEligible: student.cgpa >= company.minimumCgpa
    }))

    res.json(companiesWithEligibility)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Apply — validate same university
router.post('/apply/:companyId', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId)

    if (!company) {
      return res.status(404).json({ message: 'Company not found!' })
    }

    // ✅ Security check — company must belong to same university
    if (company.university?.toString() !== req.user.universityId?.toString()) {
      return res.status(403).json({
        message: 'You cannot apply to companies from other universities!'
      })
    }

    const student = await User.findById(req.user.userId)

    if (student.cgpa < company.minimumCgpa) {
      return res.status(403).json({
        message: `Minimum ${company.minimumCgpa} CGPA required!`
      })
    }

    const existingApplication = await Application.findOne({
      student: req.user.userId,
      company: req.params.companyId
    })

    if (existingApplication) {
      return res.status(400).json({
        message: 'Already applied!'
      })
    }

    const application = new Application({
      student: req.user.userId,
      company: req.params.companyId,
      university: req.user.universityId,  // ← NEW
      timeline: [{ status: 'applied', date: new Date() }]
    })

    await application.save()

    await sendNotification(
      req.user.userId,
      `✅ You have successfully applied for ${company.name}!`,
      'application'
    )

    res.status(201).json({ message: 'Applied successfully!' })

  } catch (error) {
    console.log('Error:', error)
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


// ✅ Get my applications with timeline
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.userId
    }).populate('company').sort({ createdAt: -1 })

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

// ✅ Update student profile (now includes department)
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      cgpa,
      resumeLink,
      skills,
      linkedin,
      github,
      department
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
        github,
        department: department ? department.toUpperCase().trim() : undefined
      },
      { new: true, runValidators: true }
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