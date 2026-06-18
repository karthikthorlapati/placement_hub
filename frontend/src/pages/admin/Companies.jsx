import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await adminApi.getCompanies()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return
    try {
      const res = await adminApi.deleteCompany(companyId)
      if (res.message === 'Company deleted successfully!') {
        setMessage('Company deleted successfully! ✅')
        loadCompanies()
        setTimeout(() => setMessage(''), 3000)
      }
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
      <h2 className='page-title'>🏢 All Companies</h2>

      {message && <div className='success-msg'>{message}</div>}

      {companies.length === 0 ? (
        <div className='empty-state'>
          <h3>No Companies Found!</h3>
          <p>No companies added yet.</p>
        </div>
      ) : (
        companies.map(company => (
          <div key={company._id} className='company-card'>
            <div className='company-card-header'>
              <h3>{company.name}</h3>
              <span className={`badge badge-${company.status}`}>
                {company.status}
              </span>
            </div>
            <div className='company-card-details'>
              <p>💼 <strong>Role:</strong> {company.role}</p>
              <p>💰 <strong>Package:</strong> {company.package}</p>
              <p>🎓 <strong>Min CGPA:</strong> {company.minimumCgpa || 0}</p>
              <p>📅 <strong>Last Date:</strong> {formatDate(company.lastDate)}</p>
              <p>📝 <strong>Description:</strong> {company.description}</p>
            </div>
            <div className='company-card-actions'>
              <button
                className='btn-danger'
                onClick={() => handleDelete(company._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}

    </Layout>
  )
}

export default AdminCompanies