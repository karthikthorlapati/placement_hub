// Base API URL
const API_URL = 'http://localhost:5000/api'

// Save token to localStorage
function saveToken(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token')
}

// Get user from localStorage
function getUser() {
  return JSON.parse(localStorage.getItem('user'))
}

// Logout function
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login.html'
}