// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

// Show student name
document.getElementById('studentName').innerText = `Hello, ${user.name}!`

// Load my applications
async function loadApplications() {
  try {
    const res = await fetch(`${API_URL}/student/my-applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const applications = await res.json()
    console.log('Applications:', applications)
    displayApplications(applications)

  } catch (error) {
    document.getElementById('applicationsList').innerHTML =
      '<p>Error loading applications. Please try again.</p>'
  }
}

// Display applications
function displayApplications(applications) {
  const applicationsList = document.getElementById('applicationsList')

  if (!applications || applications.length === 0) {
    applicationsList.innerHTML = `
      <div class="empty-state">
        <h3>No Applications Yet!</h3>
        <p>You have not applied to any company yet.</p>
        <a href="companies.html" class="action-btn">Browse Companies</a>
      </div>
    `
    return
  }

  applicationsList.innerHTML = applications
    .filter(app => app.company)
    .map(app => `
      <div class="application-card">
        <div class="application-header">
          <h3>${app.company.name}</h3>
          <span class="status-badge ${app.status}">${app.status}</span>
        </div>
        <div class="application-details">
          <p>💼 <strong>Role:</strong> ${app.company.role}</p>
          <p>💰 <strong>Package:</strong> ${app.company.package}</p>
          <p>📅 <strong>Applied On:</strong> ${new Date(app.appliedAt).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('')
}

// Load applications on page load
loadApplications()