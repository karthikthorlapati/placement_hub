const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole= require('../middleware/role')
const Company = require('../models/Company')
const Application = require('../models/Application')
const User = require('../models/User')
const Notification = require('../models/Notification')

// ✅ Get students — same university + same department
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      university: req.user.universityId,  // ← KEY FILTER
      department: {
        $regex: new RegExp(`^${req.user.department}$`, 'i')
      }
    }).select('-password')

    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
// Add a new company

// ✅ Get department placement statistics
router.get('/placement-stats', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department.toUpperCase().trim()

    const deptStudents = await User.find({
      role: 'student',
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    })

    const deptStudentIds = deptStudents.map(s => s._id.toString())

    const selectedApplications = await Application.find({
      status: 'selected'
    }).populate('student', 'name department rollNumber')
      .populate('company', 'name package role')

    const validSelected = selectedApplications.filter(
      app => app.student !== null &&
      app.company !== null &&
      deptStudentIds.includes(app.student._id.toString())
    )

    const totalPlaced = validSelected.length
    const totalStudents = deptStudents.length

    const packageNumbers = validSelected.map(app => {
      const pkg = app.company.package
      const match = pkg.match(/[\d.]+/)
      return match ? parseFloat(match[0]) : 0
    }).filter(p => p > 0)

    const averagePackage = packageNumbers.length > 0
      ? (packageNumbers.reduce((a, b) => a + b, 0) / packageNumbers.length).toFixed(2)
      : 0

    const highestPackage = packageNumbers.length > 0
      ? Math.max(...packageNumbers)
      : 0

    const companyCounts = {}
    validSelected.forEach(app => {
      const companyName = app.company.name
      companyCounts[companyName] = (companyCounts[companyName] || 0) + 1
    })

    const topCompanies = Object.entries(companyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const overallPlacementPercentage = totalStudents > 0
      ? Math.round((totalPlaced / totalStudents) * 100)
      : 0

    res.json({
      department,
      totalStudents,
      totalPlaced,
      overallPlacementPercentage,
      averagePackage,
      highestPackage,
      topCompanies
    })

  } catch (error) {
    console.log('Error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
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

// ✅ Add company — auto-tagged with university
router.post('/companies', auth,
  checkRole('coordinator', 'head'),
  async (req, res) => {
    try {
      const poster = await User.findById(req.user.userId)
      const {
        name, description, role,
        package: pkg, minimumCgpa,
        lastDate, registrationLink, department
      } = req.body

      let companyDepartment
      if (poster.role === 'coordinator') {
        companyDepartment = poster.department.toUpperCase().trim()
      } else {
        companyDepartment = department ?
          department.toUpperCase().trim() : 'all'
      }

      const company = new Company({
        name, description, role,
        package: pkg,
        minimumCgpa: minimumCgpa || 0,
        department: companyDepartment,
        university: req.user.universityId,  // ← KEY
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
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get companies — same university
router.get('/companies', auth, async (req, res) => {
  try {
    const department = req.user.department.toUpperCase().trim()

    const companies = await Company.find({
      university: req.user.universityId,  // ← KEY FILTER
      $or: [
        { department: department },
        { department: { $in: ['all', 'ALL'] } }
      ]
    })

    res.json(companies)
  } catch (error) {
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



// ✅ Get applications for a company — same university
router.get('/applications/:companyId', auth, async (req, res) => {
  try {
    const applications = await Application.find({
      company: req.params.companyId,
      university: req.user.universityId  // ← KEY FILTER
    }).populate('student', '-password')
      .populate('company')

    res.json(applications.filter(
      app => app.student !== null && app.company !== null
    ))
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
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

// ✅ Get coordinator stats — filtered by university AND department
router.get('/stats', auth, async (req, res) => {
  try {
    const coordinator = await User.findById(req.user.userId)
    const department = coordinator.department.toUpperCase().trim()

    // Count students in coordinator's department only
    const totalStudents = await User.countDocuments({
      role: 'student',
      university: req.user.universityId,
      department: { $regex: new RegExp(`^${department}$`, 'i') }
    })

    // Count companies for coordinator's department only
    const totalCompanies = await Company.countDocuments({
      university: req.user.universityId,
      $or: [
        { department: { $regex: new RegExp(`^${department}$`, 'i') } },
        { department: { $in: ['all', 'ALL'] } }
      ]
    })

    // Count applications for coordinator's department companies
    const allCompanies = await Company.find({
      university: req.user.universityId,
      $or: [
        { department: { $regex: new RegExp(`^${department}$`, 'i') } },
        { department: { $in: ['all', 'ALL'] } }
      ]
    }).select('_id')

    const companyIds = allCompanies.map(c => c._id)

    const totalApplications = await Application.countDocuments({
      company: { $in: companyIds },
      university: req.user.universityId
    })

    const totalSelected = await Application.countDocuments({
      company: { $in: companyIds },
      university: req.user.universityId,
      status: 'selected'
    })

    res.json({
      totalStudents,
      totalCompanies,
      totalApplications,
      totalSelected
    })
  } catch (error) {
    console.log('Stats error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
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