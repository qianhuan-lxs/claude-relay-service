import { defineStore } from 'pinia'
import { api } from '@/config/api'

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [],
    userOrders: [],
    loading: false,
    error: null
  }),

  actions: {
    /**
     * 获取所有可用套餐
     */
    async fetchPlans() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/users/plans')
        if (data?.success) {
          this.plans = data.data || []
        } else {
          throw new Error(data?.error || '获取套餐列表失败')
        }
      } catch (error) {
        this.error = error?.response?.data?.message || error.message || '获取套餐列表失败'
        console.error('Failed to fetch plans:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取用户订单列表
     */
    async fetchUserOrders() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/users/orders')
        if (data?.success) {
          this.userOrders = data.data || []
        } else {
          throw new Error(data?.error || '获取订单列表失败')
        }
      } catch (error) {
        this.error = error?.response?.data?.message || error.message || '获取订单列表失败'
        console.error('Failed to fetch user orders:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建订单
     * @param {string} planId - 套餐ID
     * @returns {Promise<Object>} 创建的订单
     */
    async createOrder(planId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/users/orders', { planId })
        if (data?.success) {
          // 刷新订单列表
          await this.fetchUserOrders()
          return data.data
        } else {
          throw new Error(data?.error || '创建订单失败')
        }
      } catch (error) {
        this.error = error?.response?.data?.message || error.message || '创建订单失败'
        console.error('Failed to create order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取用户已激活的套餐（通过订单）
     */
    getActivatedPlans() {
      return this.userOrders.filter((order) => order.status === 'activated')
    },

    /**
     * 获取用户待激活的订单
     */
    getPendingOrders() {
      return this.userOrders.filter((order) => order.status === 'pending')
    }
  }
})

