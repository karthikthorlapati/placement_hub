const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization').replace('Bearer ', '')

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add user to request
    req.user = decoded

    next()
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' })
  }
}

module.exports = auth