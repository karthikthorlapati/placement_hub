import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminApi } from '../../api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteMsg, setDeleteMsg] = useState('')
  const [activeRole, setActiveRole] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      const list = Array.isArray(data) ? data : []
      setUsers(list)
      setFiltered(list)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase()
    const result = users.filter(u =>
      u.name.toLowerCase().includes(value) ||
      u.email.toLowerCase().includes(value) ||
      (u.department && u.department.toLowerCase().includes(value)) ||
      (u.university?.name && u.university.name.toLowerCase().includes(value))
    )
    setFiltered(result)
  }

  const handleRoleFilter = (role) => {
    setActiveRole(role)
    if (role === 'all') {
      setFiltered(users)
    } else {
      setFiltered(users.filter(u => u.role === role))
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}?`)) return
    try {
      await adminApi.deleteUser(userId)
      setDeleteMsg(`${userName} deleted successfully! ✅`)
      loadUsers()
      setTimeout(() => setDeleteMsg(''), 3000)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const roleBadgeColor = (role) => {
    if (role === 'student') return { bg: '#eaf4ff', color: '#2980b9' }
    if (role === 'coordinator') return { bg: '#eafaf1', color: '#27ae60' }
    if (role === 'head') return { bg: '#fef9e7', color: '#f39c12' }
    return { bg: '#f5eef8', color: '#8e44ad' }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>👥 All Users</h2>

      {deleteMsg && <div className='success-msg'>{deleteMsg}</div>}

      {/* Role Filter Buttons */}
      <div className='filter-buttons' style={{ marginBottom: '15px' }}>
        {['all', 'student', 'coordinator', 'head'].map(role => (
          <button
            key={role}
            className={`filter-btn ${activeRole === role ? 'active' : ''}`}
            onClick={() => handleRoleFilter(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
            {' '}
            ({role === 'all'
              ? users.length
              : users.filter(u => u.role === role).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className='search-bar' style={{ marginBottom: '20px' }}>
        <input
          type='text'
          placeholder='Search by name, email, department, university...'
          onChange={handleSearch}
        />
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
        <strong>Showing: {filtered.length} Users</strong>
      </div>

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
                <th>University</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const badge = roleBadgeColor(user.role)
                return (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td style={{ fontSize: '13px' }}>{user.email}</td>
                    <td>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.university ? (
                        <span>
                          <span style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#2c3e50'
                          }}>
                            {user.university.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#3498db',
                            background: '#eaf4ff',
                            padding: '1px 6px',
                            borderRadius: '8px'
                          }}>
                            {user.university.code}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: '#bdc3c7', fontSize: '12px' }}>
                          N/A
                        </span>
                      )}
                    </td>
                    <td>{user.department || 'N/A'}</td>
                    <td>
                      <button
                        className='btn-danger'
                        onClick={() => handleDelete(user._id, user.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export default Users