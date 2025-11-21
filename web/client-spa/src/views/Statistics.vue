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
          <div class="h-64 relative">
            <div v-if="loading" class="h-full flex items-center justify-center text-gray-400">加载中...</div>
            <div v-else-if="!dailyStats?.length" class="h-full flex items-center justify-center text-gray-500">暂无数据</div>
            <div v-else class="h-full relative">
              <!-- Y轴坐标 -->
              <div class="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
                <div v-for="(tick, idx) in yAxisTicks" :key="idx" class="text-right pr-2">
                  {{ tick }}
                </div>
              </div>
              
              <!-- 图表区域 -->
              <div ref="chartContainer" class="ml-12 mr-2 h-full pb-8 relative" @mouseleave="hoveredIndex = null">
                <svg :width="chartWidth" :height="chartHeight" class="w-full h-full">
                  <!-- 网格线 -->
                  <g v-for="(tick, idx) in yAxisTicks" :key="`grid-${idx}`">
                    <line
                      :x1="0"
                      :y1="getYPosition(tick)"
                      :x2="chartWidth"
                      :y2="getYPosition(tick)"
                      stroke="rgba(255, 255, 255, 0.1)"
                      stroke-width="1"
                      stroke-dasharray="2,2"
                    />
                  </g>
                  
                  <!-- 折线 -->
                  <polyline
                    :points="linePoints"
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    stroke-width="2"
                    class="transition-all duration-300"
                  />
                  
                  <!-- 数据点 -->
                  <circle
                    v-for="(point, idx) in chartPoints"
                    :key="`point-${idx}`"
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="rgb(59, 130, 246)"
                    class="transition-all duration-300 cursor-pointer"
                    :class="{ 'r-6': hoveredIndex === idx }"
                    @mouseenter="hoveredIndex = idx"
                    @mouseleave="hoveredIndex = null"
                  />
                  
                  <!-- Hover 高亮线 -->
                  <line
                    v-if="hoveredIndex !== null"
                    :x1="chartPoints[hoveredIndex]?.x || 0"
                    :y1="0"
                    :x2="chartPoints[hoveredIndex]?.x || 0"
                    :y2="chartHeight"
                    stroke="rgba(255, 255, 255, 0.3)"
                    stroke-width="1"
                    stroke-dasharray="4,4"
                  />
                </svg>
                
                <!-- X轴日期标签 -->
                <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                  <div
                    v-for="(d, idx) in dailyStats"
                    :key="idx"
                    class="flex-1 text-center"
                    :class="{ 'font-semibold text-blue-400': hoveredIndex === idx }"
                  >
                    {{ formatDateLabel(d.date) }}
                  </div>
                </div>
                
                <!-- Hover Tooltip -->
                <div
                  v-if="hoveredIndex !== null && dailyStats[hoveredIndex]"
                  class="absolute bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none"
                  :style="{
                    left: `${chartPoints[hoveredIndex]?.x - 50}px`,
                    top: `${chartPoints[hoveredIndex]?.y - 60}px`,
                    transform: 'translateX(-50%)'
                  }"
                >
                  <div class="text-white text-sm font-semibold mb-1">
                    {{ formatDateLabel(dailyStats[hoveredIndex].date) }}
                  </div>
                  <div class="text-blue-400 text-xs">
                    {{ dailyStats[hoveredIndex].requests || 0 }} 次请求
                  </div>
                </div>
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
import { computed, onMounted, ref, watch, nextTick } from 'vue'
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
const hoveredIndex = ref(null)

// 图表尺寸（响应式）
const chartContainer = ref(null)
const chartWidth = ref(600)
const chartHeight = 200
const padding = { top: 10, right: 10, bottom: 30, left: 10 }


// Y轴刻度
const yAxisTicks = computed(() => {
  if (!dailyStats.value?.length) return []
  const values = dailyStats.value.map((d) => d.requests || 0)
  const max = Math.max(...values, 1)
  const ticks = []
  const tickCount = 5
  for (let i = 0; i <= tickCount; i++) {
    const value = Math.round((max / tickCount) * i)
    ticks.push(value)
  }
  return ticks.reverse()
})

// 计算Y轴位置
function getYPosition(value) {
  if (!dailyStats.value?.length) return 0
  const values = dailyStats.value.map((d) => d.requests || 0)
  const max = Math.max(...values, 1)
  const ratio = value / max
  return chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * ratio
}

// 计算折线图数据点
const chartPoints = computed(() => {
  if (!dailyStats.value?.length) return []
  const values = dailyStats.value.map((d) => d.requests || 0)
  const max = Math.max(...values, 1)
  const width = chartWidth - padding.left - padding.right
  const height = chartHeight - padding.top - padding.bottom
  const stepX = dailyStats.value.length > 1 ? width / (dailyStats.value.length - 1) : 0
  
  return dailyStats.value.map((d, idx) => {
    const x = padding.left + idx * stepX
    const ratio = (d.requests || 0) / max
    const y = padding.top + height - (height * ratio)
    return { x, y, value: d.requests || 0 }
  })
})

// 折线路径
const linePoints = computed(() => {
  return chartPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
})

// 格式化日期标签
function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length >= 2) {
    return `${parts[1]}-${parts[2]}`
  }
  return dateStr
}


function modelPercent(m) {
  const total = modelStats.value.reduce((sum, x) => sum + (x.requests || 0), 0) || 1
  return `${Math.min(100, Math.round(((m.requests || 0) / total) * 100))}%`
}

onMounted(() => {
  // 进入页面时立即加载数据
  statistics.fetchUsageStats(period.value || 'week')
  statistics.fetchUserApiKeys(true)
  
  // 监听容器尺寸变化
  nextTick(() => {
    if (chartContainer.value) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          chartWidth.value = entry.contentRect.width - 50 // 减去左右padding
        }
      })
      resizeObserver.observe(chartContainer.value)
    }
  })
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

