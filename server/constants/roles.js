const ROLES = {
  STUDENT: 'student',
  COORDINATOR: 'coordinator',
  HEAD: 'head',
  ADMIN: 'admin'
}

const ALLOWED_ROLES = [
  ROLES.STUDENT,
  ROLES.COORDINATOR,
  ROLES.HEAD,
  ROLES.ADMIN
]

module.exports = { ROLES, ALLOWED_ROLES }