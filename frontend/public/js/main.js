const API_URL = 'http://localhost:5000/api'

function saveToken(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

function getToken() {
  return localStorage.getItem('token')
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'))
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login.html'
}