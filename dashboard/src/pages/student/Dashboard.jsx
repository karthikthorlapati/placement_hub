import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { studentApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [companiesData, applicationsData] = await Promise.all([
        studentApi.getCompanies(),
        studentApi.getMyApplications()
      ])
      setCompanies(Array.isArray(companiesData) ? companiesData : [])
      setApplications(Array.isArray(applicationsData) ? applicationsData : [])
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
      </div>

    </Layout>
  )
}

export default StudentDashboard