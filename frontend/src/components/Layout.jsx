import Navbar from './Navbar'
import Sidebar from './Sidebar'
import '../styles/dashboard.css'

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className='dashboard-container'>
        <Sidebar />
        <div className='main-content'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout