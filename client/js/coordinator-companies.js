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
document.getElementById('coordinatorName').innerText = Hello, `${user.name}!`

// Load all companies
async function loadCompanies() {
  try {
    const res = await fetch(`${API_URL}`/coordinator/companies, {
      headers: { 'Authorization': Bearer `${token}` }
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
    companiesList.innerHTML = '<p>No companies added yet!</p>'
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
        <p>📅 <strong>Last Date:</strong> ${new Date(company.lastDate).toLocaleDateString()}</p>
        <p>📝 <strong>Description:</strong> ${company.description}</p>
      </div>
      <div class="card-actions">
        <button
          class="btn-status"
          onclick="updateStatus('${company._id}', 'active')"
        >
          ✅ Set Active
        </button>
        <button
          class="btn-status closed"
          onclick="updateStatus('${company._id}', 'closed')"
        >
          🔒 Set Closed
        </button>
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

// Add new company
async function addCompany() {
  const name = document.getElementById('companyName').value
  const role = document.getElementById('companyRole').value
  const pkg = document.getElementById('companyPackage').value
  const lastDate = document.getElementById('companyLastDate').value
  const eligibility = document.getElementById('companyEligibility').value
  const description = document.getElementById('companyDescription').value

  const formError = document.getElementById('formError')
  const formSuccess = document.getElementById('formSuccess')

  formError.style.display = 'none'
  formSuccess.style.display = 'none'

  // Basic validation
  if (!name || !role || !pkg || !lastDate) {
    formError.style.display = 'block'
    formError.innerText = 'Please fill all required fields!'
    return
  }

  try {
    const res = await fetch(`${API_URL}`/coordinator/companies, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer `${token}`
      },
      body: JSON.stringify({
        name,
        role,
        package: pkg,
        lastDate,
        eligibility,
        description
      })
    })

    const data = await res.json()

    if (res.ok) {
      formSuccess.style.display = 'block'
      formSuccess.innerText = 'Company added successfully! ✅'

      // Clear form
      document.getElementById('companyName').value = ''
      document.getElementById('companyRole').value = ''
      document.getElementById('companyPackage').value = ''
      document.getElementById('companyLastDate').value = ''
      document.getElementById('companyEligibility').value = ''
      document.getElementById('companyDescription').value = ''

      // Reload companies
      loadCompanies()
    } else {
      formError.style.display = 'block'
      formError.innerText = data.message
    }

  } catch (error) {
    formError.style.display = 'block'
    formError.innerText = 'Something went wrong!'
  }
}

// Update company status
async function updateStatus(companyId, status) {
  try {
    const res = await fetch(`${API_URL}`/coordinator/companies/`${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer `${token}`
      },
      body: JSON.stringify({ status })
    })

    if (res.ok) {
      alert(`Company status updated to ${status}! ✅`)
      loadCompanies()
    }

  } catch (error) {
    alert('Something went wrong!')
  }
}

// Delete company
async function deleteCompany(companyId) {
  const confirm = window.confirm('Are you sure you want to delete this company?')
  if (!confirm) return

  try {
    const res = await fetch(`${API_URL}`/coordinator/companies/`${companyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': Bearer `${token}` }
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