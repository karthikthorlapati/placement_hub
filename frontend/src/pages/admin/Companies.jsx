import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteMsg, setDeleteMsg] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await adminApi.getCompanies()
      const list = Array.isArray(data) ? data : []
      setCompanies(list)
      setFiltered(list)
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
      c.role.toLowerCase().includes(value) ||
      (c.university?.name &&
        c.university.name.toLowerCase().includes(value))
    )
    setFiltered(result)
  }

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Delete ${companyName}?`)) return
    try {
      await adminApi.deleteCompany(companyId)
      setDeleteMsg(`${companyName} deleted! ✅`)
      loadCompanies()
      setTimeout(() => setDeleteMsg(''), 3000)
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

      {deleteMsg && <div className='success-msg'>{deleteMsg}</div>}

      {/* Search */}
      <div className='search-bar' style={{ marginBottom: '20px' }}>
        <input
          type='text'
          placeholder='Search by company name, role, university...'
          onChange={handleSearch}
        />
      </div>

      {/* Stats */}
      <div style={{
        background: '#2ecc71',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <strong>Total: {filtered.length} Companies</strong>
      </div>

      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Companies Found!</h3>
        </div>
      ) : (
        filtered.map(company => (
          <div key={company._id} className='company-card'>
            <div className='company-card-header'>
              <h3>{company.name}</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                {/* ✅ University Name Badge */}
                {company.university && (
                  <span style={{
                    background: '#eaf4ff',
                    color: '#2980b9',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid #d6eaf8'
                  }}>
                    🎓 {company.university.name}
                  </span>
                )}

                {/* Department Badge */}
                <span style={{
                  background: '#f0f0f0',
                  color: '#555',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  {company.department === 'all'
                    ? 'All Depts'
                    : company.department}
                </span>

                <span className={`badge badge-${company.status}`}>
                  {company.status}
                </span>
              </div>
            </div>

            <div className='company-card-details'>
              <p>
                <strong>Role:</strong> {company.role}
              </p>
              <p>
                <strong>Package:</strong> {company.package}
              </p>
              <p>
                <strong>Min CGPA:</strong> {company.minimumCgpa || 0}
              </p>
              <p>
                <strong>Last Date:</strong> {formatDate(company.lastDate)}
              </p>

              {/* ✅ University Code */}
              {company.university && (
                <p>
                  <strong>University Code:</strong>{' '}
                  <span style={{
                    background: '#eaf4ff',
                    color: '#3498db',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {company.university.code}
                  </span>
                </p>
              )}

              {company.description && (
                <p>
                  <strong>Description:</strong> {company.description}
                </p>
              )}
              {company.registrationLink && (
                <p>
                  <strong>Registration:</strong>{' '}
                  <a
                    href={company.registrationLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#9b59b6' }}
                  >
                    {company.registrationLink}
                  </a>
                </p>
              )}
            </div>

            <div className='company-card-actions'>
              <button
                className='btn-danger'
                onClick={() => handleDelete(company._id, company.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}

export default AdminCompanies