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

// Load profile data
async function loadProfile() {
  try {
    const res = await fetch(`${API_URL}/student/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()

    // Fill form with existing data
    document.getElementById('name').value = data.name || ''
    document.getElementById('email').value = data.email || ''
    document.getElementById('department').value = data.department || ''
    document.getElementById('rollNumber').value = data.rollNumber || ''
    document.getElementById('phone').value = data.phone || ''
    document.getElementById('cgpa').value = data.cgpa || ''

  } catch (error) {
    console.log('Error loading profile:', error)
  }
}

// Update profile
async function updateProfile() {
  const name = document.getElementById('name').value
  const phone = document.getElementById('phone').value
  const cgpa = document.getElementById('cgpa').value
  const department = document.getElementById('department').value
  const rollNumber = document.getElementById('rollNumber').value


  const profileSuccess = document.getElementById('profileSuccess')
  const profileError = document.getElementById('profileError')

  profileSuccess.style.display = 'none'
  profileError.style.display = 'none'

  // Validate CGPA
  if (cgpa && (cgpa < 0 || cgpa > 10)) {
    profileError.style.display = 'block'
    profileError.innerText = 'CGPA must be between 0 and 10!'
    return
  }

  try {
    const res = await fetch(`${API_URL}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone, department, rollNumber,  cgpa: cgpa ? parseFloat(cgpa) : 0 })
    })

    const data = await res.json()

    if (res.ok) {
      profileSuccess.style.display = 'block'
      profileSuccess.innerText = 'Profile updated successfully! ✅'

      // Update local storage
      const updatedUser = { ...user, name: data.user.name }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      document.getElementById('studentName').innerText = `Hello, ${data.user.name}!`

    } else {
      profileError.style.display = 'block'
      profileError.innerText = data.message
    }

  } catch (error) {
    profileError.style.display = 'block'
    profileError.innerText = 'Something went wrong!'
  }
}

// Change password
async function changePassword() {
  const oldPassword = document.getElementById('oldPassword').value
  const newPassword = document.getElementById('newPassword').value
  const confirmPassword = document.getElementById('confirmPassword').value

  const passwordSuccess = document.getElementById('passwordSuccess')
  const passwordError = document.getElementById('passwordError')

  passwordSuccess.style.display = 'none'
  passwordError.style.display = 'none'

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    passwordError.style.display = 'block'
    passwordError.innerText = 'New passwords do not match!'
    return
  }

  // Validate password length
  if (newPassword.length < 6) {
    passwordError.style.display = 'block'
    passwordError.innerText = 'Password must be at least 6 characters!'
    return
  }

  try {
    const res = await fetch(`${API_URL}/student/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    })

    const data = await res.json()

    if (res.ok) {
      passwordSuccess.style.display = 'block'
      passwordSuccess.innerText = 'Password changed successfully! ✅'

      // Clear password fields
      document.getElementById('oldPassword').value = ''
      document.getElementById('newPassword').value = ''
      document.getElementById('confirmPassword').value = ''

    } else {
      passwordError.style.display = 'block'
      passwordError.innerText = data.message
    }

  } catch (error) {
    passwordError.style.display = 'block'
    passwordError.innerText = 'Something went wrong!'
  }
}

// Load profile on page load
loadProfile()