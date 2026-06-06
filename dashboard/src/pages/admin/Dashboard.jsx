import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { adminApi } from '../../api'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCoordinators: 0,
    totalCompanies: 0,
    totalApplications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats()
      setStats(data)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>⚙️ Admin Dashboard</h2>

      {/* Stats */}
      <div className='stats-container'>
        <StatCard
          number={stats.totalStudents}
          label='Total Students'
          color='blue'
        />
        <StatCard
          number={stats.totalCoordinators}
          label='Total Coordinators'
          color='green'
        />
        <StatCard
          number={stats.totalCompanies}
          label='Total Companies'
          color='orange'
        />
        <StatCard
          number={stats.totalApplications}
          label='Total Applications'
          color='purple'
        />
      </div>

      {/* Quick Actions */}
      <div className='section'>
        <h3>Quick Actions</h3>
        <div className='quick-actions'>
          <Link to='/admin/users' className='action-btn'>
            👥 Manage Users
          </Link>
          <Link to='/admin/companies' className='action-btn'>
            🏢 Manage Companies
          </Link>
          <Link to='/admin/applications' className='action-btn'>
            📋 View Applications
          </Link>
        </div>
      </div>

    </Layout>
  )
}

export default AdminDashboard