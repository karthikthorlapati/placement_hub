import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { coordinatorApi } from '../../api'

const Report = () => {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [updateMsg, setUpdateMsg] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await coordinatorApi.getCompanies()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error loading companies:', error)
    } finally {
      setCompaniesLoading(false)
    }
  }

  const loadReport = async (companyId) => {
    if (!companyId) return
    setLoading(true)
    setReport(null)
    setUpdateMsg('')
    try {
      const data = await coordinatorApi.getCompanyReport(companyId)
      console.log('Report data:', data)
      setReport(data)
    } catch (error) {
      console.log('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (e) => {
    const companyId = e.target.value
    setSelectedCompany(companyId)
    loadReport(companyId)
  }

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await coordinatorApi.updateApplicationStatus(applicationId, status)
      setUpdateMsg(`Status updated to ${status}! ✅`)
      loadReport(selectedCompany)
      setTimeout(() => setUpdateMsg(''), 3000)
    } catch (error) {
      console.log('Error updating status:', error)
    }
  }

  return (
    <Layout>
      <h2 className='page-title'>📊 Company Report</h2>

      {/* Select Company */}
      <div className='section'>
        <h3>Select Company to View Report</h3>
        {companiesLoading ? (
          <p>Loading companies...</p>
        ) : (
          <div className='form-group'>
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '15px',
                outline: 'none'
              }}
            >
              <option value=''>-- Select a Company --</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name} — {company.role}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading Report */}
      {loading && (
        <div className='loading'>Loading report...</div>
      )}

      {/* Report Content */}
      {report && !loading && (
        <>
          {/* Stats */}
          <div className='stats-container'>
            <StatCard
              number={report.totalStudents}
              label='Total Students'
              color='blue'
            />
            <StatCard
              number={report.totalApplied}
              label='Applied'
              color='green'
            />
            <StatCard
              number={report.totalNotApplied}
              label='Not Applied'
              color='orange'
            />
          </div>

          {/* Update Message */}
          {updateMsg && (
            <div className='success-msg'>{updateMsg}</div>
          )}

          {/* Applied Students */}
          <div className='section'>
            <h3>✅ Students Who Applied ({report.totalApplied})</h3>
            {report.applied.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>
                No students applied yet!
              </p>
            ) : (
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Roll Number</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.applied.map(app => (
                    <tr key={app._id}>
                      <td>{app.student?.name || 'N/A'}</td>
                      <td>{app.student?.email || 'N/A'}</td>
                      <td>{app.student?.department || 'N/A'}</td>
                      <td>{app.student?.rollNumber || 'N/A'}</td>
                      <td>{app.student?.cgpa || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={app.status}
                          onChange={e => handleUpdateStatus(
                            app._id,
                            e.target.value
                          )}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <option value='applied'>Applied</option>
                          <option value='shortlisted'>Shortlisted</option>
                          <option value='rejected'>Rejected</option>
                          <option value='selected'>Selected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Not Applied Students */}
          <div className='section'>
            <h3>
              ❌ Students Who Did Not Apply ({report.totalNotApplied})
            </h3>
            {report.notApplied.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>
                All students have applied! 🎉
              </p>
            ) : (
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Roll Number</th>
                    <th>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {report.notApplied.map(student => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.department || 'N/A'}</td>
                      <td>{student.rollNumber || 'N/A'}</td>
                      <td>{student.cgpa || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* No company selected message */}
      {!selectedCompany && !loading && (
        <div className='empty-state'>
          <h3>Select a Company</h3>
          <p>Please select a company from the dropdown to view its report.</p>
        </div>
      )}

    </Layout>
  )
}

export default Report