import { defineStore } from 'pinia'
import { apiClient } from '@/config/api'
import { ref } from 'vue'

export const useAdminUsersStore = defineStore('adminUsers', () => {
  // 状态
  const users = ref([])
  const userStats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 获取用户列表
  const fetchUsers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/users', { params })
      if (response.success) {
        users.value = response.users || []
        return response.users
      } else {
        throw new Error(response.message || '获取用户列表失败')
      }
    } catch (err) {
      error.value = err.message || '获取用户列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户统计概览
  const fetchUserStats = async () => {
    const response = await apiClient.get('/users/stats/overview')
    if (response.success) {
      userStats.value = response.stats
      return response.stats
    }
    return null
  }

  // 创建用户
  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/users', userData)
      if (response.success) {
        // 刷新用户列表
        await fetchUsers()
        return response.user
      } else {
        throw new Error(response.message || '创建用户失败')
      }
    } catch (err) {
      error.value = err.message || '创建用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情（包含 API Keys）
  const getUserDetail = async (userId) => {
    const response = await apiClient.get(`/users/${userId}`)
    if (response.success) return response.user
    throw new Error(response.message || '获取用户详情失败')
  }

  // 获取用户兑换码列表
  const getUserRedeems = async (userId) => {
    const response = await apiClient.get(`/users/${userId}/redeems`)
    if (response.success) return response.redeems || response.data || []
    throw new Error(response.message || '获取兑换码列表失败')
  }

  // 更新用户状态
  const toggleUserStatus = async (userId, isActive) => {
    const response = await apiClient.patch(`/users/${userId}/status`, { isActive })
    if (response.success) {
      const user = users.value.find((u) => u.id === userId)
      if (user) user.isActive = isActive
      return response
    }
    throw new Error(response.message || '更新用户状态失败')
  }

  // 禁用用户的所有 API Keys
  const disableUserApiKeys = async (userId) => {
    const response = await apiClient.post(`/users/${userId}/disable-keys`)
    if (response.success) return response
    throw new Error(response.message || '禁用 API Keys 失败')
  }

  // 更新用户角色
  const updateUserRole = async (userId, role) => {
    const response = await apiClient.patch(`/users/${userId}/role`, { role })
    if (response.success) {
      const user = users.value.find((u) => u.id === userId)
      if (user) user.role = role
      return response
    }
    throw new Error(response.message || '更新用户角色失败')
  }

  return {
    // State
    users,
    userStats,
    loading,
    error,
    // Actions
    fetchUsers,
    fetchUserStats,
    createUser,
    getUserDetail,
    getUserRedeems,
    toggleUserStatus,
    disableUserApiKeys,
    updateUserRole
  }
})
