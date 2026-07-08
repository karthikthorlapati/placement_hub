import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const AdminApplications = () => {
  const [applications, setApplications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await adminApi.getApplications()
      const valid = Array.isArray(data)
        ? data.filter(
            app => app.company !== null && app.student !== null
          )
        : []
      setApplications(valid)
      setFiltered(valid)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Status filter handler
  const handleFilter = (status) => {
    setActiveFilter(status)
    if (status === 'all') {
      setFiltered(applications)
    } else {
      setFiltered(applications.filter(app => app.status === status))
    }
  }

  const statusCount = (status) =>
    status === 'all'
      ? applications.length
      : applications.filter(a => a.status === status).length

  const statusBadgeStyle = (status) => {
    const map = {
      applied: { bg: '#eaf4ff', color: '#2980b9' },
      shortlisted: { bg: '#fef9e7', color: '#f39c12' },
      selected: { bg: '#eafaf1', color: '#27ae60' },
      rejected: { bg: '#fdedec', color: '#e74c3c' }
    }
    return map[status] || { bg: '#f0f0f0', color: '#555' }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>📋 All Applications</h2>

      {/* ✅ Status Filter Buttons */}
      <div
        className='filter-buttons'
        style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}
      >
        {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map(
          status => (
            <button
              key={status}
              onClick={() => handleFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeFilter === status
                  ? '2px solid #3498db'
                  : '1px solid #ddd',
                background: activeFilter === status ? '#3498db' : 'white',
                color: activeFilter === status ? 'white' : '#555',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeFilter === status ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {' '}({statusCount(status)})
            </button>
          )
        )}
      </div>

      {/* Stats */}
      <div style={{
        background: '#3498db',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <strong>Showing: {filtered.length} Applications</strong>
      </div>

      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Applications Found!</h3>
          <p>No applications match the selected filter.</p>
        </div>
      ) : (
        <div className='section'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>University</th>
                <th>Department</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const badge = statusBadgeStyle(app.status)
                return (
                  <tr key={app._id}>
                    <td>{app.student?.name || 'N/A'}</td>
                    <td>
                      {app.university ? (
                        <span>
                          <span style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#2c3e50'
                          }}>
                            {app.university.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#3498db',
                            background: '#eaf4ff',
                            padding: '1px 5px',
                            borderRadius: '6px'
                          }}>
                            {app.university.code}
                          </span>
                        </span>
                      ) : (
                        <span style={{
                          color: '#bdc3c7',
                          fontSize: '12px'
                        }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td>{app.student?.department || 'N/A'}</td>
                    <td>{app.company?.name || 'N/A'}</td>
                    <td>{app.company?.role || 'N/A'}</td>
                    <td>{app.company?.package || 'N/A'}</td>
                    <td>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {formatDate(app.appliedAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default AdminApplications