<template>
  <div class="tab-content">
    <div class="card p-4 sm:p-6">
      <div class="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100 sm:mb-2 sm:text-xl">
            套餐管理
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 sm:text-base">管理套餐配置和定价</p>
        </div>
        <button
          class="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium"
          @click="showCreateModal = true"
        >
          <i class="fas fa-plus"></i>
          创建套餐
        </button>
      </div>

      <!-- 套餐列表 -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="plans.length === 0" class="py-8 text-center text-gray-500">
        暂无套餐，点击"创建套餐"开始
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-3 flex items-start justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ plan.name }}
              </h4>
              <span
                :class="[
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                  plan.type === 'monthly'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                ]"
              >
                {{ plan.type === 'monthly' ? '月卡' : '计量' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="['h-2 w-2 rounded-full', plan.isActive ? 'bg-green-500' : 'bg-gray-400']"
              ></span>
              <span class="text-xs text-gray-500">
                {{ plan.isActive ? '启用' : '禁用' }}
              </span>
            </div>
          </div>

          <div class="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>价格：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                ¥{{ plan.price }}
              </span>
            </div>
            <div v-if="plan.type === 'monthly'" class="flex justify-between">
              <span>每日额度（显示）：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                ${{ plan.dailyLimitDisplay }}
              </span>
            </div>
            <div v-if="plan.type === 'monthly'" class="flex justify-between">
              <span>每日额度（实际）：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                ${{ plan.dailyLimitActual }}
              </span>
            </div>
            <div v-if="plan.type === 'monthly'" class="flex justify-between">
              <span>倍速：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                {{ plan.speedMultiplier }}x
              </span>
            </div>
            <div v-if="plan.type === 'usage'" class="flex justify-between">
              <span>总额度（显示）：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                ${{ plan.totalLimitDisplay }}
              </span>
            </div>
            <div v-if="plan.type === 'usage'" class="flex justify-between">
              <span>总额度（实际）：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                ${{ plan.totalLimitActual }}
              </span>
            </div>
            <div v-if="plan.type === 'usage'" class="flex justify-between">
              <span>倍速：</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                {{ plan.speedMultiplier }}x
              </span>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              class="flex-1 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              @click="editPlan(plan)"
            >
              编辑
            </button>
            <button
              class="flex-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              @click="deletePlan(plan.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑套餐模态框 -->
    <CreatePlanModal
      v-if="showCreateModal || editingPlan"
      :plan="editingPlan"
      @close="handleModalClose"
      @success="handlePlanSuccess"
    />

    <!-- 确认对话框 -->
    <ConfirmModal
      :cancel-text="confirmOptions.cancelText"
      :confirm-text="confirmOptions.confirmText"
      :message="confirmOptions.message"
      :show="showConfirmModal"
      :title="confirmOptions.title"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import CreatePlanModal from '@/components/plan/CreatePlanModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useConfirm } from '@/composables/useConfirm'

const { showConfirmModal, confirmOptions, showConfirm, handleConfirm, handleCancel } = useConfirm()

const loading = ref(false)
const plans = ref([])
const showCreateModal = ref(false)
const editingPlan = ref(null)

const loadPlans = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/admin/plans?includeInactive=true')
    if (response && response.success) {
      plans.value = response.data || []
    }
  } catch (error) {
    showToast('加载套餐列表失败', 'error')
    console.error('Failed to load plans:', error)
  } finally {
    loading.value = false
  }
}

const editPlan = (plan) => {
  editingPlan.value = plan
}

const deletePlan = async (planId) => {
  console.log('deletePlan called with planId:', planId)
  try {
    const confirmed = await showConfirm({
      title: '确认删除',
      message: '确定要删除这个套餐吗？此操作不可恢复。'
    })
    console.log('User confirmed:', confirmed)

    if (!confirmed) {
      console.log('User cancelled deletion')
      return
    }

    const response = await apiClient.delete(`/admin/plans/${planId}`)
    if (response && response.success) {
      showToast('套餐删除成功', 'success')
      await loadPlans()
    } else {
      showToast('删除套餐失败', 'error')
    }
  } catch (error) {
    showToast('删除套餐失败', 'error')
    console.error('Failed to delete plan:', error)
  }
}

const handleModalClose = () => {
  showCreateModal.value = false
  editingPlan.value = null
}

const handlePlanSuccess = () => {
  handleModalClose()
  loadPlans()
}

onMounted(() => {
  loadPlans()
})
</script>
