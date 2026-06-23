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

    // Redirect based on role
    if (data.token) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // ✅ Store university info separately for easy access
    if (data.user.university) {
      localStorage.setItem(
        'university',
        JSON.stringify(data.user.university)
      )
    }

    if (data.user.role === 'student') {
      window.location.href = '/student/dashboard'
    } else if (data.user.role === 'coordinator') {
      window.location.href = '/coordinator/dashboard'
    } else if (data.user.role === 'head') {
      window.location.href = '/head/dashboard'
    } else if (data.user.role === 'admin') {
      window.location.href = '/admin/dashboard'
    }
  }
}catch (error) {
    errorMsg.style.display = 'block'
    errorMsg.innerText = 'Something went wrong. Please try again.'
  }
})
