import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const HeadApplications = () => {
  const [applications, setApplications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await headApi.getApplications()
      setApplications(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (status) => {
    setActiveFilter(status)
    if (status === 'all') {
      setFiltered(applications)
    } else {
      setFiltered(applications.filter(app => app.status === status))
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

      {/* Filter Buttons */}
      <div className='filter-buttons'>
        {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map(
          status => (
            <button
              key={status}
              className={`filter-btn ${activeFilter === status ? 'active' : ''}`}
              onClick={() => handleFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              ({status === 'all' ? applications.length :
                applications.filter(a => a.status === status).length})
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Applications Found!</h3>
        </div>
      ) : (
        <div className='section'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department</th>
                <th>Roll Number</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app._id}>
                  <td>{app.student?.name || 'N/A'}</td>
                  <td>{app.student?.department || 'N/A'}</td>
                  <td>{app.student?.rollNumber || 'N/A'}</td>
                  <td>{app.company?.name || 'N/A'}</td>
                  <td>{app.company?.role || 'N/A'}</td>
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

export default HeadApplications