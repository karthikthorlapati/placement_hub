import '../styles/navbar.css'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className='navbar'>
      <h1 className='navbar-logo'>🎓 Placement Hub</h1>
      <div className='navbar-right'>
        <span className='navbar-welcome'>
          Hello, {user?.name}!
        </span>
        <button className='navbar-logout' onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar