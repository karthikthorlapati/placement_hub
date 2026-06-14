const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      department, rollNumber, phone, cgpa
    } = req.body

    // Check if user exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      })
    }

    // Validate role
    const allowedRoles = ['student', 'coordinator', 'head', 'admin']
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role!' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department: department ? department.toUpperCase().trim() : '',
      rollNumber,
      phone,
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