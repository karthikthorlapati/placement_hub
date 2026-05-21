const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const Notification = require('../models/Notification')

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
// ✅ Update application status + send notification
router.put('/applications/:applicationId', auth, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status: req.body.status },
      { new: true }
    ).populate('student').populate('company')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Send notification to student
    const notification = new Notification({
      user: application.student._id,
      message: `Your application for ${application.company.name} has been ${req.body.status}!`,
      type: 'application'
    })
    await notification.save()

    res.json({
      message: 'Application status updated!',
      application
    })

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
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
// ✅ Get company report - who applied and who didn't
router.get('/company-report/:companyId', auth, async (req, res) => {
  try {
    // Get all students
    const allStudents = await User.find({ role: 'student' }).select('-password')

    // Get all applications for this company
    const applications = await Application.find({
      company: req.params.companyId
    }).populate('student', '-password')

    // Get list of student IDs who applied
    const appliedStudentIds = applications.map(app =>
      app.student._id.toString()
    )

    // Find students who did NOT apply
    const notApplied = allStudents.filter(student =>
      !appliedStudentIds.includes(student._id.toString())
    )

    res.json({
      applied: applications,
      notApplied: notApplied,
      totalStudents: allStudents.length,
      totalApplied: applications.length,
      totalNotApplied: notApplied.length
    })

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router