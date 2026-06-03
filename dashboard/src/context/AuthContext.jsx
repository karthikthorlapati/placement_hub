import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      console.log('Loading user from localStorage:', savedUser)
      return savedUser ? JSON.parse(savedUser) : null
    } catch (error) {
      console.log('Error parsing user:', error)
      return null
    }
  })

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token')
    console.log('Loading token from localStorage:', savedToken)
    return savedToken || null
  })

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = 'http://127.0.0.1:5500/placement_hub/client/login.html'
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)