import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/global.css'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import Companies from './pages/student/Companies'
import Applications from './pages/student/Applications'
import Notifications from './pages/student/Notifications'
import Profile from './pages/student/Profile'

// Placeholder for coordinator and admin
const ComingSoon = ({ page }) => (
  <div style={{ padding: '30px' }}>
    <h2 style={{ color: '#2c3e50' }}>{page}</h2>
    <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
      Coming in next days!
    </p>
  </div>
)

// Login redirect
const LoginRedirect = () => {
  window.location.href = '/login.html'
  return null
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Login redirect */}
          <Route path='/login' element={<LoginRedirect />} />

          {/* Default redirect */}
          <Route path='/' element={
            <Navigate to='/student/dashboard' replace />
          } />

          {/* Student Routes */}
          <Route path='/student/dashboard' element={
            <ProtectedRoute role='student'>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path='/student/companies' element={
            <ProtectedRoute role='student'>
              <Companies />
            </ProtectedRoute>
          } />
          <Route path='/student/applications' element={
            <ProtectedRoute role='student'>
              <Applications />
            </ProtectedRoute>
          } />
          <Route path='/student/notifications' element={
            <ProtectedRoute role='student'>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path='/student/profile' element={
            <ProtectedRoute role='student'>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Coordinator Routes */}
          <Route path='/coordinator/dashboard' element={
            <ProtectedRoute role='coordinator'>
              <ComingSoon page='🏠 Coordinator Dashboard' />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/students' element={
            <ProtectedRoute role='coordinator'>
              <ComingSoon page='👨‍🎓 Students' />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/companies' element={
            <ProtectedRoute role='coordinator'>
              <ComingSoon page='🏢 Companies' />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/report' element={
            <ProtectedRoute role='coordinator'>
              <ComingSoon page='📊 Reports' />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={
            <ProtectedRoute role='admin'>
              <ComingSoon page='🏠 Admin Dashboard' />
            </ProtectedRoute>
          } />
          <Route path='/admin/users' element={
            <ProtectedRoute role='admin'>
              <ComingSoon page='👥 All Users' />
            </ProtectedRoute>
          } />
          <Route path='/admin/companies' element={
            <ProtectedRoute role='admin'>
              <ComingSoon page='🏢 All Companies' />
            </ProtectedRoute>
          } />
          <Route path='/admin/applications' element={
            <ProtectedRoute role='admin'>
              <ComingSoon page='📋 All Applications' />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App