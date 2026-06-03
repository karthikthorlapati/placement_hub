import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth()

  if (!user || !token) {
    window.location.href = '/login.html'
    return null
  }

  if (role && user.role !== role) {
    window.location.href = '/login.html'
    return null
  }

  return children
}

export default ProtectedRoute