import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { studentApi } from '../../api'
import { formatDate } from '../../utils/helpers'
import { Link } from 'react-router-dom'

const priorityColors = {
  high: { bg: '#f8d7da', color: '#dc3545', label: '🔴 High Priority' },
  medium: { bg: '#fff3cd', color: '#ffc107', label: '🟡 Medium Priority' },
  low: { bg: '#d4edda', color: '#28a745', label: '🟢 Low Priority' }
}

const StudentDashboard = () => {
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [companiesData, applicationsData, announcementsData] =
        await Promise.all([
          studentApi.getCompanies(),
          studentApi.getMyApplications(),
          studentApi.getAnnouncements()
        ])
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setApplications(Array.isArray(applicationsData) ? applicationsData : [])
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const shortlisted = applications.filter(
    app => app.status === 'shortlisted'
  ).length

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>🏠 Student Dashboard</h2>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className='section' style={{ marginBottom: '25px' }}>
          <h3>📢 Announcements</h3>
          {announcements.slice(0, 3).map(ann => (
            <div
              key={ann._id}
              style={{
                background: priorityColors[ann.priority]?.bg || '#f8f9fa',
                border: `1px solid ${priorityColors[ann.priority]?.color}`,
                borderLeft: `4px solid ${priorityColors[ann.priority]?.color}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ color: '#2c3e50', margin: 0 }}>
                  {ann.title}
                </h4>
                <span style={{
                  fontSize: '11px',
                  color: priorityColors[ann.priority]?.color,
                  fontWeight: 'bold'
                }}>
                  {priorityColors[ann.priority]?.label}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '5px' }}>
                {ann.message}
              </p>
              <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                Posted by {ann.postedBy?.name} • {formatDate(ann.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className='stats-container'>
        <StatCard
          number={companies.length}
          label='Available Companies'
          color='blue'
        />
        <StatCard
          number={applications.length}
          label='Applied Companies'
          color='green'
        />
        <StatCard
          number={shortlisted}
          label='Shortlisted'
          color='orange'
        />
      </div>

      {/* Recent Companies */}
      <div className='section'>
        <h3>🏢 Recent Companies</h3>
        {companies.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>
            No companies available right now
          </p>
        ) : (
          companies.slice(0, 3).map(company => (
            <div key={company._id} className='company-card'>
              <div className='company-card-header'>
                <h3>{company.name}</h3>
                <span className={`badge badge-${company.status}`}>
                  {company.status}
                </span>
              </div>
              <div className='company-card-details'>
                <p>💼 Role: {company.role}</p>
                <p>💰 Package: {company.package}</p>
                <p>🎓 Min CGPA: {company.minimumCgpa || 0}</p>
                <p>📅 Last Date: {formatDate(company.lastDate)}</p>
              </div>
            </div>
          ))
        )}
        <div style={{ marginTop: '15px' }}>
          <Link to='/student/companies' className='action-btn'>
            View All Companies →
          </Link>
        </div>
      </div>

    </Layout>
  )
}

export default StudentDashboard