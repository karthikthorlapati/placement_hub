import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const AdminApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await adminApi.getApplications()
      // Filter out applications where company is null
      const validApps = Array.isArray(data)
        ? data.filter(app => app.company !== null && app.student !== null)
        : []
      setApplications(validApps)
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
      <h2 className='page-title'>📋 All Applications</h2>

      {/* Stats */}
      <div style={{
        background: '#3498db',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <strong>Total Applications: {applications.length}</strong>
      </div>

      {applications.length === 0 ? (
        <div className='empty-state'>
          <h3>No Applications Found!</h3>
          <p>No valid applications submitted yet.</p>
        </div>
      ) : (
        <div className='section'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id}>
                  <td>{app.student?.name || 'N/A'}</td>
                  <td>{app.student?.email || 'N/A'}</td>
                  <td>{app.student?.department || 'N/A'}</td>
                  <td>{app.company?.name || 'N/A'}</td>
                  <td>{app.company?.role || 'N/A'}</td>
                  <td>{app.company?.package || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{formatDate(app.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}

export default AdminApplications