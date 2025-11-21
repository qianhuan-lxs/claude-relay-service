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

// 响应拦截器：处理登录过期
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理 401 未授权错误（登录过期）
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '登录已过期，请重新登录'
      
      // 清除本地存储的认证信息
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      setAuthToken('')
      
      // 显示提示信息并跳转到登录页
      if (typeof window !== 'undefined') {
        // 使用 alert 作为简单的提示方式
        alert(errorMessage)
        
        // 使用 window.location 跳转，避免循环依赖
        const currentPath = window.location.pathname
        if (!currentPath.includes('/auth/login')) {
          window.location.href = '/auth/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

