<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">C</span>
            </div>
            <span class="ml-2 text-xl font-bold text-gray-900">Code</span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/redeem" class="px-3 py-2 rounded-lg border hover:bg-gray-50 text-gray-700">兑换码</router-link>
            <span class="text-gray-700">欢迎，{{ username }}</span>
            <button 
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">欢迎回来，</h1>
        <p class="text-gray-600">这是您的配额使用概览</p>
      </div>

      <!-- Quota Overview -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">剩余配额</h2>
        <p class="text-gray-600 mb-6">当前可用额度余量，月卡每天早上8点自动重置，优先使用月卡额度</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Pay-as-you-go Quota -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">按量额度</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">$0.00</div>
            <div class="text-sm text-gray-500">0</div>
          </div>
          
          <!-- Monthly Card Quota -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">月卡额度</h3>
            <div class="text-3xl font-bold text-gray-900 mb-1">$0.00</div>
            <div class="text-sm text-gray-500">0</div>
          </div>
        </div>
      </div>

      <!-- Active Subscriptions -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">活跃订阅</h2>
        <div class="text-center py-8">
          <div class="text-2xl font-bold text-gray-900 mb-2">0 个套餐</div>
          <div class="text-gray-600 mb-4">最早到期时间</div>
          <div class="text-gray-500">无订阅</div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Official Tutorials -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">官方教程</h2>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span class="text-sm font-medium text-blue-900">教程提示</span>
            </div>
            <p class="text-sm text-blue-800">暂无信息公告</p>
          </div>
        </div>

        <!-- System Announcements -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">系统公告</h2>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div class="flex items-center mb-2">
              <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span class="text-sm font-medium text-yellow-900">重要通知</span>
            </div>
            <p class="text-sm text-yellow-800">暂无其他公告</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 mb-2">专业的AI服务平台，为开发者提供AI解决方案。</p>
          <p class="text-gray-500 text-sm">© 2025 Claude. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')

onMounted(() => {
  // 获取用户名
  username.value = authStore.username || localStorage.getItem('username') || '用户'
})

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('登出失败:', error)
    // 即使登出失败，也清除本地状态并跳转
    localStorage.removeItem('userToken')
    localStorage.removeItem('username')
    router.push('/auth/login')
  }
}
</script>

<style scoped>
/* 自定义样式 */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}
</style>
