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

// Load all applications
async function loadApplications() {
  try {
    const res = await fetch(`${API_URL}/admin/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const applications = await res.json()
    if (!res.ok){
      throw new Error("Failed to load")
    }
    displayApplications(applications)

  } catch (error) {
    document.getElementById('applicationsList').innerHTML =
      '<p>Error loading applications!</p>'
  }
}

// Display applications
function displayApplications(applications) {
  const applicationsList = document.getElementById('applicationsList')

  if (applications.length === 0) {
    applicationsList.innerHTML = '<p>No applications found!</p>'
    return
  }

  applicationsList.innerHTML = `
    <table class="students-table">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Email</th>
          <th>Company</th>
          <th>Role</th>
          <th>Status</th>
          <th>Applied On</th>
        </tr>
      </thead>
      <tbody>
        ${applications.map(app => `
          <tr>
            <td>${app.student.name}</td>
            <td>${app.student.email}</td>
            <td>${app.company.name}</td>
            <td>${app.company.role}</td>
            <td>
              <span class="status-badge ${app.status}">${app.status}</span>
            </td>
            <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Load applications on page load
loadApplications()