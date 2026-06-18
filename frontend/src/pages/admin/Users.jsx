import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      setUsers(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (role) => {
    setActiveFilter(role)
    if (role === 'all') {
      setFiltered(users)
    } else {
      setFiltered(users.filter(u => u.role === role))
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await adminApi.deleteUser(userId)
      if (res.message === 'User deleted successfully!') {
        setMessage('User deleted successfully! ✅')
        loadUsers()
        setTimeout(() => setMessage(''), 3000)
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
      <h2 className='page-title'>👥 All Users</h2>

      {message && <div className='success-msg'>{message}</div>}

      {/* Filter Buttons */}
      <div className='filter-buttons'>
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilter('all')}
        >
          All ({users.length})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'student' ? 'active' : ''}`}
          onClick={() => handleFilter('student')}
        >
          Students ({users.filter(u => u.role === 'student').length})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'coordinator' ? 'active' : ''}`}
          onClick={() => handleFilter('coordinator')}
        >
          Coordinators ({users.filter(u => u.role === 'coordinator').length})
        </button>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>No Users Found!</h3>
        </div>
      ) : (
        <div className='section'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department || 'N/A'}</td>
                  <td>
                    {user.role !== 'admin' ? (
                      <button
                        className='btn-danger'
                        onClick={() => handleDelete(user._id)}
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span style={{ color: '#7f8c8d' }}>—</span>
                    )}
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

export default Users