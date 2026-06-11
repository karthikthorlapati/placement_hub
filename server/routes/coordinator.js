const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const Notification = require('../models/Notification')

// Get all students
// ✅ Get students by coordinator's department only
router.get('/students', auth, async (req, res) => {
  try {
const coordinator = await User.findById(req.user.userId)
const department = coordinator.department

const filter = { role: 'student' }

if (department && department !== '') {
  filter.department = department
}

const students = await User.find(filter).select('-password')
    res.json(students)
  } catch (error) {
    console.log('REAL ERROR:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Add a new company
// ✅ Add company with coordinator's department
// ✅ Add company — coordinator only NOT head
router.post('/companies', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const {
      name,
      description,
      role,
      package: pkg,
      minimumCgpa,
      lastDate,
      registrationLink
    } = req.body

    const company = new Company({
      name,
      description,
      role,
      package: pkg,
      minimumCgpa: minimumCgpa || 0,
      department: coordinator.department || 'all',
      lastDate,
      registrationLink: registrationLink || '',
      createdBy: req.user.userId
    })

    await company.save()
    res.status(201).json({
      message: 'Company added successfully!',
      company
    })
  } catch (error) {
    console.log('REAL ERROR:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// Get all companies
// ✅ Get companies by coordinator's department
router.get('/companies', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department

    // Show companies for their department or all departments
    const companies = await Company.find({
      $or: [
        { department: department },
        { department: 'all' }
      ]
    })

    res.json(companies)
  } catch (error) {
    console.log('REAL ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Update company
// ✅ Update company — coordinator only
router.put('/companies/:companyId', auth,
  checkRole('coordinator'),
  async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { status: req.body.status },
      { new: true }
    )
    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }
    res.json({ message: 'Company updated successfully!', company })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Delete company — coordinator only
router.delete('/companies/:companyId', auth,
  checkRole('coordinator'),
  async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.companyId)
    res.json({ message: 'Company deleted successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
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
// ✅ Get company report
// ✅ Get company report filtered by department
router.get('/company-report/:companyId', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department

    // Get students from coordinator's department only
    const filter = { role: 'student' }
    if (department && department !== '') {
      filter.department = department
    }
    const allStudents = await User.find(filter).select('-password')

    const applications = await Application.find({
      company: req.params.companyId
    }).populate({
      path: 'student',
      select: 'name email department rollNumber phone cgpa'
    })

    // Filter valid + same department applications
    const validApplications = applications.filter(
      app => app.student !== null &&
      (department === '' || app.student.department === department)
    )

    const appliedStudentIds = validApplications.map(
      app => app.student._id.toString()
    )

    const notApplied = allStudents.filter(
      student => !appliedStudentIds.includes(student._id.toString())
    )

    res.json({
      applied: validApplications,
      notApplied,
      totalStudents: allStudents.length,
      totalApplied: validApplications.length,
      totalNotApplied: notApplied.length
    })
  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
module.exports = router