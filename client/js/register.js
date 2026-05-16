document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = document.getElementById('name').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const role = document.getElementById('role').value
  const department = document.getElementById('department').value
  const rollNumber = document.getElementById('rollNumber').value
  const phone = document.getElementById('phone').value

  const errorMsg = document.getElementById('errorMsg')
  const successMsg = document.getElementById('successMsg')

  // Hide previous messages
  errorMsg.style.display = 'none'
  successMsg.style.display = 'none'

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
        phone
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