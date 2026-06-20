import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { headApi } from '../../api'

const HeadStudents = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('all')
  const [loading, setLoading] = useState(true)
  const [deleteMsg, setDeleteMsg] = useState('')

  useEffect(() => {
    loadDepartments()
    loadStudents('all')
  }, [])

  const loadDepartments = async () => {
    try {
      const data = await headApi.getDepartments()
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const loadStudents = async (department) => {
    setLoading(true)
    try {
      const data = await headApi.getStudents(department)
      setStudents(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeptChange = (e) => {
    const dept = e.target.value
    setSelectedDept(dept)
    loadStudents(dept)
  }

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase()
    const result = students.filter(s =>
      s.name.toLowerCase().includes(value) ||
      s.email.toLowerCase().includes(value) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(value)) ||
      (s.department && s.department.toLowerCase().includes(value))
    )
    setFiltered(result)
  }

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(
      `Are you sure you want to delete ${studentName}?`
    )) return

    try {
      const res = await headApi.deleteStudent(studentId)
      if (res.message) {
        setDeleteMsg(`${studentName} deleted successfully! ✅`)
        loadStudents(selectedDept)
        setTimeout(() => setDeleteMsg(''), 3000)
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
      <h2 className='page-title'>👨‍🎓 All Students</h2>

      {deleteMsg && <div className='success-msg'>{deleteMsg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className='form-group' style={{ flex: 1 }}>
          <label>Filter by Department</label>
          <select
            value={selectedDept}
            onChange={handleDeptChange}
          >
            <option value='all'>All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className='form-group' style={{ flex: 2 }}>
          <label>Search Students</label>
          <input
            type='text'
            placeholder='Search by name, email, roll number...'
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: '#3498db',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        <strong>Total: {filtered.length} Students</strong>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Students Found!</h3>
        </div>
      ) : (
        <div className='section'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Roll Number</th>
                <th>CGPA</th>
                <th>Phone</th>
                <th>Resume</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.department || 'N/A'}</td>
                  <td>{student.rollNumber || 'N/A'}</td>
                  <td>{student.cgpa || 'N/A'}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>
                    {student.resumeLink ? (
                      <a
                        href={student.resumeLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{
                          color: '#3498db',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        📄 View
                      </a>
                    ) : (
                      <span style={{ color: '#e74c3c', fontSize: '12px' }}>
                        Not added
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className='btn-danger'
                      onClick={() => handleDelete(
                        student._id,
                        student.name
                      )}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}

export default HeadStudents