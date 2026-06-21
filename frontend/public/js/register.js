// Show or hide fields based on role selection
document.getElementById('role').addEventListener('change', function () {
  const role = this.value
  const departmentField = document.getElementById('departmentField')
  const rollField = document.getElementById('rollField')
  const phoneField = document.getElementById('phoneField')
  const cgpaField = document.getElementById('cgpaField')

  if (role === 'student') {
    departmentField.style.display = 'block'
    rollField.style.display = 'block'
    phoneField.style.display = 'block'
    cgpaField.style.display = 'block'
  } else if (role === 'coordinator') {
  departmentField.style.display = 'block'
  rollField.style.display = 'none'
  phoneField.style.display = 'none'
  cgpaField.style.display = 'none'
  } else if (role === 'head') {
  departmentField.style.display = 'none'
  rollField.style.display = 'none'
  phoneField.style.display = 'none'
  cgpaField.style.display = 'none'
  } else {
  departmentField.style.display = 'none'
  rollField.style.display = 'none'
  phoneField.style.display = 'none'
  cgpaField.style.display = 'none'
  }
})

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const role = document.getElementById('role').value
  const name = document.getElementById('name').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const department = document.getElementById('department').value.trim()
  const rollNumber = document.getElementById('rollNumber').value.trim()
  const phone = document.getElementById('phone').value.trim()
  const cgpa = document.getElementById('cgpa').value

  // ✅ Frontend validation before sending
  if (!name) {
    alert('Please enter your name!')
    return
  }
  if (!email) {
    alert('Please enter your email!')
    return
  }
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters!')
    return
  }
  if (!role) {
    alert('Please select a role!')
    return
  }

  if (role === 'student') {
    if (!department) {
      alert('Department is required!')
      return
    }
    if (!rollNumber) {
      alert('Roll Number is required!')
      return
    }
    if (!phone || phone.length !== 10) {
      alert('Phone number must be exactly 10 digits!')
      return
    }
    if (!cgpa) {
      alert('CGPA is required!')
      return
    }
  }

  if (role === 'coordinator') {
    if (!department) {
      alert('Department is required!')
      return
    }
    if (!phone || phone.length !== 10) {
      alert('Phone number must be exactly 10 digits!')
      return
    }
  }

  if (role === 'head') {
    if (!phone || phone.length !== 10) {
      alert('Phone number must be exactly 10 digits!')
      return
    }
  }

  // ✅ All validations passed, send to backend
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password, role,
        department, rollNumber, phone, cgpa
      })
    })

    const data = await response.json()

    if (data.message === 'User registered successfully') {
      alert('Registration successful! Please login.')
      window.location.href = '/login.html'
    } else {
      alert(data.message)
    }
  } catch (error) {
    alert('Something went wrong!')
  }
})