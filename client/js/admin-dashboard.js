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

// Load admin stats
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const stats = await res.json()

    document.getElementById('totalStudents').innerText = stats.totalStudents
    document.getElementById('totalCoordinators').innerText = stats.totalCoordinators
    document.getElementById('totalCompanies').innerText = stats.totalCompanies
    document.getElementById('totalApplications').innerText = stats.totalApplications

  } catch (error) {
    console.log('Error loading stats:', error)
  }
}

loadStats()