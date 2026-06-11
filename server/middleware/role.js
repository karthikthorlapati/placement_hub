const checkRole = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role)
    console.log('Required roles:', roles)

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied! This action requires: ${roles.join(' or ')} role!`
      })
    }
    next()
  }
}

module.exports = checkRole