<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
    <AppNavbar />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-block mb-4">
          <span class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full animate-pulse">
            🔥 限时优惠
          </span>
        </div>
        <h1 class="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          选择您的套餐
        </h1>
        <p class="text-gray-400 text-lg">选择适合您的套餐，开启 AI 之旅</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading || plansLoading" class="flex justify-center items-center py-20">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || plansStore.error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
        <p class="text-red-400">{{ error || plansStore.error }}</p>
      </div>

      <!-- Plans Content -->
      <div v-else class="space-y-16">
        <!-- Monthly Plans Section -->
        <div v-if="monthlyPlans.length > 0">
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-white">月卡套餐</h2>
            </div>
            <p class="text-gray-400">固定时长，每日额度，适合长期使用</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(plan, index) in monthlyPlans"
              :key="plan.id"
              class="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- Popular Badge -->
              <div v-if="index === 1" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg">
                  最受欢迎
                </span>
              </div>

              <!-- Glow Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <!-- Content -->
              <div class="relative z-10">
                <!-- Plan Header -->
                <div class="mb-6">
                  <h3 class="text-2xl font-bold text-white mb-2">{{ plan.name }}</h3>
                  <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">¥{{ plan.price }}</span>
                    <span class="text-gray-400 text-sm">/{{ plan.duration }}天</span>
                  </div>
                </div>

                <!-- Features -->
                <div class="space-y-4 mb-8">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">每日额度 <span class="text-white font-semibold">${{ plan.dailyLimitDisplay }}</span></span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">有效期 <span class="text-white font-semibold">{{ plan.duration }} 天</span></span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">无限次调用</span>
                  </div>
                </div>

                <!-- Description -->
                <div v-if="plan.description" class="mb-6">
                  <p class="text-sm text-gray-400 leading-relaxed">{{ plan.description }}</p>
                </div>

                <!-- Buy Button -->
                <button
                  class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  :disabled="creatingOrder === plan.id"
                  @click="handleBuyPlan(plan)"
                >
                  <span v-if="creatingOrder === plan.id" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建订单中...
                  </span>
                  <span v-else>立即购买</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Plans Section -->
        <div v-if="usagePlans.length > 0">
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-white">计量套餐</h2>
            </div>
            <p class="text-gray-400">按需付费，灵活使用，用完为止</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(plan, index) in usagePlans"
              :key="plan.id"
              class="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- Glow Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <!-- Content -->
              <div class="relative z-10">
                <!-- Plan Header -->
                <div class="mb-6">
                  <h3 class="text-2xl font-bold text-white mb-2">{{ plan.name }}</h3>
                  <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">¥{{ plan.price }}</span>
                  </div>
                </div>

                <!-- Features -->
                <div class="space-y-4 mb-8">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">总额度 <span class="text-white font-semibold">${{ plan.totalLimitDisplay }}</span></span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">按需扣费</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span class="text-gray-300">永久有效</span>
                  </div>
                </div>

                <!-- Description -->
                <div v-if="plan.description" class="mb-6">
                  <p class="text-sm text-gray-400 leading-relaxed">{{ plan.description }}</p>
                </div>

                <!-- Buy Button -->
                <button
                  class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  :disabled="creatingOrder === plan.id"
                  @click="handleBuyPlan(plan)"
                >
                  <span v-if="creatingOrder === plan.id" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    创建订单中...
                  </span>
                  <span v-else>立即购买</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && plans.length === 0" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-gray-400 text-lg">暂无可用套餐</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlansStore } from '@/stores/plans'
import { showToast } from '@/utils/toast'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()
const plansStore = usePlansStore()

const loading = ref(false)
const error = ref(null)
const creatingOrder = ref(null)

const plans = computed(() => plansStore.plans)
const plansLoading = computed(() => plansStore.loading)

const monthlyPlans = computed(() => {
  return plans.value.filter(plan => plan.type === 'monthly')
})

const usagePlans = computed(() => {
  return plans.value.filter(plan => plan.type === 'usage')
})

const handleBuyPlan = async (plan) => {
  if (!plan.xianyuLink) {
    showToast('该套餐暂未配置购买链接', 'error')
    return
  }

  creatingOrder.value = plan.id
  try {
    // 创建订单
    const order = await plansStore.createOrder(plan.id)

    if (order && order.id) {
      showToast('订单创建成功，正在跳转到购买页面...', 'success')
      // 跳转到闲鱼链接
      window.open(plan.xianyuLink, '_blank')
      // 刷新订单列表
      await plansStore.fetchUserOrders()
    }
  } catch (err) {
    showToast(err.message || '创建订单失败', 'error')
  } finally {
    creatingOrder.value = null
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await plansStore.fetchPlans()
  } catch (err) {
    error.value = err?.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group {
  animation: fadeInUp 0.6s ease-out both;
}
</style>
