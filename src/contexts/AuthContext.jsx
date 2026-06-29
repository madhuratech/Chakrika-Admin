import { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('admin_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        localStorage.removeItem('admin_user')
      }
    }
    return null
  })
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await apiService.post('/admin/auth/login', { username, password })
    const { token: newToken, user: userData } = res.data
    setUser(userData)
    setToken(newToken)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    localStorage.setItem('admin_token', newToken)
    return true
  }

  const logout = async () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
