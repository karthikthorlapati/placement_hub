import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth()

  if (!user || !token) {
    window.location.href =
      'http://127.0.0.1:5500/placement_hub/client/login.html'
    return null
  }

  if (role && user.role !== role) {
    window.location.href =
      'http://127.0.0.1:5500/placement_hub/client/login.html'
    return null
  }

  return children
}

export default ProtectedRoute