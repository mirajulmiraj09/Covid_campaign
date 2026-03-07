import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1/',
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const url = config.url || ''
  const publicPaths = [
    'auth/login',
    'auth/register',
    'auth/token',
    'auth/token/refresh',
  ]

  const isPublic = publicPaths.some((p) => url.includes(p))
  if (isPublic) {
    return config
  }

  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api