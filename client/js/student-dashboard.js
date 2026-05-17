// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

if (user.role !== 'student') {
  window.location.href = '../login.html'
}

// Show student name
document.getElementById('studentName').innerText = `Hello, ${user.name}!`

// Load dashboard data
async function loadDashboard() {
  try {
    // Get companies
    const companiesRes = await fetch(`${API_URL}/student/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const companies = await companiesRes.json()
    document.getElementById('totalCompanies').innerText = companies.length

    // Get my applications
    const appsRes = await fetch(`${API_URL}/student/my-applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const applications = await appsRes.json()
    document.getElementById('totalApplied').innerText = applications.length

    // Count shortlisted
    const shortlisted = applications.filter(app => app.status === 'shortlisted')
    document.getElementById('totalShortlisted').innerText = shortlisted.length

    // Show recent companies
    const companiesList = document.getElementById('companiesList')
    if (companies.length === 0) {
      companiesList.innerHTML = '<p>No companies available right now</p>'
    } else {
      companiesList.innerHTML = companies.slice(0, 3).map(company => `
        <div class="company-card">
          <h4>${company.name}</h4>
          <p>Role: ${company.role}</p>
          <p>Package: ${company.package}</p>
          <p>Last Date: ${new Date(company.lastDate).toLocaleDateString()}</p>
        </div>
      `).join('')
    }

  } catch (error) {
    console.log('Error loading dashboard:', error)
  }
}

loadDashboard()
