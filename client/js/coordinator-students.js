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

// Store all students globally for search
let allStudents = []

// Load all students
async function loadStudents() {
  try {
    const res = await fetch(`${API_URL}/coordinator/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    allStudents = await res.json()
    displayStudents(allStudents)

  } catch (error) {
      console.log(error)
      document.getElementById('studentsList').innerHTML =
      '<p>Error loading students!</p>'
  }
}

// Display students
function displayStudents(students) {
  const studentsList = document.getElementById('studentsList')

  if (students.length === 0) {
    studentsList.innerHTML = '<p>No students registered yet!</p>'
    return
  }

  studentsList.innerHTML = `
    <table class="students-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Roll Number</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(student => `
          <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.department || 'N/A'}</td>
            <td>${student.rollNumber || 'N/A'}</td>
            <td>${student.phone || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

// Search students
function searchStudents() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase()
  const filtered = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchValue) ||
    student.email.toLowerCase().includes(searchValue) ||
    (student.department && student.department.toLowerCase().includes(searchValue)) ||
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchValue))
  )
  displayStudents(filtered)
}

// Load students on page load
loadStudents()