<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppNavbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">使用统计</h1>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p class="text-gray-400">查看您的API使用情况和数据统计</p>
          <div class="inline-flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button @click="setPeriod('week')" :class="period === 'week' ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-md text-sm">7天</button>
            <button @click="setPeriod('month')" :class="period === 'month' ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-md text-sm">30天</button>
            <button @click="setPeriod('all')" :class="period === 'all' ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-md text-sm">全部</button>
          </div>
        </div>
      </div>

      <!-- Stats Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Requests -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总请求数</h3>
            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stats?.totalRequests || 0 }}</div>
          <div class="text-sm text-gray-400">周期：{{ periodLabel }}</div>
        </div>

        <!-- Total Tokens -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总Token数</h3>
            <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ (stats?.totalInputTokens || 0) + (stats?.totalOutputTokens || 0) }}</div>
          <div class="text-sm text-gray-400">输入 {{ stats?.totalInputTokens || 0 }} · 输出 {{ stats?.totalOutputTokens || 0 }}</div>
        </div>

        <!-- Total Cost -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">总消费</h3>
            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ (stats?.totalCost || 0).toFixed(2) }}</div>
          <div class="text-sm text-gray-400">周期：{{ periodLabel }}</div>
        </div>

        <!-- Average Response Time -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-400">平均响应时间</h3>
            <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-white mb-1">—</div>
          <div class="text-sm text-gray-400">后端暂未提供</div>
        </div>
      </div>

      <!-- Chart Placeholder -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Usage Trend Chart -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">使用趋势</h2>
          </div>
          <div class="h-64">
            <div v-if="loading" class="h-full flex items-center justify-center text-gray-400">加载中...</div>
            <div v-else-if="!dailyStats?.length" class="h-full flex items-center justify-center text-gray-500">暂无数据</div>
            <div v-else class="h-full flex flex-col justify-end gap-2">
              <div class="flex items-end gap-2 h-48">
                <div v-for="(d, idx) in dailyStats" :key="idx" class="flex-1">
                  <div class="w-full bg-blue-500/30 rounded-t" :style="{ height: barHeight(d.requests) }"></div>
                </div>
              </div>
              <div class="grid grid-cols-6 gap-2 text-xs text-gray-500">
                <div v-for="(d, idx) in tickedDates" :key="idx" class="truncate">{{ d }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Usage by Endpoint -->
        <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">端点使用情况</h2>
          </div>
          <div class="space-y-3">
            <div v-if="!modelStats?.length" class="text-gray-500">暂无模型统计</div>
            <div v-else v-for="(m, idx) in modelStats" :key="idx" class="flex items-center gap-3">
              <div class="w-32 text-sm text-gray-300 truncate" :title="m.model">{{ m.model }}</div>
              <div class="flex-1 bg-white/10 h-2 rounded">
                <div class="bg-purple-500/60 h-2 rounded" :style="{ width: modelPercent(m) }"></div>
              </div>
              <div class="w-28 text-right text-sm text-gray-400">{{ m.requests || 0 }} 次</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-6">最近活动</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">时间</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">端点</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">状态</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">Token数</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">消费</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-white/5">
                <td colspan="5" class="py-8 text-center text-gray-500">
                  暂无活动记录
                  <p class="text-sm text-gray-600 mt-2">数据将在首次使用后显示</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- API Keys Summary -->
      <div class="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-white">我的 API Keys</h2>
          <div class="text-sm text-gray-400">共 {{ apiKeys.length }} 个</div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">名称</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">创建时间</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">请求数</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">Tokens</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">总消费</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!apiKeys.length">
                <td colspan="6" class="py-8 text-center text-gray-500">暂无 API Keys</td>
              </tr>
              <tr v-for="k in apiKeys" :key="k.id" class="border-b border-white/5">
                <td class="py-3 px-4 text-gray-200">{{ k.name || k.keyPreview || k.id }}</td>
                <td class="py-3 px-4 text-gray-400 text-sm">{{ formatDate(k.createdAt) }}</td>
                <td class="py-3 px-4 text-gray-300">{{ k.usage?.requests || 0 }}</td>
                <td class="py-3 px-4 text-gray-300">{{ (k.usage?.inputTokens || 0) + (k.usage?.outputTokens || 0) }}</td>
                <td class="py-3 px-4 text-gray-300">${{ (k.totalCost || 0).toFixed(2) }}</td>
                <td class="py-3 px-4">
                  <span :class="k.isActive ? 'text-green-400' : 'text-red-400'">{{ k.isActive ? '启用' : '停用' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
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
import { computed, onMounted, ref, watch } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useStatisticsStore } from '@/stores/statistics'

const statistics = useStatisticsStore()
const loading = computed(() => statistics.loading)
const stats = computed(() => statistics.stats)
const period = computed(() => statistics.period)

const periodLabel = computed(() => (period.value === 'week' ? '7天' : period.value === 'month' ? '30天' : '全部'))

function setPeriod(p) {
  if (p !== period.value) {
    statistics.fetchUsageStats(p)
  }
}

const dailyStats = computed(() => stats.value?.dailyStats || [])
const modelStats = computed(() => stats.value?.modelStats || [])
const apiKeys = computed(() => statistics.apiKeys || [])

function barHeight(value) {
  const max = Math.max(...dailyStats.value.map((d) => d.requests || 0), 1)
  const h = Math.round(((value || 0) / max) * 100)
  return `${h}%`
}

const tickedDates = computed(() => {
  if (!dailyStats.value?.length) return []
  const step = Math.ceil(dailyStats.value.length / 6)
  return dailyStats.value.map((d) => d.date).filter((_, i) => i % step === 0)
})

function modelPercent(m) {
  const total = modelStats.value.reduce((sum, x) => sum + (x.requests || 0), 0) || 1
  return `${Math.min(100, Math.round(((m.requests || 0) / total) * 100))}%`
}

onMounted(() => {
  // 进入页面时立即加载数据
  statistics.fetchUsageStats(period.value || 'week')
  statistics.fetchUserApiKeys(true)
})

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch (_) {
    return String(value)
  }
}
</script>

<style scoped>
/* 自定义样式 */
</style>

