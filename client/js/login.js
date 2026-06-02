document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const errorMsg = document.getElementById('errorMsg')

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      // Show error message
      errorMsg.style.display = 'block'
      errorMsg.innerText = data.message
      return
    }

    // Save token and user
    saveToken(data.token, data.user)

    // Redirect based on role
    if (data.user.role === 'student') {
      window.location.href = 'http://localhost:3000/student/dashboard'
    } else if (data.user.role === 'coordinator') {
      window.location.href = 'http://localhost:3000/coordinator/dashboard'
    } else if (data.user.role === 'admin') {
      window.location.href = 'http://localhost:3000/admin/dashboard'
    }

  } catch (error) {
    errorMsg.style.display = 'block'
    errorMsg.innerText = 'Something went wrong. Please try again.'
  }
})