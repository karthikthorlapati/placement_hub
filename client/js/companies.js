// Check if user is logged in
const user = getUser()
const token = getToken()

if (!user || !token) {
  window.location.href = '../login.html'
}

// Show student name
document.getElementById('studentName').innerText = `Hello, ${user.name}!`

// Store all companies globally for search
let allCompanies = []

// Load all companies
async function loadCompanies() {
  try {
    const res = await fetch(`${API_URL}/student/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    allCompanies = await res.json()
    displayCompanies(allCompanies)

  } catch (error) {
    document.getElementById('companiesList').innerHTML =
      '<p>Error loading companies. Please try again.</p>'
  }
}

// Display companies on page
function displayCompanies(companies) {
  const companiesList = document.getElementById('companiesList')

  if (companies.length === 0) {
    companiesList.innerHTML = '<p>No companies available right now.</p>'
    return
  }

  companiesList.innerHTML = companies.map(company => `
    <div class="company-card-full" id="card-${company._id}">
      <div class="company-header">
        <h3>${company.name}</h3>
        <span class="status-badge ${company.status}">${company.status}</span>
      </div>
      <div class="company-details">
        <p>💼 <strong>Role:</strong> ${company.role}</p>
        <p>💰 <strong>Package:</strong> ${company.package}</p>
        <p>📋 <strong>Eligibility:</strong> ${company.eligibility}</p>
        <p>📅 <strong>Last Date:</strong> ${new Date(company.lastDate).toLocaleDateString()}</p>
        <p>📝 <strong>Description:</strong> ${company.description}</p>
      </div>
      <button
        class="apply-btn"
        id="btn-${company._id}"
        onclick="applyForCompany('${company._id}')"
      >
        Apply Now
      </button>
    </div>
  `).join('')

  // Check which companies already applied
  checkApplications(companies)
}

// Check already applied companies
async function checkApplications(companies) {
  for (let company of companies) {
    try {
      const res = await fetch(`${API_URL}/student/check-application/${company._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()

      if (data.applied) {
        const btn = document.getElementById(`btn-${company._id}`)
        if (btn) {
          btn.innerText = 'Already Applied ✅'
          btn.disabled = true
          btn.style.background = '#95a5a6'
        }
      }
    } catch (error) {
      console.log('Error checking application:', error)
    }
  }
}

// Apply for company
async function applyForCompany(companyId) {
  try {
    const res = await fetch(`${API_URL}/student/apply/${companyId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()

    if (res.ok) {
      alert('Applied successfully! ✅')
      // Update button
      const btn = document.getElementById(`btn-${companyId}`)
      btn.innerText = 'Already Applied ✅'
      btn.disabled = true
      btn.style.background = '#95a5a6'
    } else {
      alert(data.message)
    }

  } catch (error) {
    alert('Something went wrong. Please try again.')
  }
}

// Search companies
function searchCompanies() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase()
  const filtered = allCompanies.filter(company =>
    company.name.toLowerCase().includes(searchValue) ||
    company.role.toLowerCase().includes(searchValue)
  )
  displayCompanies(filtered)
}

// Load companies on page load
loadCompanies()