// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

if (user.role !== 'admin') {
  window.location.href = '../login.html'
}

// Show admin name
document.getElementById('adminName').innerText = `Hello, ${user.name}!`

// Store all users globally
let allUsers = []

// Load all users
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    allUsers = await res.json()
    displayUsers(allUsers)

  } catch (error) {
    document.getElementById('usersList').innerHTML =
      '<p>Error loading users!</p>'
  }
}

// Display users
function displayUsers(users) {
  const usersList = document.getElementById('usersList')

  if (users.length === 0) {
    usersList.innerHTML = '<p>No users found!</p>'
    return
  }

  usersList.innerHTML = `
    <table class="students-table">
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
        ${users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
              <span class="role-badge ${u.role}">${u.role}</span>
            </td>
            <td>${u.department || 'N/A'}</td>
            <td>
              ${u.role !== 'admin' ? `
                <button
                  class="btn-delete-small"
                  onclick="deleteUser('${u._id}')"
                >
                  🗑️ Delete
                </button>
              ` : '—'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Filter users by role
function filterUsers(role) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  event.target.classList.add('active')

  // Filter users
  if (role === 'all') {
    displayUsers(allUsers)
  } else {
    const filtered = allUsers.filter(u => u.role === role)
    displayUsers(filtered)
  }
}

// Delete user
async function deleteUser(userId) {
  const confirm = window.confirm('Are you sure you want to delete this user?')
  if (!confirm) return
  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      alert('User deleted successfully! ✅')
      loadUsers()
    }

  } catch (error) {
    alert('Something went wrong!')
  }
}

// Load users on page load
loadUsers()