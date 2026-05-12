import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('tcms_token')
    if (!token) { 
      setLoading(false)
      return 
    }
    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('tcms_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('tcms_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try { 
      await api.post('/logout') 
    } catch {}
    localStorage.removeItem('tcms_token')
    setUser(null)
  }, [])

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout } },
    children
  )
}

export const useAuth = () => useContext(AuthContext)
