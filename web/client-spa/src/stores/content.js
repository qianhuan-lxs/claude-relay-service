import { defineStore } from 'pinia'
import { api } from '@/config/api'

export const useContentStore = defineStore('content', {
  state: () => ({
    announcements: [],
    tutorials: [],
    loadingAnnouncements: false,
    loadingTutorials: false,
    error: ''
  }),
  actions: {
    async fetchAnnouncements() {
      this.loadingAnnouncements = true
      this.error = ''
      try {
        const { data } = await api.get('/client/announcements')
        if (data?.success) {
          this.announcements = data.data || []
        } else {
          this.error = data?.message || '获取公告失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || '获取公告失败'
        this.announcements = []
      } finally {
        this.loadingAnnouncements = false
      }
    },
    async fetchTutorials() {
      this.loadingTutorials = true
      this.error = ''
      try {
        const { data } = await api.get('/client/tutorials')
        if (data?.success) {
          this.tutorials = data.data || []
        } else {
          this.error = data?.message || '获取教程失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || e.message || '获取教程失败'
        this.tutorials = []
      } finally {
        this.loadingTutorials = false
      }
    }
  }
})

