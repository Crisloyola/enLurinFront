import api from './api'

export const authService = {
  // POST /auth/login
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data // { token, user }
  },
  // POST /auth/register
  register: async (payload: { name: string; email: string; password: string; role: string }) => {
    const { data } = await api.post('/auth/register', payload)
    return data
  },
  // GET /auth/user → usuario autenticado
  getMe: async () => {
    const { data } = await api.get('/auth/user')
    return data
  },
  // GET /auth/dashboard
  getDashboard: async () => {
    const { data } = await api.get('/auth/dashboard')
    return data
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
