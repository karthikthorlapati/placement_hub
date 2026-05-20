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

// Load all companies
async function loadCompanies() {
  try {
    const res = await fetch(`${API_URL}/admin/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const companies = await res.json()
    displayCompanies(companies)

  } catch (error) {
    document.getElementById('companiesList').innerHTML =
      '<p>Error loading companies!</p>'
  }
}

// Display companies
function displayCompanies(companies) {
  const companiesList = document.getElementById('companiesList')

  if (companies.length === 0) {
    companiesList.innerHTML = '<p>No companies found!</p>'
    return
  }

  companiesList.innerHTML = companies.map(company => `
    <div class="company-card-full">
      <div class="company-header">
        <h3>${company.name}</h3>
        <span class="status-badge ${company.status}">${company.status}</span>
      </div>
      <div class="company-details">
        <p>💼 <strong>Role:</strong> ${company.role}</p>
        <p>💰 <strong>Package:</strong> ${company.package}</p>
        <p>📋 <strong>Eligibility:</strong> ${company.eligibility}</p>
        <p>📅 <strong>Last Date:</strong>
          ${new Date(company.lastDate).toLocaleDateString()}
        </p>
      </div>
      <div class="card-actions">
        <button
          class="btn-delete"
          onclick="deleteCompany('${company._id}')"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('')
}

// Delete company
async function deleteCompany(companyId) {
  const confirm = window.confirm('Are you sure you want to delete this company?')
  if (!confirm) return

  try {
    const res = await fetch(`${API_URL}/admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      alert('Company deleted successfully! ✅')
      loadCompanies()
    }

  } catch (error) {
    alert('Something went wrong!')
  }
}

// Load companies on page load
loadCompanies()
