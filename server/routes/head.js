const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/role')
const User = require('../models/User')
const Company = require('../models/Company')
const Application = require('../models/Application')
const Notification = require('../models/Notification')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')

// Setup multer for CSV upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' ||
        file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files allowed!'))
    }
  }
})

// ✅ Get all departments
// ✅ Get unique departments (no duplicates)
router.get('/departments', auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const departments = await User.distinct('department', {
        role: 'student',
        department: { $ne: '', $ne: null }
      })

      // Normalize to uppercase and remove duplicates
      const normalized = [...new Set(
        departments.map(d => d.toUpperCase().trim())
      )]

      res.json(normalized.sort())
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get all students (all departments)
router.get('/students', auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const { department } = req.query
      const filter = { role: 'student' }
      if (department && department !== 'all') {
        filter.department = department
      }
      const students = await User.find(filter).select('-password')
      res.json(students)
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get all companies (all departments)
// ✅ Get all companies
router.get('/companies', auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const companies = await Company.find()
      res.json(companies)
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get all applications
router.get('/applications', auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const applications = await Application.find()
        .populate('student', '-password')
        .populate('company')
      const valid = applications.filter(
        app => app.student !== null && app.company !== null
      )
      res.json(valid)
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get college wide stats
router.get('/stats', auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      // Count ALL students regardless of department
      const totalStudents = await User.countDocuments({ role: 'student' })

      const totalCoordinators = await User.countDocuments({
        role: 'coordinator'
      })

      const totalCompanies = await Company.countDocuments()
      const totalApplications = await Application.countDocuments()

      const totalSelected = await Application.countDocuments({
        status: 'selected'
      })
      const totalShortlisted = await Application.countDocuments({
        status: 'shortlisted'
      })

      // Department wise stats - normalize case
      const allStudents = await User.find({
        role: 'student',
        department: { $ne: '', $ne: null }
      }).select('department')

      const deptCounts = {}
      allStudents.forEach(student => {
        const dept = student.department.toUpperCase().trim()
        deptCounts[dept] = (deptCounts[dept] || 0) + 1
      })

      const deptStats = Object.keys(deptCounts).map(dept => ({
        department: dept,
        students: deptCounts[dept]
      }))

      console.log('=== STATS DEBUG ===')
      console.log('Total Students:', totalStudents)
      console.log('Dept Stats:', deptStats)

      res.json({
        totalStudents,
        totalCoordinators,
        totalCompanies,
        totalApplications,
        totalSelected,
        totalShortlisted,
        deptStats
      })
    } catch (error) {
      console.log('Stats error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get company report
router.get('/company-report/:companyId',
  auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const allStudents = await User.find({
        role: 'student'
      }).select('-password')

      const applications = await Application.find({
        company: req.params.companyId
      }).populate({
        path: 'student',
        select: 'name email department rollNumber phone cgpa'
      })

      const validApplications = applications.filter(
        app => app.student !== null
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
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ STAGE 1 — Process Shortlisting Round
router.post('/process-shortlist/:companyId',
  auth, checkRole('head', 'admin'),
  upload.single('csvFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file!' })
      }

      const companyId = req.params.companyId
      const company = await Company.findById(companyId)

      if (!company) {
        return res.status(404).json({ message: 'Company not found!' })
      }

      // Read roll numbers from CSV
      const rollNumbers = []

      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            const rollNumber = data.roll_number ||
              data.rollNumber ||
              data.Roll_Number ||
              Object.values(data)[0]
            if (rollNumber) {
              rollNumbers.push(rollNumber.toString().trim().toUpperCase())
            }
          })
          .on('end', resolve)
          .on('error', reject)
      })

      fs.unlinkSync(req.file.path)

      if (rollNumbers.length === 0) {
        return res.status(400).json({
          message: 'No roll numbers found in CSV!'
        })
      }

      // Get ALL applications for this company (currently 'applied' status)
      const allApplications = await Application.find({
        company: companyId,
        status: 'applied'
      }).populate('student')

      const validApplications = allApplications.filter(
        app => app.student !== null
      )

      let shortlistedCount = 0
      let rejectedCount = 0
      const notFoundRollNumbers = []
      const shortlistedStudents = []
      const rejectedStudents = []

      // Process each applied student
      for (const application of validApplications) {
        const studentRoll = application.student.rollNumber
          .toUpperCase().trim()

        if (rollNumbers.includes(studentRoll)) {
          // ✅ SHORTLISTED
          application.status = 'shortlisted'
          await application.save()

          const notification = new Notification({
            user: application.student._id,
            message: `🎉 Congratulations! You have been SHORTLISTED for ${company.name} (${company.role})! Next round details will be shared soon.`,
            type: 'application'
          })
          await notification.save()

          shortlistedCount++
          shortlistedStudents.push({
            name: application.student.name,
            rollNumber: application.student.rollNumber,
            email: application.student.email
          })
        } else {
          // ❌ REJECTED (applied but not in shortlist)
          application.status = 'rejected'
          await application.save()

          const notification = new Notification({
            user: application.student._id,
            message: `📋 Update on your application to ${company.name} (${company.role}): Unfortunately, you were not shortlisted for the next round. Keep applying to other opportunities!`,
            type: 'application'
          })
          await notification.save()

          rejectedCount++
          rejectedStudents.push({
            name: application.student.name,
            rollNumber: application.student.rollNumber,
            email: application.student.email
          })
        }
      }

      // Check for roll numbers in CSV not found in applications
      const appliedRollNumbers = validApplications.map(
        app => app.student.rollNumber.toUpperCase().trim()
      )
      rollNumbers.forEach(roll => {
        if (!appliedRollNumbers.includes(roll)) {
          notFoundRollNumbers.push(roll)
        }
      })

      res.json({
        message: `Shortlisting processed! ${shortlistedCount} shortlisted, ${rejectedCount} rejected.`,
        shortlistedCount,
        rejectedCount,
        notFoundRollNumbers,
        shortlistedStudents,
        rejectedStudents
      })

    } catch (error) {
      console.log('Error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ STAGE 2 — Process Final Selection Round
router.post('/process-selection/:companyId',
  auth, checkRole('head', 'admin'),
  upload.single('csvFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file!' })
      }

      const companyId = req.params.companyId
      const company = await Company.findById(companyId)

      if (!company) {
        return res.status(404).json({ message: 'Company not found!' })
      }

      // Read roll numbers from CSV
      const rollNumbers = []

      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            const rollNumber = data.roll_number ||
              data.rollNumber ||
              data.Roll_Number ||
              Object.values(data)[0]
            if (rollNumber) {
              rollNumbers.push(rollNumber.toString().trim().toUpperCase())
            }
          })
          .on('end', resolve)
          .on('error', reject)
      })

      fs.unlinkSync(req.file.path)

      if (rollNumbers.length === 0) {
        return res.status(400).json({
          message: 'No roll numbers found in CSV!'
        })
      }

      // Get all SHORTLISTED applications for this company
      const shortlistedApplications = await Application.find({
        company: companyId,
        status: 'shortlisted'
      }).populate('student')

      const validApplications = shortlistedApplications.filter(
        app => app.student !== null
      )

      let selectedCount = 0
      let rejectedCount = 0
      const notFoundRollNumbers = []
      const selectedStudents = []
      const rejectedStudents = []

      for (const application of validApplications) {
        const studentRoll = application.student.rollNumber
          .toUpperCase().trim()

        if (rollNumbers.includes(studentRoll)) {
          // 🎉 SELECTED
          application.status = 'selected'
          await application.save()

          const notification = new Notification({
            user: application.student._id,
            message: `🎉🎊 CONGRATULATIONS! You have been SELECTED for ${company.name} (${company.role})! Package: ${company.package}. HR will contact you soon with further details!`,
            type: 'application'
          })
          await notification.save()

          selectedCount++
          selectedStudents.push({
            name: application.student.name,
            rollNumber: application.student.rollNumber,
            email: application.student.email
          })
        } else {
          // ❌ REJECTED in final round
          application.status = 'rejected'
          await application.save()

          const notification = new Notification({
            user: application.student._id,
            message: `📋 Final Update for ${company.name} (${company.role}): Thank you for participating in the selection process. Unfortunately, you were not selected this time. We encourage you to apply for upcoming opportunities!`,
            type: 'application'
          })
          await notification.save()

          rejectedCount++
          rejectedStudents.push({
            name: application.student.name,
            rollNumber: application.student.rollNumber,
            email: application.student.email
          })
        }
      }

      // Check for roll numbers in CSV not found in shortlisted applications
      const shortlistedRollNumbers = validApplications.map(
        app => app.student.rollNumber.toUpperCase().trim()
      )
      rollNumbers.forEach(roll => {
        if (!shortlistedRollNumbers.includes(roll)) {
          notFoundRollNumbers.push(roll)
        }
      })

      res.json({
        message: `Final selection processed! ${selectedCount} selected, ${rejectedCount} rejected.`,
        selectedCount,
        rejectedCount,
        notFoundRollNumbers,
        selectedStudents,
        rejectedStudents
      })

    } catch (error) {
      console.log('Error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

// ✅ Get applications by status for a company (for head to view before processing)
router.get('/company-applications/:companyId',
  auth, checkRole('head', 'admin'),
  async (req, res) => {
    try {
      const applications = await Application.find({
        company: req.params.companyId
      }).populate('student', 'name email rollNumber department cgpa')

      const valid = applications.filter(app => app.student !== null)

      const grouped = {
        applied: valid.filter(a => a.status === 'applied'),
        shortlisted: valid.filter(a => a.status === 'shortlisted'),
        selected: valid.filter(a => a.status === 'selected'),
        rejected: valid.filter(a => a.status === 'rejected')
      }

      res.json(grouped)
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

module.exports = router

module.exports = router