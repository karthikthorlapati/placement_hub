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

// Coordinator Pages
import CoordinatorDashboard from './pages/coordinator/Dashboard'
import Students from './pages/coordinator/Students'
import CoordinatorCompanies from './pages/coordinator/Companies'
import Report from './pages/coordinator/Report'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import AdminCompanies from './pages/admin/Companies'
import AdminApplications from './pages/admin/Applications'

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
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/students' element={
            <ProtectedRoute role='coordinator'>
              <Students />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/companies' element={
            <ProtectedRoute role='coordinator'>
              <CoordinatorCompanies />
            </ProtectedRoute>
          } />
          <Route path='/coordinator/report' element={
            <ProtectedRoute role='coordinator'>
              <Report />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path='/admin/dashboard' element={
            <ProtectedRoute role='admin'>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path='/admin/users' element={
            <ProtectedRoute role='admin'>
              <Users />
            </ProtectedRoute>
          } />
          <Route path='/admin/companies' element={
            <ProtectedRoute role='admin'>
              <AdminCompanies />
            </ProtectedRoute>
          } />
          <Route path='/admin/applications' element={
            <ProtectedRoute role='admin'>
              <AdminApplications />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App