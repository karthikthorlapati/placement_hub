const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ✅ Register with mandatory field validation
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      department, rollNumber, phone, cgpa
    } = req.body

    // ✅ Common mandatory fields for everyone
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required!' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required!' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password is required and must be at least 6 characters!'
      })
    }
    if (!role) {
      return res.status(400).json({ message: 'Role is required!' })
    }

    const allowedRoles = ['student', 'coordinator', 'head', 'admin']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' })
    }

    // ✅ Role specific mandatory fields
    if (role === 'student') {
      if (!department || !department.trim()) {
        return res.status(400).json({
          message: 'Department is required for students!'
        })
      }
      if (!rollNumber || !rollNumber.trim()) {
        return res.status(400).json({
          message: 'Roll Number is required for students!'
        })
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          message: 'Phone number is required for students!'
        })
      }
      if (phone.trim().length !== 10) {
        return res.status(400).json({
          message: 'Phone number must be exactly 10 digits!'
        })
      }
      if (cgpa === undefined || cgpa === null || cgpa === '') {
        return res.status(400).json({
          message: 'CGPA is required for students!'
        })
      }
      if (cgpa < 0 || cgpa > 10) {
        return res.status(400).json({
          message: 'CGPA must be between 0 and 10!'
        })
      }
    }

    if (role === 'coordinator') {
      if (!department || !department.trim()) {
        return res.status(400).json({
          message: 'Department is required for coordinators!'
        })
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          message: 'Phone number is required for coordinators!'
        })
      }
    }

    if (role === 'head') {
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          message: 'Phone number is required!'
        })
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email!'
      })
    }

    // Check duplicate roll number for students
    if (role === 'student') {
      const existingRoll = await User.findOne({
        rollNumber: rollNumber.trim()
      })
      if (existingRoll) {
        return res.status(400).json({
          message: 'This Roll Number is already registered!'
        })
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department: department ? department.toUpperCase().trim() : '',
      rollNumber: rollNumber ? rollNumber.trim() : '',
      phone: phone ? phone.trim() : '',
      cgpa: cgpa || 0
    })

    await user.save()
    res.status(201).json({
      message: 'User registered successfully'
    })

  } catch (error) {
    console.log('Register error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid email or password'
      })
    }

    // Create JWT token
    // Create JWT token
const token = jwt.sign(
  { userId: user._id, role: user.role },  // ✅ role must be here!
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
        department: user.department
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