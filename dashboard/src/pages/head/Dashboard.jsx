import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { headApi } from '../../api'
import { Link } from 'react-router-dom'

const HeadDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await headApi.getStats()
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
      <h2 className='page-title'>🏛️ Placement Head Dashboard</h2>

      {/* Main Stats */}
      <div className='stats-container'>
        <StatCard
          number={stats?.totalStudents || 0}
          label='Total Students'
          color='blue'
        />
        <StatCard
          number={stats?.totalCoordinators || 0}
          label='Coordinators'
          color='green'
        />
        <StatCard
          number={stats?.totalCompanies || 0}
          label='Companies'
          color='orange'
        />
        <StatCard
          number={stats?.totalApplications || 0}
          label='Applications'
          color='purple'
        />
      </div>

      {/* Placement Stats */}
      <div className='stats-container'>
        <StatCard
          number={stats?.totalShortlisted || 0}
          label='Shortlisted'
          color='green'
        />
        <StatCard
          number={stats?.totalSelected || 0}
          label='Selected'
          color='blue'
        />
      </div>

      {/* Department Wise Stats */}
      {stats?.deptStats && stats.deptStats.length > 0 && (
        <div className='section'>
          <h3>🏫 Department Wise Students</h3>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {stats.deptStats.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department}</td>
                  <td>{dept.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions */}
      <div className='section'>
        <h3>Quick Actions</h3>
        <div className='quick-actions'>
          <Link to='/head/students' className='action-btn'>
            👨‍🎓 View All Students
          </Link>
          <Link to='/head/companies' className='action-btn'>
            🏢 View All Companies
          </Link>
          <Link to='/head/report' className='action-btn'>
            📊 Company Reports
          </Link>
          <Link to='/head/notify' className='action-btn'>
            📤 Notify Shortlisted
          </Link>
        </div>
      </div>

    </Layout>
  )
}

export default HeadDashboard