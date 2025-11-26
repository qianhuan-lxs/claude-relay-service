<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppNavbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section with User Info -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">
              欢迎回来，<span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{{ displayName }}</span>
            </h1>
            <p class="text-gray-400">
              {{ userEmail ? userEmail : '查看系统公告和官方教程' }}
              <span v-if="userCreatedAt" class="ml-2 text-sm">· 加入于 {{ formatDate(userCreatedAt) }}</span>
            </p>
          </div>
          <div class="flex gap-3">
            <router-link
              to="/statistics"
              class="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-sm font-medium text-white hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-200"
            >
              <i class="fas fa-chart-line mr-2"></i>查看统计
            </router-link>
            <router-link
              to="/redeem"
              class="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg text-sm font-medium text-white hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-200"
            >
              <i class="fas fa-gift mr-2"></i>兑换订阅
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Requests -->
        <div class="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer" @click="$router.push('/statistics')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总请求数</h3>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ quickStats.totalRequests }}</div>
          <div class="text-sm text-gray-400">本周使用</div>
        </div>

        <!-- Total Tokens -->
        <div class="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer" @click="$router.push('/statistics')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总Token数</h3>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ formatNumber(quickStats.totalTokens) }}</div>
          <div class="text-sm text-gray-400">输入 {{ formatNumber(quickStats.inputTokens) }} · 输出 {{ formatNumber(quickStats.outputTokens) }}</div>
        </div>

        <!-- Total Cost -->
        <div class="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer" @click="$router.push('/statistics')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总消费</h3>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ quickStats.totalCost.toFixed(2) }}</div>
          <div class="text-sm text-gray-400">本周消费</div>
        </div>

        <!-- API Keys Count -->
        <div class="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer" @click="$router.push('/redeem')">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">API Keys</h3>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
              <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ apiKeysCount }}</div>
          <div class="text-sm text-gray-400">{{ activeApiKeysCount }} 个活跃</div>
        </div>
      </div>

      <!-- My Plans Section -->
      <div v-if="activatedPlans.length > 0" class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">我的套餐</h2>
          <router-link
            to="/plans"
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            查看全部
            <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="order in activatedPlans"
            :key="order.id"
            class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-white">{{ order.planName }}</h3>
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                已激活
              </span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-400">
                <span>订单ID</span>
                <span class="text-gray-300 font-mono text-xs">{{ order.id.substring(0, 8) }}...</span>
              </div>
              <div class="flex justify-between text-gray-400">
                <span>激活时间</span>
                <span class="text-gray-300">{{ formatDate(order.activatedAt) }}</span>
              </div>
              <div v-if="order.expiresAt" class="flex justify-between text-gray-400">
                <span>过期时间</span>
                <span class="text-gray-300">{{ formatDate(order.expiresAt) }}</span>
              </div>
            </div>
            <div v-if="order.apiKeyId" class="mt-3 pt-3 border-t border-white/10">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">API Key</span>
                <span class="text-gray-300 font-mono">{{ order.apiKeyId.substring(0, 8) }}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- System Announcements -->
        <div class="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-semibold text-white">系统公告</h2>
              <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <router-link
              to="/docs"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <i class="fas fa-book text-xs"></i>
              查看教程
            </router-link>
          </div>
          <AnnouncementList />
        </div>

        <!-- Official Tutorials -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-white">官方教程</h2>
            <router-link
              to="/docs"
              class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              查看全部
              <i class="fas fa-arrow-right text-xs"></i>
            </router-link>
          </div>
          <TutorialList />
        </div>
      </div>

      <!-- API Keys Summary -->
      <div v-if="apiKeys.length > 0" class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">我的 API Keys</h2>
          <router-link
            to="/statistics"
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            查看详情
            <i class="fas fa-arrow-right text-xs"></i>
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="key in recentApiKeys"
            :key="key.id"
            class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
            @click="$router.push('/statistics')"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-white truncate">{{ key.name || key.keyPreview || '未命名' }}</h3>
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  key.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                ]"
              >
                {{ key.isActive ? '启用' : '停用' }}
              </span>
            </div>
            <div class="space-y-1 text-xs text-gray-400">
              <div class="flex justify-between items-center">
                <span>API Key</span>
                <div class="flex items-center gap-1">
                  <code class="text-xs text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded max-w-[120px] truncate">{{ key.key ? key.key.substring(0, 20) + '...' : 'N/A' }}</code>
                  <button
                    v-if="key.key"
                    @click.stop="copyApiKey(key.key)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                    title="复制完整 API Key"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between">
                <span>请求数</span>
                <span class="text-gray-300">{{ key.usage?.requests || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tokens</span>
                <span class="text-gray-300">{{ formatNumber((key.usage?.inputTokens || 0) + (key.usage?.outputTokens || 0)) }}</span>
              </div>
              <div class="flex justify-between">
                <span>消费</span>
                <span class="text-gray-300">${{ (key.totalCost || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="apiKeys.length > 3" class="mt-4 text-center">
          <router-link
            to="/statistics"
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            查看全部 {{ apiKeys.length }} 个 API Keys →
          </router-link>
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
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStatisticsStore } from '@/stores/statistics'
import { usePlansStore } from '@/stores/plans'
import { showToast } from '@/utils/toast'
import AppNavbar from '@/components/AppNavbar.vue'
import AnnouncementList from '@/components/AnnouncementList.vue'
import TutorialList from '@/components/TutorialList.vue'

const authStore = useAuthStore()
const statistics = useStatisticsStore()
const plansStore = usePlansStore()

const displayName = computed(() => {
  return authStore.user?.username || '用户'
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const userCreatedAt = computed(() => {
  return authStore.user?.createdAt || null
})

const apiKeys = computed(() => statistics.apiKeys || [])

const apiKeysCount = computed(() => apiKeys.value.length)

const activeApiKeysCount = computed(() => {
  return apiKeys.value.filter((k) => k.isActive).length
})

const recentApiKeys = computed(() => {
  // 显示最近使用的3个 API Keys，按最后使用时间排序
  return [...apiKeys.value]
    .sort((a, b) => {
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 3)
})

const activatedPlans = computed(() => {
  return plansStore.getActivatedPlans()
})

const quickStats = computed(() => {
  const stats = statistics.stats
  if (!stats) {
    return {
      totalRequests: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0
    }
  }
  return {
    totalRequests: stats.totalRequests || 0,
    totalTokens: (stats.totalInputTokens || 0) + (stats.totalOutputTokens || 0),
    inputTokens: stats.totalInputTokens || 0,
    outputTokens: stats.totalOutputTokens || 0,
    totalCost: stats.totalCost || 0
  }
})

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (_) {
    return String(value)
  }
}

async function copyApiKey(key) {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(key)
      showToast('API Key 已复制到剪贴板', 'success')
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = key
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        showToast('API Key 已复制到剪贴板', 'success')
      } catch (err) {
        showToast('复制失败，请手动复制', 'error')
      }
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('复制失败:', error)
    // 如果 Clipboard API 失败，尝试降级方案
    try {
      const textArea = document.createElement('textarea')
      textArea.value = key
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToast('API Key 已复制到剪贴板', 'success')
    } catch (err) {
      console.error('降级复制也失败:', err)
      showToast('复制失败，请手动复制', 'error')
    }
  }
}

onMounted(async () => {
  // 加载本周统计数据
  await statistics.fetchUsageStats('week')
  // 加载 API Keys
  await statistics.fetchUserApiKeys(false)
  // 加载用户订单
  try {
    await plansStore.fetchUserOrders()
  } catch (error) {
    // 静默处理错误，不影响其他数据加载
    console.error('Failed to fetch user orders:', error)
  }
})
</script>

<style scoped>
/* 自定义样式 */
</style>
