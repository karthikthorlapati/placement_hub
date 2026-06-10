import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/sidebar.css'

const studentLinks = [
  { path: '/student/dashboard', label: '🏠 Dashboard' },
  { path: '/student/companies', label: '🏢 Companies' },
  { path: '/student/applications', label: '📋 My Applications' },
  { path: '/student/notifications', label: '🔔 Notifications' },
  { path: '/student/profile', label: '👤 Profile' }
]

const coordinatorLinks = [
  { path: '/coordinator/dashboard', label: '🏠 Dashboard' },
  { path: '/coordinator/students', label: '👨‍🎓 Students' },
  { path: '/coordinator/companies', label: '🏢 Companies' },
  { path: '/coordinator/report', label: '📊 Reports' }
]

const headLinks = [
  { path: '/head/dashboard', label: '🏠 Dashboard' },
  { path: '/head/students', label: '👨‍🎓 All Students' },
  { path: '/head/companies', label: '🏢 All Companies' },
  { path: '/head/applications', label: '📋 All Applications' },
  { path: '/head/report', label: '📊 Reports' },
  { path: '/head/notify', label: '📤 Notify Shortlisted' }
]

const adminLinks = [
  { path: '/admin/dashboard', label: '🏠 Dashboard' },
  { path: '/admin/users', label: '👥 All Users' },
  { path: '/admin/companies', label: '🏢 All Companies' },
  { path: '/admin/applications', label: '📋 All Applications' }
]

const Sidebar = () => {
  const { user } = useAuth()

  const links =
    user?.role === 'student' ? studentLinks :
    user?.role === 'coordinator' ? coordinatorLinks :
    user?.role === 'head' ? headLinks :
    adminLinks

  return (
    <div className='sidebar'>
      <ul>
        {links.map(link => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar