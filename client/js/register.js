// Show or hide fields based on role selection
document.getElementById('role').addEventListener('change', function () {
  const role = this.value

  const departmentField = document.getElementById('departmentField')
  const rollField = document.getElementById('rollField')
  const phoneField = document.getElementById('phoneField')
  const cgpaField = document.getElementById('cgpaField')

  if (role === 'student') {
    // Show all fields
    departmentField.style.display = 'block'
    rollField.style.display = 'block'
    phoneField.style.display = 'block'
    cgpaField.style.display = 'block'
  } else if (role === 'coordinator') {
    // Show only department
    departmentField.style.display = 'block'
    rollField.style.display = 'none'
    phoneField.style.display = 'none'
    cgpaField.style.display = 'none'
  } else {
    // Hide all
    departmentField.style.display = 'none'
    rollField.style.display = 'none'
    phoneField.style.display = 'none'
    cgpaField.style.display = 'none'
  }
})

// Handle form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = document.getElementById('name').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const role = document.getElementById('role').value
  const department = document.getElementById('department').value
  const rollNumber = document.getElementById('rollNumber').value
  const phone = document.getElementById('phone').value
  const cgpa = document.getElementById('cgpa').value

  const errorMsg = document.getElementById('errorMsg')
  const successMsg = document.getElementById('successMsg')

  // Hide previous messages
  errorMsg.style.display = 'none'
  successMsg.style.display = 'none'

  // Basic validation
  if (!role) {
    errorMsg.style.display = 'block'
    errorMsg.innerText = 'Please select a role!'
    return
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        department,
        rollNumber,
        phone,
        cgpa: cgpa ? parseFloat(cgpa) : 0
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMsg.style.display = 'block'
      errorMsg.innerText = data.message
      return
    }

    // Show success message
    successMsg.style.display = 'block'
    successMsg.innerText = 'Registered successfully! Redirecting to login...'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = 'login.html'
    }, 2000)

  } catch (error) {
    errorMsg.style.display = 'block'
    errorMsg.innerText = 'Something went wrong. Please try again.'
  }
})