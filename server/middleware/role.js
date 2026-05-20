const checkRole = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role)
    console.log('Required roles:', roles)

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied! You do not have permission!'
      })
    }
    next()
  }
}

module.exports = checkRole