<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppNavbar />

    <main class="max-w-3xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">兑换订阅</h1>
        <p class="text-gray-400">使用兑换码激活您的订阅并获取 API Key</p>
      </div>

      <!-- Redeem Card -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2v1m0 0V5.5a2.5 2.5 0 115 0V8m-5 0v5m5-5v5m-5 0h5m-5 0H7m5 0v5m-5-5v5M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-gray-300 mb-1">请输入兑换码以获取您的 API Key</p>
            <p class="text-sm text-gray-500">兑换成功后，您的 API Key 将在此显示</p>
          </div>
        </div>

        <!-- Redeem Form -->
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                v-model="code"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="输入兑换码"
                required
              />
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {{ loading ? '兑换中...' : '立即兑换' }}
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p class="text-sm text-red-300 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </p>
        </div>

        <!-- Success Message with API Key -->
        <div v-if="apiKey" class="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-green-300 mb-2">兑换成功！</div>
              <div class="text-sm text-gray-300 mb-4">您的 API Key：</div>
            </div>
          </div>
          <div class="bg-slate-900/50 border border-white/10 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between gap-3">
              <code class="text-sm break-all text-gray-300 font-mono flex-1">{{ apiKey }}</code>
              <button
                @click="copy(apiKey)"
                class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </button>
            </div>
          </div>
          <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p class="text-xs text-yellow-300 flex items-start gap-2">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>请妥善保存，出于安全考虑此密钥只显示一次。</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">兑换说明</h2>
        <ul class="space-y-3 text-sm text-gray-400">
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>兑换码为一次性使用，兑换后立即失效</span>
          </li>
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>API Key 将在兑换成功后显示，请务必妥善保存</span>
          </li>
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>如果遇到问题，请联系客服获取帮助</span>
          </li>
        </ul>
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
import { ref } from 'vue'
import { api } from '@/config/api'
import AppNavbar from '@/components/AppNavbar.vue'

const code = ref('')
const loading = ref(false)
const error = ref('')
const apiKey = ref('')

async function onSubmit() {
  error.value = ''
  apiKey.value = ''
  loading.value = true
  try {
    const res = await api.post('/client/auth/redeem', { code: code.value.trim() })
    if (res.data?.success) {
      apiKey.value = res.data.data?.apiKey || ''
      if (!apiKey.value) {
        error.value = '兑换成功，但未返回密钥。'
      }
    } else {
      error.value = res.data?.message || '兑换失败'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || '兑换失败'
  } finally {
    loading.value = false
  }
}

function copy(text) {
  navigator.clipboard?.writeText(text).then(() => {
    // 可以添加一个成功提示
    console.log('已复制到剪贴板')
  })
}
</script>

<style scoped>
/* 自定义样式 */
</style>
