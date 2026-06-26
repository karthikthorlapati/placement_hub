
let verifiedUniversityId = null
let generatedCode = null

// ✅ Show/hide fields based on role
document.getElementById('role').addEventListener('change', function () {
  const role = this.value

  const universityCreate = document.getElementById('universityCreateSection')
  const universityJoin = document.getElementById('universityJoinSection')
  const departmentField = document.getElementById('departmentField')
  const rollField = document.getElementById('rollField')
  const phoneField = document.getElementById('phoneField')
  const cgpaField = document.getElementById('cgpaField')

  // Reset all first
  universityCreate.style.display = 'none'
  universityJoin.style.display = 'none'
  departmentField.style.display = 'none'
  rollField.style.display = 'none'
  phoneField.style.display = 'none'
  cgpaField.style.display = 'none'
  verifiedUniversityId = null

  if (role === 'head') {
    universityCreate.style.display = 'block'
    phoneField.style.display = 'block'
  }

  if (role === 'coordinator') {
    universityJoin.style.display = 'block'
    departmentField.style.display = 'block'
    phoneField.style.display = 'block'
  }

  if (role === 'student') {
    universityJoin.style.display = 'block'
    departmentField.style.display = 'block'
    rollField.style.display = 'block'
    phoneField.style.display = 'block'
    cgpaField.style.display = 'block'
  }
})

// ✅ Verify university code
// Called when user clicks "Verify" button
// Sends GET /api/universities/verify/:code
// Shows university name if valid
document.getElementById('verifyCodeBtn').addEventListener('click', async () => {
  const code = document.getElementById('universityCode').value.trim()
  const verifiedDiv = document.getElementById('universityVerified')

  if (!code) {
    verifiedDiv.style.display = 'block'
    verifiedDiv.style.background = '#f8d7da'
    verifiedDiv.style.color = '#dc3545'
    verifiedDiv.textContent = 'Please enter a university code!'
    return
  }

  verifiedDiv.style.display = 'block'
  verifiedDiv.style.background = '#fff3cd'
  verifiedDiv.style.color = '#856404'
  verifiedDiv.textContent = 'Verifying...'

  try {
    const res = await fetch(
      `${API_URL}/universities/verify/${code.toUpperCase()}`
    )
    const data = await res.json()

    if (res.ok) {
      verifiedUniversityId = data._id
      verifiedDiv.style.background = '#d4edda'
      verifiedDiv.style.color = '#28a745'
      verifiedDiv.textContent =
        `✅ Found: ${data.name} (${data.location || 'Location not specified'})`
    } else {
      verifiedUniversityId = null
      verifiedDiv.style.background = '#f8d7da'
      verifiedDiv.style.color = '#dc3545'
      verifiedDiv.textContent = `❌ ${data.message}`
    }
  } catch (error) {
    verifiedDiv.style.background = '#f8d7da'
    verifiedDiv.style.color = '#dc3545'
    verifiedDiv.textContent = 'Error verifying code!'
  }
})

// ✅ Show/hide error and success messages
const showError = (msg) => {
  const el = document.getElementById('errorMsg')
  el.textContent = msg
  el.style.display = 'block'
  document.getElementById('successMsg').style.display = 'none'
  window.scrollTo(0, 0)
}

const showSuccess = (msg) => {
  const el = document.getElementById('successMsg')
  el.textContent = msg
  el.style.display = 'block'
  document.getElementById('errorMsg').style.display = 'none'
  window.scrollTo(0, 0)
}

// ✅ Form submit handler
// Connected to: register form in register.html
// Calls: POST /api/auth/register
// On success: shows university code (if head) or redirects to login
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
  const universityName = document.getElementById('universityName').value.trim()
  const universityLocation = document.getElementById('universityLocation').value.trim()
  const universityCode = document.getElementById('universityCode').value.trim()

  // Frontend validation
  if (!name) return showError('Name is required!')
  if (!email) return showError('Email is required!')
  if (!password || password.length < 6) {
    return showError('Password must be at least 6 characters!')
  }
  if (!role) return showError('Please select a role!')

  if (role === 'head') {
    if (!universityName) {
      return showError('University name is required!')
    }
    if (!phone || phone.length !== 10) {
      return showError('Valid 10-digit phone number required!')
    }
  }

  if (role === 'coordinator') {
    if (!universityCode) {
      return showError('Please enter your university code!')
    }
    if (!verifiedUniversityId) {
      return showError('Please verify your university code first!')
    }
    if (!department) return showError('Department is required!')
    if (!phone || phone.length !== 10) {
      return showError('Valid 10-digit phone number required!')
    }
  }

  if (role === 'student') {
    if (!universityCode) {
      return showError('Please enter your university code!')
    }
    if (!verifiedUniversityId) {
      return showError('Please verify your university code first!')
    }
    if (!department) return showError('Department is required!')
    if (!rollNumber) return showError('Roll number is required!')
    if (!phone || phone.length !== 10) {
      return showError('Valid 10-digit phone number required!')
    }
    if (!cgpa) return showError('CGPA is required!')
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, password, role,
        department, rollNumber, phone,
        cgpa: cgpa ? parseFloat(cgpa) : 0,
        universityName,
        location: universityLocation,
        universityCode
      })
    })

    const data = await res.json()

    if (res.ok) {
      // ✅ Show full success message (includes university code for head)
      showSuccess(data.message)

      // If head, keep them on page so they can read the code
      // If others, redirect to login after 3 seconds
      if (role !== 'head') {
        setTimeout(() => {
          window.location.href = '/login.html'
        }, 2000)
      } else {
        // For head, show a more prominent code display
        document.getElementById('registerForm').style.display = 'none'
        const successEl = document.getElementById('successMsg')
        successEl.style.padding = '20px'
        successEl.style.fontSize = '16px'
        successEl.style.lineHeight = '1.6'

        setTimeout(() => {
          window.location.href = '/login.html'
        }, 15000)
      }
    } else {
      showError(data.message || 'Registration failed!')
    }

  } catch (error) {
    showError('Something went wrong! Please try again.')
  }
})