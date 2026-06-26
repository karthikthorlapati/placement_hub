import '../styles/navbar.css'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  const university = JSON.parse(
    localStorage.getItem('university') || 'null'
  )

  return (
    <div className='navbar'>
      <div className='navbar-brand'>
        🎓 Placement Hub
        {university && (
          <span style={{
            fontSize: '12px',
            background: '#3498db',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '10px',
            marginLeft: '10px'
          }}>
            {university.name}
          </span>
        )}
      </div>
      <div className='navbar-right'>
        <span>Hello, {user?.name}!</span>
        <button className='btn-logout' onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
