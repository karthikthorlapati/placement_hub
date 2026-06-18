import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { headApi } from '../../api'

const HeadReport = () => {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

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

  const handleCompanyChange = async (e) => {
    const companyId = e.target.value
    setSelectedCompany(companyId)
    if (!companyId) return
    setLoading(true)
    setReport(null)
    try {
      const data = await headApi.getCompanyReport(companyId)
      setReport(data)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h2 className='page-title'>📊 Company Report</h2>

      {/* Select Company */}
      <div className='section'>
        <h3>Select Company</h3>
        <div className='form-group'>
          <select value={selectedCompany} onChange={handleCompanyChange}>
            <option value=''>-- Select a Company --</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name} — {company.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className='loading'>Loading report...</div>}

      {report && !loading && (
        <>
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

          {updateMsg && <div className='success-msg'>{updateMsg}</div>}

          {/* Applied */}
          <div className='section'>
            <h3>✅ Applied Students ({report.totalApplied})</h3>
            {report.applied.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>No students applied yet!</p>
            ) : (
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Roll Number</th>
                    <th>CGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.applied.map(app => (
                    <tr key={app._id}>
                      <td>{app.student?.name || 'N/A'}</td>
                      <td>{app.student?.department || 'N/A'}</td>
                      <td>{app.student?.rollNumber || 'N/A'}</td>
                      <td>{app.student?.cgpa || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Not Applied */}
          <div className='section'>
            <h3>❌ Not Applied ({report.totalNotApplied})</h3>
            {report.notApplied.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>All students applied! 🎉</p>
            ) : (
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Roll Number</th>
                    <th>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {report.notApplied.map(student => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
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

      {!selectedCompany && !loading && (
        <div className='empty-state'>
          <h3>Select a Company</h3>
          <p>Select a company to view its report.</p>
        </div>
      )}

    </Layout>
  )
}

export default HeadReport