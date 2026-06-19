const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole= require('../middleware/role')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const Notification = require('../models/Notification')

// ✅ Get students with resume link
router.get('/students', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department.toUpperCase().trim()

    const students = await User.find({
      role: 'student',
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    }).select('-password')

    res.json(students)
  } catch (error) {
    console.log('REAL ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
// Add a new company


// ✅ Get unique departments for coordinator
router.get('/departments', auth,
  async (req, res) => {
    try {
      const departments = await User.distinct('department', {
        role: 'student',
        department: { $ne: '', $ne: null }
      })

      const normalized = [...new Set(
        departments.map(d => d.toUpperCase().trim())
      )]

      res.json(normalized.sort())
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Add company — coordinator OR head
router.post('/companies', auth,
  checkRole('coordinator', 'head'),
  async (req, res) => {
    try {
      const poster = await User.findById(req.user.userId)
      const {
        name,
        description,
        role,
        package: pkg,
        minimumCgpa,
        lastDate,
        registrationLink,
        department
      } = req.body

      let companyDepartment
      if (poster.role === 'coordinator') {
        companyDepartment = poster.department.toUpperCase().trim()
      } else if (poster.role === 'head') {
        companyDepartment = department ?
          department.toUpperCase().trim() : 'all'
      }

      const company = new Company({
        name,
        description,
        role,
        package: pkg,
        minimumCgpa: minimumCgpa || 0,
        department: companyDepartment,
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
  }
)

// ✅ Get companies by coordinator's department
router.get('/companies', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department.toUpperCase().trim()

    // Show companies for their department OR all departments
    const companies = await Company.find({
      $or: [
        { department: department },
        { department: { $in: ['all', 'ALL', 'All'] } }
      ]
    })

    res.json(companies)
  } catch (error) {
    console.log('REAL ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Full Edit company — coordinator or head
router.put('/companies/:companyId', auth,
  checkRole('coordinator', 'head'),
  async (req, res) => {
    try {
      const {
        name,
        description,
        role,
        package: pkg,
        minimumCgpa,
        lastDate,
        registrationLink,
        status
      } = req.body

      const updateData = {}

      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (role) updateData.role = role
      if (pkg) updateData.package = pkg
      if (minimumCgpa !== undefined) updateData.minimumCgpa = minimumCgpa
      if (lastDate) updateData.lastDate = lastDate
      if (registrationLink !== undefined) {
        updateData.registrationLink = registrationLink
      }
      if (status) updateData.status = status

      const company = await Company.findByIdAndUpdate(
        req.params.companyId,
        updateData,
        { new: true }
      )

      if (!company) {
        return res.status(404).json({ message: 'Company not found!' })
      }

      res.json({ message: 'Company updated successfully!', company })
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Delete company — coordinator or head
router.delete('/companies/:companyId', auth,
  checkRole('coordinator', 'head'),
  async (req, res) => {
    try {
      await Company.findByIdAndDelete(req.params.companyId)
      res.json({ message: 'Company deleted successfully!' })
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

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
    const department = coordinator.department.toUpperCase().trim()

    // Get students from coordinator's department
    const allStudents = await User.find({
      role: 'student',
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    }).select('-password')

    const applications = await Application.find({
      company: req.params.companyId
    }).populate({
      path: 'student',
      select: 'name email department rollNumber phone cgpa'
    })

    const validApplications = applications.filter(
      app => app.student !== null &&
      app.student.department.toUpperCase() === department
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