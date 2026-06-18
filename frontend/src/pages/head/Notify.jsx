import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'

const Notify = () => {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [applications, setApplications] = useState(null)
  const [shortlistCsv, setShortlistCsv] = useState(null)
  const [selectionCsv, setSelectionCsv] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeStage, setActiveStage] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await headApi.getCompanies()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId)
    setResult(null)
    setError('')
    if (!companyId) {
      setApplications(null)
      return
    }
    try {
      const data = await headApi.getCompanyApplications(companyId)
      setApplications(data)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const handleProcessShortlist = async () => {
    setError('')
    setResult(null)

    if (!selectedCompany) {
      setError('Please select a company!')
      return
    }
    if (!shortlistCsv) {
      setError('Please upload shortlist CSV file!')
      return
    }

    setLoading(true)
    setActiveStage('shortlist')
    try {
      const data = await headApi.processShortlist(
        selectedCompany, shortlistCsv
      )
      if (data.message && !data.message.includes('error')) {
        setResult({ ...data, stage: 'shortlist' })
        setShortlistCsv(null)
        handleCompanyChange(selectedCompany)
      } else {
        setError(data.message || 'Something went wrong!')
      }
    } catch (error) {
      setError('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSelection = async () => {
    setError('')
    setResult(null)

    if (!selectedCompany) {
      setError('Please select a company!')
      return
    }
    if (!selectionCsv) {
      setError('Please upload selection CSV file!')
      return
    }

    setLoading(true)
    setActiveStage('selection')
    try {
      const data = await headApi.processSelection(
        selectedCompany, selectionCsv
      )
      if (data.message && !data.message.includes('error')) {
        setResult({ ...data, stage: 'selection' })
        setSelectionCsv(null)
        handleCompanyChange(selectedCompany)
      } else {
        setError(data.message || 'Something went wrong!')
      }
    } catch (error) {
      setError('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h2 className='page-title'>📤 Process Applications</h2>

      {/* How it works */}
      <div className='section'>
        <div style={{
          background: '#eaf4ff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #3498db'
        }}>
          <p style={{ marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold' }}>
            📋 How This Works (2 Stages):
          </p>
          <p style={{ marginBottom: '8px', color: '#2c3e50', fontSize: '14px' }}>
            <strong>Stage 1 - Shortlisting:</strong> Upload CSV with shortlisted
            roll numbers. Matched students → Shortlisted ✅. Remaining applied
            students → Auto Rejected ❌. Both get notified automatically.
          </p>
          <p style={{ color: '#2c3e50', fontSize: '14px' }}>
            <strong>Stage 2 - Final Selection:</strong> Upload CSV with selected
            roll numbers (from shortlisted pool). Matched students → Selected 🎉.
            Remaining shortlisted → Auto Rejected ❌. Both get notified automatically.
          </p>
          <div style={{
            marginTop: '10px',
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
              CSV Format: column named "roll_number"
            </p>
            <p style={{ color: '#2c3e50', fontSize: '12px' }}>roll_number</p>
            <p style={{ color: '#2c3e50', fontSize: '12px' }}>21CSE001</p>
            <p style={{ color: '#2c3e50', fontSize: '12px' }}>21AIML023</p>
          </div>
        </div>
      </div>

      {/* Select Company */}
      <div className='section'>
        <h3>Select Company</h3>
        <div className='form-group'>
          <select
            value={selectedCompany}
            onChange={e => handleCompanyChange(e.target.value)}
          >
            <option value=''>-- Select a Company --</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name} — {company.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className='error-msg'>{error}</div>}

      {/* Current Application Status */}
      {applications && (
        <div className='section'>
          <h3>📊 Current Status</h3>
          <div className='stats-container'>
            <div style={{
              background: '#3498db', color: 'white', padding: '15px',
              borderRadius: '10px', textAlign: 'center', flex: 1
            }}>
              <h2 style={{ margin: 0 }}>{applications.applied.length}</h2>
              <p style={{ margin: 0, fontSize: '13px' }}>Applied (Pending)</p>
            </div>
            <div style={{
              background: '#f39c12', color: 'white', padding: '15px',
              borderRadius: '10px', textAlign: 'center', flex: 1
            }}>
              <h2 style={{ margin: 0 }}>{applications.shortlisted.length}</h2>
              <p style={{ margin: 0, fontSize: '13px' }}>Shortlisted</p>
            </div>
            <div style={{
              background: '#2ecc71', color: 'white', padding: '15px',
              borderRadius: '10px', textAlign: 'center', flex: 1
            }}>
              <h2 style={{ margin: 0 }}>{applications.selected.length}</h2>
              <p style={{ margin: 0, fontSize: '13px' }}>Selected</p>
            </div>
            <div style={{
              background: '#e74c3c', color: 'white', padding: '15px',
              borderRadius: '10px', textAlign: 'center', flex: 1
            }}>
              <h2 style={{ margin: 0 }}>{applications.rejected.length}</h2>
              <p style={{ margin: 0, fontSize: '13px' }}>Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Stage 1 - Shortlisting */}
      {applications && applications.applied.length > 0 && (
        <div className='section'>
          <h3>🔵 Stage 1: Process Shortlisting</h3>
          <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '10px' }}>
            {applications.applied.length} students currently in "Applied"
            status. Upload shortlist CSV to process them.
          </p>
          <div className='form-group'>
            <label>Upload Shortlist CSV *</label>
            <input
              type='file'
              accept='.csv'
              onChange={e => setShortlistCsv(e.target.files[0])}
            />
            {shortlistCsv && (
              <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>
                ✅ File selected: {shortlistCsv.name}
              </p>
            )}
          </div>
          <button
            className='btn-primary'
            onClick={handleProcessShortlist}
            disabled={loading}
          >
            {loading && activeStage === 'shortlist' ?
              'Processing...' : '📤 Process Shortlisting'}
          </button>
        </div>
      )}

      {/* Stage 2 - Final Selection */}
      {applications && applications.shortlisted.length > 0 && (
        <div className='section'>
          <h3>🟢 Stage 2: Process Final Selection</h3>
          <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '10px' }}>
            {applications.shortlisted.length} students currently
            "Shortlisted". Upload final selection CSV to process them.
          </p>
          <div className='form-group'>
            <label>Upload Final Selection CSV *</label>
            <input
              type='file'
              accept='.csv'
              onChange={e => setSelectionCsv(e.target.files[0])}
            />
            {selectionCsv && (
              <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>
                ✅ File selected: {selectionCsv.name}
              </p>
            )}
          </div>
          <button
            className='btn-success'
            onClick={handleProcessSelection}
            disabled={loading}
          >
            {loading && activeStage === 'selection' ?
              'Processing...' : '🎉 Process Final Selection'}
          </button>
        </div>
      )}

      {/* No applications */}
      {applications && applications.applied.length === 0 &&
        applications.shortlisted.length === 0 && (
        <div className='empty-state'>
          <h3>Nothing to Process</h3>
          <p>No students in "Applied" or "Shortlisted" status for this company.</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className='section'>
          <h3>✅ Processing Results</h3>

          <div style={{
            background: '#d4edda',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
              {result.message}
            </p>
          </div>

          {result.notFoundRollNumbers && result.notFoundRollNumbers.length > 0 && (
            <div style={{
              background: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '8px' }}>
                ⚠️ Roll Numbers Not Found:
              </p>
              {result.notFoundRollNumbers.map((rn, index) => (
                <p key={index} style={{ color: '#555', fontSize: '13px' }}>• {rn}</p>
              ))}
            </div>
          )}

          {/* Stage 1 Results */}
          {result.stage === 'shortlist' && (
            <>
              {result.shortlistedStudents?.length > 0 && (
                <>
                  <h4 style={{ color: '#f39c12', marginBottom: '10px' }}>
                    🟡 Shortlisted ({result.shortlistedCount})
                  </h4>
                  <table className='data-table' style={{ marginBottom: '20px' }}>
                    <thead>
                      <tr><th>Name</th><th>Roll Number</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {result.shortlistedStudents.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td><td>{s.rollNumber}</td><td>{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {result.rejectedStudents?.length > 0 && (
                <>
                  <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>
                    🔴 Rejected ({result.rejectedCount})
                  </h4>
                  <table className='data-table'>
                    <thead>
                      <tr><th>Name</th><th>Roll Number</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {result.rejectedStudents.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td><td>{s.rollNumber}</td><td>{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

          {/* Stage 2 Results */}
          {result.stage === 'selection' && (
            <>
              {result.selectedStudents?.length > 0 && (
                <>
                  <h4 style={{ color: '#2ecc71', marginBottom: '10px' }}>
                    🟢 Selected ({result.selectedCount})
                  </h4>
                  <table className='data-table' style={{ marginBottom: '20px' }}>
                    <thead>
                      <tr><th>Name</th><th>Roll Number</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {result.selectedStudents.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td><td>{s.rollNumber}</td><td>{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {result.rejectedStudents?.length > 0 && (
                <>
                  <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>
                    🔴 Rejected ({result.rejectedCount})
                  </h4>
                  <table className='data-table'>
                    <thead>
                      <tr><th>Name</th><th>Roll Number</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {result.rejectedStudents.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td><td>{s.rollNumber}</td><td>{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      )}

    </Layout>
  )
}

export default Notify
