import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check URL params first (coming from login page)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const urlUser = urlParams.get('user')

    if (urlToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser))
        const decodedToken = decodeURIComponent(urlToken)

        // Save to localStorage
        localStorage.setItem('token', decodedToken)
        localStorage.setItem('user', JSON.stringify(parsedUser))

        setToken(decodedToken)
        setUser(parsedUser)

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        )
      } catch (error) {
        console.log('Error parsing URL params:', error)
      }
    } else {
      // Check localStorage
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        try {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.log('Error parsing saved user:', error)
        }
      }
    }

    setLoading(false)
  }, [])

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href =
      'http://127.0.0.1:5500/placement_hub/client/login.html'
  }

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)