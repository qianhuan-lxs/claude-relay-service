import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

// Initialize from localStorage
const saved = typeof window !== 'undefined' ? localStorage.getItem('userToken') : ''
if (saved) setAuthToken(saved)


