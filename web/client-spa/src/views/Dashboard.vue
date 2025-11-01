<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppNavbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">欢迎回来，{{ displayName }}</h1>
        <p class="text-gray-400">查看系统公告和官方教程</p>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- System Announcements -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-white">系统公告</h2>
            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <AnnouncementList />
        </div>

        <!-- Official Tutorials -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-white">官方教程</h2>
            <router-link
              to="/docs"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              查看全部 →
            </router-link>
          </div>
          <TutorialList />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900/50 border-t border-slate-700/50 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-400 mb-2">专业的AI服务平台，为开发者提供AI解决方案。</p>
          <p class="text-gray-500 text-sm">© 2025 Claude. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppNavbar from '@/components/AppNavbar.vue'
import AnnouncementList from '@/components/AnnouncementList.vue'
import TutorialList from '@/components/TutorialList.vue'

const authStore = useAuthStore()

const displayName = computed(() => {
  return authStore.user?.username || '用户'
})
</script>

<style scoped>
/* 自定义样式 */
</style>
