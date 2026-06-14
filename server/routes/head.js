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

// ✅ Upload CSV and notify shortlisted students
router.post('/notify-shortlisted/:companyId',
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
      const results = []

      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            const rollNumber = data.roll_number ||
              data.rollNumber ||
              data.Roll_Number ||
              Object.values(data)[0]
            if (rollNumber) {
              rollNumbers.push(rollNumber.toString().trim())
            }
          })
          .on('end', resolve)
          .on('error', reject)
      })

      // Delete uploaded file after reading
      fs.unlinkSync(req.file.path)

      if (rollNumbers.length === 0) {
        return res.status(400).json({
          message: 'No roll numbers found in CSV!',
          hint: 'Make sure CSV has a column named roll_number'
        })
      }

      // Find students by roll numbers
      const foundStudents = await User.find({
        rollNumber: { $in: rollNumbers },
        role: 'student'
      })

      const foundRollNumbers = foundStudents.map(s => s.rollNumber)
      const notFoundRollNumbers = rollNumbers.filter(
        r => !foundRollNumbers.includes(r)
      )

      // Update application status and send notifications
      let notifiedCount = 0
      for (const student of foundStudents) {
        // Update application status
        await Application.findOneAndUpdate(
          { student: student._id, company: companyId },
          { status: 'shortlisted' },
          { new: true }
        )

        // Send notification
        const notification = new Notification({
          user: student._id,
          message: `🎉 Congratulations! You have been shortlisted for ${company.name}!`,
          type: 'application'
        })
        await notification.save()
        notifiedCount++

        results.push({
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          status: 'notified'
        })
      }

      res.json({
        message: `Successfully notified ${notifiedCount} students!`,
        totalRollNumbers: rollNumbers.length,
        notifiedCount,
        notFoundRollNumbers,
        results
      })

    } catch (error) {
      console.log('Error:', error)
      res.status(500).json({ message: 'Server error', error: error.message })
    }
  }
)

module.exports = router