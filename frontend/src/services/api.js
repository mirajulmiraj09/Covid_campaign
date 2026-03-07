import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1/',
})

// Attach token to every request (skip public paths)
api.interceptors.request.use((config) => {
  const url = config.url || ''
  const publicPaths = ['auth/login', 'auth/register', 'auth/token']
  const isPublic = publicPaths.some((p) => url.includes(p))

  if (!isPublic) {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-refresh expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('auth/login') &&
      !original.url.includes('auth/token')
    ) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(
            'http://127.0.0.1:8000/api/v1/auth/token/refresh/',
            { refresh }
          )
          const newAccess = res.data.access
          localStorage.setItem('access_token', newAccess)
          original.headers.Authorization = `Bearer ${newAccess}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api