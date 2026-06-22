const express = require('express')
const router = express.Router()
const University = require('../models/University')
const auth = require('../middleware/auth')

// ✅ Get all active universities (for dropdown in register page)
// Called by: register.html when page loads
router.get('/', async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name code location')
      .sort({ name: 1 })
    res.json(universities)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Verify university code (called when coordinator/student types code)
// Called by: register.js when user types a university code
router.get('/verify/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim()
    const university = await University.findOne({ code, isActive: true })

    if (!university) {
      return res.status(404).json({ message: 'University code not found!' })
    }

    res.json({
      _id: university._id,
      name: university.name,
      code: university.code,
      location: university.location
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// ✅ Get all universities (admin only)
// Called by: admin panel
router.get('/all', auth, async (req, res) => {
  try {
    const universities = await University.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(universities)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router