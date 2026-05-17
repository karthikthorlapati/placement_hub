// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

if (user.role !== 'coordinator') {
  window.location.href = '../login.html'
}

// Show coordinator name
document.getElementById('coordinatorName').innerText = `Hello, ${user.name}!`

// Load dashboard stats
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/coordinator/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const stats = await res.json()

    document.getElementById('totalStudents').innerText = stats.totalStudents
    document.getElementById('totalCompanies').innerText = stats.totalCompanies
    document.getElementById('totalApplications').innerText = stats.totalApplications

  } catch (error) {
    console.log('Error loading stats:', error)
  }
}

loadStats()
