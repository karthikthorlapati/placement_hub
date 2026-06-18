import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const HeadCompanies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [formMsg, setFormMsg] = useState('')
  const [formErr, setFormErr] = useState('')
  const [form, setForm] = useState({
    name: '',
    role: '',
    package: '',
    minimumCgpa: '',
    lastDate: '',
    description: '',
    registrationLink: '',
    department: 'all'
  })

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

  const handleAddCompany = async () => {
    setFormMsg('')
    setFormErr('')

    if (!form.name || !form.role || !form.package || !form.lastDate) {
      setFormErr('Please fill all required fields!')
      return
    }

    try {
      const res = await headApi.addCompany({
        name: form.name,
        role: form.role,
        package: form.package,
        minimumCgpa: parseFloat(form.minimumCgpa) || 0,
        lastDate: form.lastDate,
        description: form.description,
        registrationLink: form.registrationLink,
        department: form.department
      })

      if (res.message === 'Company added successfully!') {
        setFormMsg('Company added successfully! ✅')
        setForm({
          name: '',
          role: '',
          package: '',
          minimumCgpa: '',
          lastDate: '',
          description: '',
          registrationLink: '',
          department: 'all'
        })
        loadCompanies()
      } else {
        setFormErr(res.message || 'Failed to add company')
      }
    } catch (error) {
      setFormErr('Something went wrong!')
      console.log('Error:', error)
    }
  }

  const handleUpdateStatus = async (companyId, status) => {
    try {
      await headApi.updateCompany(companyId, { status })
      loadCompanies()
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const handleDelete = async (companyId) => {
    if (!window.confirm('Delete this company?')) return
    try {
      await headApi.deleteCompany(companyId)
      loadCompanies()
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
      <h2 className='page-title'>🏢 Manage Companies</h2>

      {/* Add Company Form */}
      <div className='section'>
        <h3>➕ Add New Company</h3>
        <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '15px' }}>
          As Placement Head you can add companies for specific
          departments or all departments
        </p>

        {formMsg && <div className='success-msg'>{formMsg}</div>}
        {formErr && <div className='error-msg'>{formErr}</div>}

        <div className='form-row'>
          <div className='form-group'>
            <label>Company Name *</label>
            <input
              type='text'
              placeholder='e.g. TCS'
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          <div className='form-group'>
            <label>Job Role *</label>
            <input
              type='text'
              placeholder='e.g. Software Engineer'
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            />
          </div>
        </div>

        <div className='form-row'>
          <div className='form-group'>
            <label>Package *</label>
            <input
              type='text'
              placeholder='e.g. 7 LPA'
              value={form.package}
              onChange={e => setForm({...form, package: e.target.value})}
            />
          </div>
          <div className='form-group'>
            <label>Minimum CGPA</label>
            <input
              type='number'
              placeholder='e.g. 7.5'
              value={form.minimumCgpa}
              onChange={e => setForm({...form, minimumCgpa: e.target.value})}
              min='0'
              max='10'
              step='0.1'
            />
          </div>
          <div className='form-group'>
            <label>Last Date *</label>
            <input
              type='date'
              value={form.lastDate}
              onChange={e => setForm({...form, lastDate: e.target.value})}
            />
          </div>
        </div>

        <div className='form-group'>
          <label>Target Department *</label>
          <select
            value={form.department}
            onChange={e => setForm({...form, department: e.target.value})}
          >
            <option value='all'>🌍 All Departments</option>
            <option value='CSE'>CSE</option>
            <option value='AIML'>AIML</option>
            <option value='ECE'>ECE</option>
            <option value='EEE'>EEE</option>
            <option value='MECH'>MECH</option>
            <option value='CIVIL'>CIVIL</option>
          </select>
        </div>

        <div className='form-group'>
          <label>Registration Link</label>
          <input
            type='url'
            placeholder='e.g. https://company.com/apply'
            value={form.registrationLink}
            onChange={e => setForm({
              ...form, registrationLink: e.target.value
            })}
          />
        </div>

        <div className='form-group'>
          <label>Description</label>
          <textarea
            placeholder='Brief description about company'
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <button className='btn-primary' onClick={handleAddCompany}>
          Add Company
        </button>
      </div>

      {/* Companies List */}
      <div className='section'>
        <h3>📋 All Companies ({companies.length})</h3>
        {companies.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>No companies added yet!</p>
        ) : (
          companies.map(company => (
            <div key={company._id} className='company-card'>
              <div className='company-card-header'>
                <h3>{company.name}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{
                    background: '#f0f0f0',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#555'
                  }}>
                    {company.department === 'all' ? '🌍 All Depts' : company.department}
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
                
                {company.description && (
                  <p>📝 <strong>Description:</strong> {company.description}</p>
                )}
                
                {company.registrationLink && company.registrationLink !== '' && (
                  <p>🔗 <strong>Registration:</strong> <a href={company.registrationLink} target='_blank' rel='noopener noreferrer' style={{ color: '#9b59b6' }}>{company.registrationLink}</a></p>
                )}
              </div>

              <div className='company-card-actions'>
                <button
                  className='btn-success'
                  onClick={() => handleUpdateStatus(company._id, 'active')}
                >
                  ✅ Set Active
                </button>
                <button
                  className='btn-warning'
                  onClick={() => handleUpdateStatus(company._id, 'closed')}
                >
                  🔒 Set Closed
                </button>
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
      </div>

    </Layout>
  )
}

export default HeadCompanies