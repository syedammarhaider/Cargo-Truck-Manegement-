import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token from localStorage to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('tcms_token')
  if (token) config.headers.Authorization = `Bearer ${token}` 
  return config
})

// Auto-redirect to /login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tcms_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
