import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { coordinatorApi } from '../../api'
import { Link } from 'react-router-dom'

const CoordinatorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalApplications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await coordinatorApi.getStats()
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
      <h2 className='page-title'>🏠 Coordinator Dashboard</h2>

      {/* Stats */}
      <div className='stats-container'>
        <StatCard
          number={stats.totalStudents}
          label='Total Students'
          color='blue'
        />
        <StatCard
          number={stats.totalCompanies}
          label='Total Companies'
          color='green'
        />
        <StatCard
          number={stats.totalApplications}
          label='Total Applications'
          color='orange'
        />
      </div>

      {/* Quick Actions */}
      <div className='section'>
        <h3>Quick Actions</h3>
        <div className='quick-actions'>
          <Link
            to='/coordinator/companies'
            className='action-btn'
          >
            ➕ Add New Company
          </Link>
          <Link
            to='/coordinator/students'
            className='action-btn'
          >
            👥 View All Students
          </Link>
          <Link
            to='/coordinator/report'
            className='action-btn'
          >
            📊 View Reports
          </Link>
        </div>
      </div>

    </Layout>
  )
}

export default CoordinatorDashboard