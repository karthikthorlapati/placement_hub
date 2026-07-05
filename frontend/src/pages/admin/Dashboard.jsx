import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { adminApi } from '../../api'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, univData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUniversities()
      ])
      setStats(statsData)
      setUniversities(Array.isArray(univData) ? univData : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUniversity = async (id, currentStatus) => {
    try {
      await adminApi.toggleUniversity(id, !currentStatus)
      loadData()
    } catch (error) {
      console.log('Error:', error)
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>Admin Dashboard</h2>

      {/* Platform Stats */}
      <div className='stats-container'>
        <StatCard
          number={stats?.totalUniversities || 0}
          label='Universities'
          color='purple'
        />
        <StatCard
          number={stats?.totalStudents || 0}
          label='Total Students'
          color='blue'
        />
        <StatCard
          number={stats?.totalCompanies || 0}
          label='Companies'
          color='green'
        />
        <StatCard
          number={stats?.totalSelected || 0}
          label='Placed Students'
          color='orange'
        />
      </div>

      <div className='stats-container'>
        <StatCard
          number={stats?.totalCoordinators || 0}
          label='Coordinators'
          color='blue'
        />
        <StatCard
          number={stats?.totalHeads || 0}
          label='Placement Heads'
          color='green'
        />
        <StatCard
          number={stats?.totalApplications || 0}
          label='Applications'
          color='orange'
        />
      </div>

      {/* Universities List */}
      <div className='section'>
        <h3>All Universities ({universities.length})</h3>
        {universities.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No universities registered yet!</p>
        ) : (
          <table className='data-table'>
            <thead>
              <tr>
                <th>University Name</th>
                <th>Code</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(uni => (
                <tr key={uni._id}>
                  <td>{uni.name}</td>
                  <td>
                    <span style={{
                      background: '#eaf4ff',
                      color: '#3498db',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {uni.code}
                    </span>
                  </td>
                  <td>{uni.createdBy?.name || 'N/A'}</td>
                  <td>
                    <span className={
                      uni.isActive
                        ? 'badge badge-active'
                        : 'badge badge-closed'
                    }>
                      {uni.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={
                        uni.isActive ? 'btn-danger' : 'btn-success'
                      }
                      onClick={() => handleToggleUniversity(
                        uni._id,
                        uni.isActive
                      )}
                    >
                      {uni.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </Layout>
  )
}

export default AdminDashboard