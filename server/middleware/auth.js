const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        message: 'No token, authorization denied'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ Fetch full user to get universityId
    // Why: JWT only stores userId+role, not universityId
    // We need universityId for every route's DB query
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // ✅ Attach everything route handlers need
    req.user = {
      userId: user._id,
      role: user.role,
      universityId: user.university,
      department: user.department
    }

    next()
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

module.exports = auth