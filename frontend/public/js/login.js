// =============================================
// login.js
// Connected to: login.html
// Purpose: Role selection + credential login
// Calls: POST /api/auth/login
// =============================================

let selectedRole = null
let selectedRoleLabel = null
let selectedRoleIcon = null

// ✅ Step 1 — Role selected
function selectRole(role, icon, label) {
  selectedRole = role
  selectedRoleLabel = label
  selectedRoleIcon = icon

  // Highlight selected card
  document.querySelectorAll('.role-card').forEach(card => {
    card.classList.remove('selected')
  })
  event.currentTarget.classList.add('selected')

  // Small delay for visual feedback then go to step 2
  setTimeout(() => {
    goToCredentials()
  }, 200)
}

// ✅ Go to credentials step
function goToCredentials() {
  document.getElementById('step1').classList.remove('active')
  document.getElementById('step2').classList.add('active')
  document.getElementById('dot1').classList.remove('active')
  document.getElementById('dot2').classList.add('active')

  // Show selected role badge
  document.getElementById('selectedRoleBadge').innerHTML =
    `${selectedRoleIcon} ${selectedRoleLabel}`

  // Focus on email field
  document.getElementById('email').focus()
}

// ✅ Go back to role selection
function goBack() {
  document.getElementById('step2').classList.remove('active')
  document.getElementById('step1').classList.add('active')
  document.getElementById('dot2').classList.remove('active')
  document.getElementById('dot1').classList.add('active')
  document.getElementById('errorMsg').style.display = 'none'
}

// ✅ Show error message
function showError(msg) {
  const el = document.getElementById('errorMsg')
  el.textContent = msg
  el.style.display = 'block'
}

// ✅ Login form submit
// Connected to: #loginForm in login.html
// Calls: POST /api/auth/login
// On success: stores token + redirects to dashboard
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  if (!selectedRole) {
    showError('Please select a role first!')
    goBack()
    return
  }

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  if (!email) return showError('Email is required!')
  if (!password) return showError('Password is required!')

  const submitBtn = document.querySelector('#loginForm button[type="submit"]')
  submitBtn.textContent = 'Logging in...'
  submitBtn.disabled = true

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (data.token) {
      // ✅ Validate role matches selected role
      if (data.user.role !== selectedRole) {
        showError(
          `This account is registered as "${data.user.role}", not "${selectedRoleLabel}". Please go back and select the correct role.`
        )
        submitBtn.textContent = 'Login'
        submitBtn.disabled = false
        return
      }

      // ✅ Store token and user info
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (data.user.university) {
        localStorage.setItem(
          'university',
          JSON.stringify(data.user.university)
        )
      }

      // ✅ Redirect based on role
      if (data.user.role === 'student') {
        window.location.href = '/student/dashboard'
      } else if (data.user.role === 'coordinator') {
        window.location.href = '/coordinator/dashboard'
      } else if (data.user.role === 'head') {
        window.location.href = '/head/dashboard'
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin/dashboard'
      }

    } else {
      showError(data.message || 'Invalid credentials!')
      submitBtn.textContent = 'Login'
      submitBtn.disabled = false
    }

  } catch (error) {
    showError('Cannot connect to server! Make sure server is running.')
    submitBtn.textContent = 'Login'
    submitBtn.disabled = false
  }
})