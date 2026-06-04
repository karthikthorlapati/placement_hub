import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [message, setMessage] = useState('')
  const [appliedIds, setAppliedIds] = useState([])

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await studentApi.getCompanies()
      const companiesData = Array.isArray(data) ? data : []
      setCompanies(companiesData)
      setFiltered(companiesData)

      // Get applied companies
      const applications = await studentApi.getMyApplications()
      const ids = applications.map(app => app.company?._id)
      setAppliedIds(ids)

    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase()
    const result = companies.filter(c =>
      c.name.toLowerCase().includes(value) ||
      c.role.toLowerCase().includes(value)
    )
    setFiltered(result)
  }

  const handleApply = async (companyId) => {
    setApplying(companyId)
    setMessage('')
    try {
      const data = await studentApi.applyCompany(companyId)
      if (data.message === 'Applied successfully!') {
        setMessage('Applied successfully! ✅')
        setAppliedIds([...appliedIds, companyId])
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Something went wrong!')
    } finally {
      setApplying(null)
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>🏢 Available Companies</h2>

      {message && (
        <div className='success-msg'>{message}</div>
      )}

      {/* Search */}
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search companies...'
          onChange={handleSearch}
        />
      </div>

      {/* Companies List */}
      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Companies Found!</h3>
          <p>No companies available right now.</p>
        </div>
      ) : (
        filtered.map(company => (
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
              {appliedIds.includes(company._id) ? (
                <button
                  className='btn-success'
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                >
                  Already Applied ✅
                </button>
              ) : !company.isEligible ? (
                <button
                  className='btn-danger'
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                >
                  ❌ Not Eligible (Min CGPA: {company.minimumCgpa})
                </button>
              ) : (
                <button
                  className='btn-primary'
                  onClick={() => handleApply(company._id)}
                  disabled={applying === company._id}
                >
                  {applying === company._id ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}

export default Companies