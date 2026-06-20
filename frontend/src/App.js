import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/global.css'

import CoordinatorAnnouncements from './pages/coordinator/Announcements'
import HeadAnnouncements from './pages/head/Announcements'

import HeadStatistics from './pages/head/Statistics'
import CoordinatorStatistics from './pages/coordinator/Statistics'

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

// Head Pages
import HeadDashboard from './pages/head/Dashboard'
import HeadStudents from './pages/head/Students'
import HeadCompanies from './pages/head/Companies'
import HeadApplications from './pages/head/Applications'
import HeadReport from './pages/head/Report'
import Notify from './pages/head/Notify'

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

          {/* Head Routes */}
          <Route path='/head/dashboard' element={
            <ProtectedRoute role='head'>
              <HeadDashboard />
            </ProtectedRoute>
          } />
          <Route path='/head/students' element={
            <ProtectedRoute role='head'>
              <HeadStudents />
            </ProtectedRoute>
          } />
          <Route path='/head/companies' element={
            <ProtectedRoute role='head'>
              <HeadCompanies />
            </ProtectedRoute>
          } />
          <Route path='/head/applications' element={
            <ProtectedRoute role='head'>
              <HeadApplications />
            </ProtectedRoute>
          } />
          <Route path='/head/report' element={
            <ProtectedRoute role='head'>
              <HeadReport />
            </ProtectedRoute>
          } />
          <Route path='/head/notify' element={
            <ProtectedRoute role='head'>
              <Notify />
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

          {/* Coordinator Announcements */}
          <Route path='/coordinator/announcements' element={
            <ProtectedRoute role='coordinator'>
              <CoordinatorAnnouncements />
            </ProtectedRoute>
          } />

          {/* Head Announcements */}
          <Route path='/head/announcements' element={
            <ProtectedRoute role='head'>
              <HeadAnnouncements />
            </ProtectedRoute>
          } />

          <Route path='/head/statistics' element={
            <ProtectedRoute role='head'>
              <HeadStatistics />
            </ProtectedRoute>
          } />

          <Route path='/coordinator/statistics' element={
            <ProtectedRoute role='coordinator'>
              <CoordinatorStatistics />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App