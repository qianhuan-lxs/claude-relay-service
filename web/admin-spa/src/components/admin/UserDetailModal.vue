<template>
  <div v-if="show" class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-900/60">
    <div
      class="relative top-8 mx-auto w-11/12 max-w-5xl rounded-lg bg-white shadow dark:bg-gray-800"
    >
      <div class="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">用户详情</h3>
          <p v-if="user" class="text-xs text-gray-500 dark:text-gray-400">
            @{{ user.username }} · {{ user.role }}
          </p>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <div class="px-6 py-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              昵称：{{ detail?.user?.displayName || '-' }}
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              邮箱：{{ detail?.user?.email || '-' }}
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              状态：
              <span :class="detail?.user?.isActive ? 'text-green-600' : 'text-red-500'">{{
                detail?.user?.isActive ? '启用' : '禁用'
              }}</span>
            </div>
          </div>
        </div>

        <div class="border-b dark:border-gray-700">
          <nav aria-label="Tabs" class="-mb-px flex space-x-6">
            <button :class="tabClass('keys')" @click="activeTab = 'keys'">API Keys</button>
            <button :class="tabClass('redeems')" @click="activeTab = 'redeems'">兑换码</button>
            <button :class="tabClass('usage')" @click="activeTab = 'usage'">使用统计</button>
          </nav>
        </div>

        <div class="pt-4">
          <!-- Keys -->
          <div v-if="activeTab === 'keys'">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      名称
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      请求数
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Tokens (令牌数)
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      总消费
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      状态
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      创建时间
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="k in detailKeys" :key="k.id">
                    <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                      {{ k.name }}
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ formatNumber(k.usage?.requests || 0) }}
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ formatNumber((k.usage?.inputTokens || 0) + (k.usage?.outputTokens || 0)) }}
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      ${{ (k.usage?.totalCost || 0).toFixed(4) }}
                    </td>
                    <td class="px-4 py-2 text-sm">
                      <span :class="k.isActive ? 'text-green-500' : 'text-red-500'">
                        {{ k.isActive ? '活跃' : '禁用' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ formatDate(k.createdAt) }}
                    </td>
                  </tr>
                  <tr v-if="detailKeys.length === 0">
                    <td class="px-4 py-6 text-center text-sm text-gray-500" colspan="6">
                      暂无 API Keys
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Redeems -->
          <div v-else-if="activeTab === 'redeems'">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      兑换码
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      状态
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      关联 Key
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      创建/激活时间
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="r in redeems" :key="r.code">
                    <td class="px-4 py-2 font-mono text-sm text-gray-800 dark:text-gray-200">
                      {{ r.code }}
                    </td>
                    <td class="px-4 py-2 text-sm">
                      <span
                        :class="
                          r.status === 'used'
                            ? 'text-green-600'
                            : r.status === 'unused'
                              ? 'text-gray-500'
                              : 'text-yellow-600'
                        "
                      >
                        {{
                          r.status === 'used'
                            ? '已使用'
                            : r.status === 'unused'
                              ? '未使用'
                              : r.status === 'expired'
                                ? '已过期'
                                : r.status
                        }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ r.apiKeyName || r.apiKeyId || '-' }}
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                      {{ formatDate(r.activatedAt || r.createdAt) }}
                    </td>
                  </tr>
                  <tr v-if="redeems.length === 0">
                    <td class="px-4 py-6 text-center text-sm text-gray-500" colspan="4">
                      暂无兑换码
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Usage -->
          <div v-else>
            <div class="space-y-6">
              <!-- Period Selector -->
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">使用统计</h4>
                <select
                  v-model="selectedPeriod"
                  class="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  @change="loadUsageStats"
                >
                  <option value="day">最近 24 小时</option>
                  <option value="week">最近 7 天</option>
                  <option value="month">最近 30 天</option>
                  <option value="quarter">最近 90 天</option>
                </select>
              </div>

              <!-- Loading State -->
              <div v-if="loadingStats" class="py-8 text-center">
                <svg
                  class="mx-auto h-8 w-8 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
              </div>

              <!-- Stats Cards -->
              <div v-else-if="usageStats" class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="text-sm text-gray-600 dark:text-gray-400">总请求数</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ formatNumber(usageStats.totalRequests || 0) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="text-sm text-gray-600 dark:text-gray-400">输入 Tokens</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ formatNumber(usageStats.totalInputTokens || 0) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="text-sm text-gray-600 dark:text-gray-400">输出 Tokens</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ formatNumber(usageStats.totalOutputTokens || 0) }}
                  </div>
                </div>
                <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div class="text-sm text-gray-600 dark:text-gray-400">总消费</div>
                  <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    ${{ (usageStats.totalCost || 0).toFixed(4) }}
                  </div>
                </div>
              </div>

              <!-- No Data -->
              <div v-else class="py-8 text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400">暂无使用数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object, default: null }
})
const emit = defineEmits(['close'])

const activeTab = ref('keys')
const detail = ref(null)
const redeems = ref([])
const loadingStats = ref(false)
const usageStats = ref(null)
const selectedPeriod = ref('week')

const detailKeys = computed(() => detail.value?.user?.apiKeys || [])

function tabClass(tab) {
  return [
    'border-b-2 px-3 py-2 text-sm font-medium',
    activeTab.value === tab
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
  ]
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n || 0)
}

function formatDate(s) {
  if (!s) return '-'
  try {
    return new Date(s).toLocaleString()
  } catch {
    return '-'
  }
}

async function loadDetail() {
  if (!props.user?.id) return
  try {
    const [u, r] = await Promise.all([
      apiClient.get(`/users/${props.user.id}`),
      apiClient.get(`/users/${props.user.id}/redeems`)
    ])
    if (u?.success) detail.value = u
    if (r?.success) redeems.value = r.redeems || r.data || []
  } catch (e) {
    showToast('加载用户详情失败', 'error')
  }
}

async function loadUsageStats() {
  if (!props.user?.id) return
  loadingStats.value = true
  try {
    const response = await apiClient.get(`/users/${props.user.id}/usage-stats`, {
      params: { period: selectedPeriod.value }
    })
    if (response?.success) {
      usageStats.value = response.stats
    }
  } catch (e) {
    console.error('Failed to load usage stats:', e)
    showToast('加载使用统计失败', 'error')
  } finally {
    loadingStats.value = false
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      activeTab.value = 'keys'
      loadDetail()
      if (activeTab.value === 'usage') {
        loadUsageStats()
      }
    }
  }
)

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'usage' && props.show) {
      loadUsageStats()
    }
  }
)

onMounted(() => {
  if (props.show) {
    loadDetail()
    if (activeTab.value === 'usage') {
      loadUsageStats()
    }
  }
})
</script>

<style scoped></style>
