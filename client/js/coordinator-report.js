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

// Load companies into dropdown
async function loadCompanies() {
  try {
    const res = await fetch(`${API_URL}/coordinator/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const companies = await res.json()
    const select = document.getElementById('companySelect')

    companies.forEach(company => {
      const option = document.createElement('option')
      option.value = company._id
      option.innerText = company.name
      select.appendChild(option)
    })

  } catch (error) {
    console.log('Error loading companies:', error)
  }
}

// Load report for selected company
async function loadReport() {
  const companyId = document.getElementById('companySelect').value

  if (!companyId) return

  try {
    const res = await fetch(
      `${API_URL}/coordinator/company-report/${companyId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    )

    const data = await res.json()

    // Show stats
    document.getElementById('reportStats').style.display = 'block'
    document.getElementById('totalStudents').innerText = data.totalStudents
    document.getElementById('totalApplied').innerText = data.totalApplied
    document.getElementById('totalNotApplied').innerText = data.totalNotApplied

    // Show applied students
    document.getElementById('appliedSection').style.display = 'block'
    const appliedList = document.getElementById('appliedList')

    if (data.applied.length === 0) {
      appliedList.innerHTML = '<p>No students applied yet!</p>'
    } else {
      appliedList.innerHTML = `
        <table class="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Roll Number</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.applied.map(app => `
              <tr>
                <td>${app.student.name}</td>
                <td>${app.student.email}</td>
                <td>${app.student.department || 'N/A'}</td>
                <td>${app.student.rollNumber || 'N/A'}</td>
                <td>
                  <span class="status-badge ${app.status}">
                    ${app.status}
                  </span>
                </td>
                <td>
                  <select
                    class="status-select"
                    onchange="updateStatus('${app._id}', this.value)"
                  >
                    <option value="applied"
                      ${app.status === 'applied' ? 'selected' : ''}>
                      Applied
                    </option>
                    <option value="shortlisted"
                      ${app.status === 'shortlisted' ? 'selected' : ''}>
                      Shortlisted
                    </option>
                    <option value="rejected"
                      ${app.status === 'rejected' ? 'selected' : ''}>
                      Rejected
                    </option>
                    <option value="selected"
                      ${app.status === 'selected' ? 'selected' : ''}>
                      Selected
                    </option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }

    // Show not applied students
    document.getElementById('notAppliedSection').style.display = 'block'
    const notAppliedList = document.getElementById('notAppliedList')

    if (data.notApplied.length === 0) {
      notAppliedList.innerHTML = '<p>All students have applied!</p>'
    } else {
      notAppliedList.innerHTML = `
        <table class="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Roll Number</th>
            </tr>
          </thead>
          <tbody>
            ${data.notApplied.map(student => `
              <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.department || 'N/A'}</td>
                <td>${student.rollNumber || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }

  } catch (error) {
    console.log('Error loading report:', error)
  }
}

// Update application status
async function updateStatus(applicationId, status) {
  try {
    const res = await fetch(
      `${API_URL}/coordinator/applications/${applicationId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    )

    if (res.ok) {
      alert(`Status updated to ${status}! ✅`)
      loadReport()
    }

  } catch (error) {
    alert('Something went wrong!')
  }
}

// Load companies on page load
loadCompanies()
