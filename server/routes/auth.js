const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const University = require('../models/University')

// ✅ Helper — generate unique university code
// Called by: register route when head registers
// Returns: string like "AU1234"
const generateUniversityCode = (universityName) => {
  // Take first letter of each word → "Aditya University" → "AU"
  const initials = universityName
    .split(' ')
    .map(word => word[0].toUpperCase())
    .join('')

  // Add 4 random digits
  const digits = Math.floor(1000 + Math.random() * 9000)

  return `${initials}${digits}`
}

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      department, rollNumber, phone, cgpa,
      universityName,   // ← head provides this (creates new)
      universityCode    // ← coordinator/student provides this (joins existing)
    } = req.body

    // === VALIDATION ===
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required!' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required!' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters!'
      })
    }
    if (!role) {
      return res.status(400).json({ message: 'Role is required!' })
    }

    const allowedRoles = ['student', 'coordinator', 'head', 'admin']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' })
    }

    // Role specific validation
    if (role === 'student') {
      if (!department || !department.trim()) {
        return res.status(400).json({
          message: 'Department is required!'
        })
      }
      if (!rollNumber || !rollNumber.trim()) {
        return res.status(400).json({
          message: 'Roll Number is required!'
        })
      }
      if (!phone || phone.trim().length !== 10) {
        return res.status(400).json({
          message: 'Valid 10-digit phone is required!'
        })
      }
      if (cgpa === undefined || cgpa === '') {
        return res.status(400).json({ message: 'CGPA is required!' })
      }
      if (!universityCode) {
        return res.status(400).json({
          message: 'University code is required!'
        })
      }
    }

    if (role === 'coordinator') {
      if (!department || !department.trim()) {
        return res.status(400).json({
          message: 'Department is required!'
        })
      }
      if (!phone || phone.trim().length !== 10) {
        return res.status(400).json({
          message: 'Valid 10-digit phone is required!'
        })
      }
      if (!universityCode) {
        return res.status(400).json({
          message: 'University code is required!'
        })
      }
    }

    if (role === 'head') {
      if (!universityName || !universityName.trim()) {
        return res.status(400).json({
          message: 'University name is required!'
        })
      }
      if (!phone || phone.trim().length !== 10) {
        return res.status(400).json({
          message: 'Valid 10-digit phone is required!'
        })
      }
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered!'
      })
    }

    // Check duplicate roll number
    if (role === 'student') {
      const existingRoll = await User.findOne({
        rollNumber: rollNumber.trim()
      })
      if (existingRoll) {
        return res.status(400).json({
          message: 'Roll number already registered!'
        })
      }
    }

    // === UNIVERSITY HANDLING ===
    let universityId = null
    let universityCodeForResponse = null

    if (role === 'head') {
      // Head creates a new university
      // Generate unique code with retry logic
      let code
      let isUnique = false
      let attempts = 0

      while (!isUnique && attempts < 10) {
        code = generateUniversityCode(universityName.trim())
        const existing = await University.findOne({ code })
        if (!existing) isUnique = true
        attempts++
      }

      const university = new University({
        name: universityName.trim(),
        code,
        location: req.body.location || '',
        isActive: true
      })

      await university.save()
      universityId = university._id
      universityCodeForResponse = code

    } else if (role === 'coordinator' || role === 'student') {
      // Coordinator/student joins using code
      const code = universityCode.toUpperCase().trim()
      const university = await University.findOne({
        code,
        isActive: true
      })

      if (!university) {
        return res.status(404).json({
          message: 'University code not found! Please check and try again.'
        })
      }

      universityId = university._id
    }

    // === CREATE USER ===
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      university: universityId,
      department: department ? department.toUpperCase().trim() : '',
      rollNumber: rollNumber ? rollNumber.trim() : '',
      phone: phone ? phone.trim() : '',
      cgpa: cgpa || 0
    })

    // Update university createdBy after user is saved
    await user.save()

    if (role === 'head') {
      await University.findByIdAndUpdate(
        universityId,
        { createdBy: user._id }
      )
    }

    // Build response message
    let message = 'Registration successful!'
    if (role === 'head' && universityCodeForResponse) {
      message = `Registration successful! Your University Code is: ${universityCodeForResponse}. Share this code with your coordinators and students so they can join your university on the portal.`
    }

    res.status(201).json({ message })

  } catch (error) {
    console.log('Register error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// ✅ Login (unchanged except response now includes university)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).populate('university', 'name code')

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        university: user.university
      }
    })

  } catch (error) {
    console.log('Login error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router