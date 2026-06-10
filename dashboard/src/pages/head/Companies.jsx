import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const HeadCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await headApi.getCompanies()
      setCompanies(Array.isArray(data) ? data : [])
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
      <h2 className='page-title'>🏢 All Companies</h2>

      {/* Stats */}
      <div style={{
        background: '#2ecc71',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <strong>Total Companies: {companies.length}</strong>
      </div>

      {companies.length === 0 ? (
        <div className='empty-state'>
          <h3>No Companies Found!</h3>
        </div>
      ) : (
        companies.map(company => (
          <div key={company._id} className='company-card'>
            <div className='company-card-header'>
              <h3>{company.name}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className={`badge badge-${company.status}`}>
                  {company.status}
                </span>
                <span style={{
                  background: '#f0f0f0',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#555'
                }}>
                  {company.department === 'all' ?
                    'All Departments' : company.department}
                </span>
              </div>
            </div>
            <div className='company-card-details'>
              <p>💼 <strong>Role:</strong> {company.role}</p>
              <p>💰 <strong>Package:</strong> {company.package}</p>
              <p>🎓 <strong>Min CGPA:</strong> {company.minimumCgpa || 0}</p>
              <p>📅 <strong>Last Date:</strong> {formatDate(company.lastDate)}</p>
              <p>📝 <strong>Description:</strong> {company.description}</p>
            </div>
          </div>
        ))
      )}

    </Layout>
  )
}

export default HeadCompanies