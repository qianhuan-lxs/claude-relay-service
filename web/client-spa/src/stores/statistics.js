import { defineStore } from 'pinia'
import axios from 'axios'
import { setAuthToken } from '../config/api'

// 独立于已配置 baseURL 的 api 实例，使用绝对路径避免 /api 前缀冲突
const http = axios.create()
// Attach Authorization header from localStorage for each request
http.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : ''
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (_) {}
  return config
})

// 响应拦截器：处理登录过期
http.interceptors.response.use(
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

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    loading: false,
    error: '',
    period: 'week', // week | month | all
    stats: null,
    apiKeys: []
  }),
  actions: {
    async fetchUsageStats(period = 'week', model) {
      this.loading = true
      this.error = ''
      try {
        const params = { period }
        if (model) params.model = model
        // 注意：以 / 开头，绕过 /api baseURL，直达服务器挂载的 /users 路由
        const { data } = await http.get('/users/usage-stats', { params })
        if (data?.success) {
          this.stats = data.stats || null
          this.period = period
        } else {
          this.error = data?.message || '获取使用统计失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || '获取使用统计失败'
      } finally {
        this.loading = false
      }
    }
  ,
    async fetchUserApiKeys(includeDeleted = false) {
      this.loading = true
      this.error = ''
      try {
        const params = includeDeleted ? { includeDeleted: 'true' } : undefined
        const { data } = await http.get('/users/api-keys', { params })
        if (data?.success) {
          this.apiKeys = data.apiKeys || []
        } else {
          this.error = data?.message || '获取 API Keys 失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || '获取 API Keys 失败'
      } finally {
        this.loading = false
      }
    }
  }
})


