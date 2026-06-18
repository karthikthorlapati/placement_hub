import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'
import { formatDate } from '../../utils/helpers'
import { Link } from 'react-router-dom'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await studentApi.getMyApplications()
      setApplications(Array.isArray(data) ? data : [])
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
      <h2 className='page-title'>📋 My Applications</h2>

      {applications.length === 0 ? (
        <div className='empty-state'>
          <h3>No Applications Yet!</h3>
          <p>You have not applied to any company yet.</p>
          <Link to='/student/companies' className='action-btn'>
            Browse Companies
          </Link>
        </div>
      ) : (
        applications.map(app => (
          <div key={app._id} className='company-card'>
            <div className='company-card-header'>
              <h3>{app.company?.name || 'Company Unavailable'}</h3>
              <span className={`badge badge-${app.status}`}>
                {app.status}
              </span>
            </div>
            <div className='company-card-details'>
              <p>💼 <strong>Role:</strong> {app.company?.role || 'N/A'}</p>
              <p>💰 <strong>Package:</strong> {app.company?.package || 'N/A'}</p>
              <p>📅 <strong>Applied On:</strong> {formatDate(app.appliedAt)}</p>
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}

export default Applications