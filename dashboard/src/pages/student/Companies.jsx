import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'
import { formatDate } from '../../utils/helpers'

// Helper to get deadline status
const getDeadlineStatus = (lastDate) => {
  const today = new Date()
  const deadline = new Date(lastDate)
  const diffTime = deadline - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Deadline Passed', color: '#e74c3c', urgent: true }
  if (diffDays === 0) return { label: 'Last Day Today!', color: '#e74c3c', urgent: true }
  if (diffDays === 1) return { label: 'Deadline Tomorrow!', color: '#e67e22', urgent: true }
  if (diffDays <= 3) return { label: `${diffDays} days left`, color: '#e67e22', urgent: true }
  if (diffDays <= 7) return { label: `${diffDays} days left`, color: '#f39c12', urgent: false }
  return { label: `${diffDays} days left`, color: '#2ecc71', urgent: false }
}

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [message, setMessage] = useState('')
  const [appliedIds, setAppliedIds] = useState([])
  const [filterCgpa, setFilterCgpa] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await studentApi.getCompanies()
      const companiesData = Array.isArray(data) ? data : []
      setCompanies(companiesData)
      setFiltered(companiesData)

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
    applyFilters(value, filterCgpa)
  }

  const handleCgpaFilter = (e) => {
    const value = e.target.value
    setFilterCgpa(value)
    applyFilters('', value)
  }

  const applyFilters = (search, cgpa) => {
    let result = companies
    if (search) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.role.toLowerCase().includes(search)
      )
    }
    if (cgpa) {
      result = result.filter(c => c.minimumCgpa <= parseFloat(cgpa))
    }
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

      {message && <div className='success-msg'>{message}</div>}

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className='search-bar' style={{ flex: 2 }}>
          <input
            type='text'
            placeholder='Search by company name or role...'
            onChange={handleSearch}
          />
        </div>
        <div style={{ flex: 1 }}>
          <input
            type='number'
            placeholder='Filter by your CGPA'
            onChange={handleCgpaFilter}
            min='0'
            max='10'
            step='0.1'
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Companies Found!</h3>
          <p>No companies available right now.</p>
        </div>
      ) : (
        filtered.map(company => {
          const deadline = getDeadlineStatus(company.lastDate)
          return (
            <div key={company._id} className='company-card'>

              {/* Deadline Alert Banner */}
              {deadline.urgent && (
                <div style={{
                  background: deadline.color,
                  color: 'white',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⚠️ {deadline.label}
                </div>
              )}

              <div className='company-card-header'>
                <h3>{company.name}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    background: deadline.color,
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    📅 {deadline.label}
                  </span>
                  <span className={`badge badge-${company.status}`}>
                    {company.status}
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

              <div className='company-card-actions' style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                {/* Apply Button Logic */}
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

                {/* Fixed Registration Link Button */}
                {company.registrationLink && (
                  <a
                    href={company.registrationLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                      color: '#9b59b6',
                      fontSize: '13px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '5px'
                    }}
                  >
                    🔗 External Registration Link
                  </a>
                )}
              </div>

            </div>
          )
        })
      )}
    </Layout>
  )
}

export default Companies