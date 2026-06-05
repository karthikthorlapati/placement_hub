import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { coordinatorApi } from '../../api'

const Students = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await coordinatorApi.getStudents()
      setStudents(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase()
    const result = students.filter(s =>
      s.name.toLowerCase().includes(value) ||
      s.email.toLowerCase().includes(value) ||
      (s.department && s.department.toLowerCase().includes(value)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(value))
    )
    setFiltered(result)
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>👨‍🎓 All Students</h2>

      {/* Search */}
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search by name, email, department...'
          onChange={handleSearch}
        />
      </div>

      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Students Found!</h3>
          <p>No students registered yet.</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}

export default Students