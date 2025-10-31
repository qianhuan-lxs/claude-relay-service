<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppNavbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">欢迎回来，{{ displayName }}</h1>
        <p class="text-gray-400">这是您的配额使用概览</p>
      </div>

      <!-- Quota Overview -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8 shadow-lg">
        <h2 class="text-xl font-semibold text-white mb-6">剩余配额</h2>
        <p class="text-gray-400 mb-6">当前可用额度余量，月卡每天早上8点自动重置，优先使用月卡额度</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Pay-as-you-go Quota -->
          <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-300">按量额度</h3>
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-white mb-1">$0.00</div>
            <div class="text-sm text-gray-400">0 tokens</div>
          </div>
          
          <!-- Monthly Card Quota -->
          <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-300">月卡额度</h3>
              <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-white mb-1">$0.00</div>
            <div class="text-sm text-gray-400">0 tokens</div>
          </div>
        </div>
      </div>

      <!-- Active Subscriptions -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8 shadow-lg">
        <h2 class="text-xl font-semibold text-white mb-4">活跃订阅</h2>
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-white mb-2">0 个套餐</div>
          <div class="text-gray-400 mb-4">最早到期时间</div>
          <div class="text-gray-500">无订阅</div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Official Tutorials -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-white mb-4">官方教程</h2>
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              <span class="text-sm font-medium text-blue-300">教程提示</span>
            </div>
            <p class="text-sm text-gray-300">暂无信息公告</p>
          </div>
        </div>

        <!-- System Announcements -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 class="text-xl font-semibold text-white mb-4">系统公告</h2>
          <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-2">
              <div class="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
              <span class="text-sm font-medium text-yellow-300">重要通知</span>
            </div>
            <p class="text-sm text-gray-300">暂无其他公告</p>
          </div>
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

const authStore = useAuthStore()

const displayName = computed(() => {
  return authStore.user?.username || '用户'
})
</script>

<style scoped>
/* 自定义样式 */
</style>
