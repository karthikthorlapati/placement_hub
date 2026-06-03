document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const errorMsg = document.getElementById('errorMsg')

  errorMsg.style.display = 'none'

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMsg.style.display = 'block'
      errorMsg.innerText = data.message
      return
    }

    // Save token and user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Build redirect URL with token as query param
    const token = encodeURIComponent(data.token)
    const user = encodeURIComponent(JSON.stringify(data.user))

    if (data.user.role === 'student') {
      window.location.replace(
        `http://localhost:3000/student/dashboard?token=${token}&user=${user}`
      )
    } else if (data.user.role === 'coordinator') {
      window.location.replace(
        `http://localhost:3000/coordinator/dashboard?token=${token}&user=${user}`
      )
    } else if (data.user.role === 'admin') {
      window.location.replace(
        `http://localhost:3000/admin/dashboard?token=${token}&user=${user}`
      )
    }

  } catch (error) {
    errorMsg.style.display = 'block'
    errorMsg.innerText = 'Something went wrong. Please try again.'
  }
})