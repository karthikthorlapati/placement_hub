import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'

const Notify = () => {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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

  const handleNotify = async () => {
    setError('')
    setResult(null)

    if (!selectedCompany) {
      setError('Please select a company!')
      return
    }

    if (!csvFile) {
      setError('Please upload a CSV file!')
      return
    }

    setLoading(true)
    try {
      const data = await headApi.notifyShortlisted(selectedCompany, csvFile)
      if (data.message) {
        setResult(data)
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
      <h2 className='page-title'>📤 Notify Shortlisted Students</h2>

      {/* How to use */}
      <div className='section'>
        <h3>📋 How to Use</h3>
        <div style={{
          background: '#eaf4ff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #3498db'
        }}>
          <p style={{ marginBottom: '8px', color: '#2c3e50' }}>
            <strong>Step 1:</strong> Select the company
          </p>
          <p style={{ marginBottom: '8px', color: '#2c3e50' }}>
            <strong>Step 2:</strong> Prepare CSV file with roll numbers
          </p>
          <p style={{ marginBottom: '8px', color: '#2c3e50' }}>
            <strong>Step 3:</strong> Upload CSV and click Notify
          </p>
          <p style={{ marginBottom: '8px', color: '#2c3e50' }}>
            <strong>Step 4:</strong> Students get notified automatically!
          </p>
          <div style={{
            marginTop: '15px',
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '13px' }}>
              CSV Format Example:
            </p>
            <p style={{ color: '#2c3e50', fontSize: '13px' }}>
              roll_number
            </p>
            <p style={{ color: '#2c3e50', fontSize: '13px' }}>21CSE001</p>
            <p style={{ color: '#2c3e50', fontSize: '13px' }}>21AIML023</p>
            <p style={{ color: '#2c3e50', fontSize: '13px' }}>21ECE045</p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className='section'>
        <h3>Upload Shortlist CSV</h3>

        {error && <div className='error-msg'>{error}</div>}

        <div className='form-group'>
          <label>Select Company *</label>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
          >
            <option value=''>-- Select a Company --</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name} — {company.role}
              </option>
            ))}
          </select>
        </div>

        <div className='form-group'>
          <label>Upload CSV File *</label>
          <input
            type='file'
            accept='.csv'
            onChange={e => setCsvFile(e.target.files[0])}
            style={{ padding: '10px 0' }}
          />
          {csvFile && (
            <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>
              ✅ File selected: {csvFile.name}
            </p>
          )}
        </div>

        <button
          className='btn-primary'
          onClick={handleNotify}
          disabled={loading}
          style={{ width: '100%', padding: '12px' }}
        >
          {loading ? 'Processing...' : '📤 Upload & Notify Students'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className='section'>
          <h3>✅ Notification Results</h3>

          <div style={{
            background: '#d4edda',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>
              {result.message}
            </p>
            <p style={{ color: '#555', marginTop: '5px' }}>
              Total Roll Numbers in CSV: {result.totalRollNumbers}
            </p>
            <p style={{ color: '#555' }}>
              Successfully Notified: {result.notifiedCount}
            </p>
          </div>

          {/* Not Found Roll Numbers */}
          {result.notFoundRollNumbers &&
            result.notFoundRollNumbers.length > 0 && (
            <div style={{
              background: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{
                color: '#dc3545',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                ⚠️ Roll Numbers Not Found in Database:
              </p>
              {result.notFoundRollNumbers.map((rn, index) => (
                <p key={index} style={{ color: '#555', fontSize: '13px' }}>
                  • {rn}
                </p>
              ))}
            </div>
          )}

          {/* Notified Students */}
          {result.results && result.results.length > 0 && (
            <>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>
                Notified Students:
              </h4>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll Number</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((student, index) => (
                    <tr key={index}>
                      <td>{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.email}</td>
                      <td>
                        <span className='badge badge-shortlisted'>
                          Notified ✅
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

    </Layout>
  )
}

export default Notify