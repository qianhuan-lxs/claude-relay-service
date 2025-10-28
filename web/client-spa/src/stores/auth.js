import { defineStore } from 'pinia'
import { api, setAuthToken } from '../config/api'

export const useAuthStore = defineStore('client-auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('userData') || 'null'),
    token: localStorage.getItem('userToken') || '',
    loading: false,
    error: ''
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user
  },
  actions: {
    async register({ username, email, password }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/client/auth/register', { username, email, password })
        return data
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || 'Registration failed'
        throw e
      } finally {
        this.loading = false
      }
    },
    async login({ username, password }) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/client/auth/login', { username, password })
        if (data.success) {
          this.user = data.user
          this.token = data.sessionToken
          localStorage.setItem('userToken', this.token)
          localStorage.setItem('userData', JSON.stringify(this.user))
          setAuthToken(this.token)
        }
        return data
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || 'Login failed'
        throw e
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await api.post('/client/auth/logout')
      } catch (_) {}
      this.user = null
      this.token = ''
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      setAuthToken('')
    },
    async profile() {
      const { data } = await api.get('/client/auth/profile')
      return data
    }
  }
})


