<template>
  <div class="tab-content">
    <div class="card p-4 sm:p-6">
      <div class="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100 sm:mb-2 sm:text-xl">
            订单管理
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 sm:text-base">管理和激活用户订单</p>
        </div>

        <div class="flex gap-2">
          <!-- 创建订单按钮 -->
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            @click="showCreateModal = true"
          >
            创建订单
          </button>

          <!-- 状态筛选 -->
          <button
            v-for="status in statusOptions"
            :key="status.value"
            :class="[
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              selectedStatus === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
            @click="handleStatusChange(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- 订单列表 -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="orders.length === 0" class="py-8 text-center text-gray-500">暂无订单</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                订单ID
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                用户
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                套餐
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                价格
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                状态
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                创建时间
              </th>
              <th
                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {{ order.id.substring(0, 8) }}...
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ order.userUsername || order.userId }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ order.planName }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">¥{{ order.price }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-block rounded-full px-2 py-1 text-xs font-medium',
                    getStatusClass(order.status)
                  ]"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    v-if="order.status === 'pending'"
                    class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    :disabled="activatingOrderId === order.id"
                    @click="activateOrder(order.id)"
                  >
                    {{ activatingOrderId === order.id ? '激活中...' : '激活' }}
                  </button>
                  <button
                    v-if="order.status === 'pending' || order.status === 'expired'"
                    class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    :disabled="deletingOrderId === order.id"
                    @click="deleteOrder(order.id)"
                  >
                    {{ deletingOrderId === order.id ? '删除中...' : '删除' }}
                  </button>
                  <span v-if="order.status === 'activated'" class="text-xs text-gray-500">
                    API Key: {{ order.apiKeyId ? order.apiKeyId.substring(0, 8) + '...' : '-' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建订单模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">创建订单</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              用户邮箱
            </label>
            <input
              v-model="createForm.userEmail"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="请输入用户邮箱"
              type="email"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              套餐
            </label>
            <select
              v-model="createForm.planId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">请选择套餐</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.name }} - ¥{{ plan.price }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button
            class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="showCreateModal = false"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="creatingOrder"
            @click="handleCreateOrder"
          >
            {{ creatingOrder ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

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
import { useConfirm } from '@/composables/useConfirm'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const { showConfirmModal, confirmOptions, showConfirm, handleConfirm, handleCancel } = useConfirm()

const loading = ref(false)
const orders = ref([])
const selectedStatus = ref(null)
const activatingOrderId = ref(null)
const deletingOrderId = ref(null)
const showCreateModal = ref(false)
const createForm = ref({
  userEmail: '',
  planId: ''
})
const plans = ref([])
const creatingOrder = ref(false)

const statusOptions = [
  { label: '全部', value: null },
  { label: '待激活', value: 'pending' },
  { label: '已激活', value: 'activated' },
  { label: '已过期', value: 'expired' }
]

const handleStatusChange = (status) => {
  selectedStatus.value = status
  loadOrders()
}

const loadOrders = async () => {
  loading.value = true
  try {
    const url = selectedStatus.value
      ? `/admin/orders?status=${selectedStatus.value}`
      : '/admin/orders'
    const response = await apiClient.get(url)
    if (response && response.success) {
      orders.value = response.data || []
    }
  } catch (error) {
    showToast('加载订单列表失败', 'error')
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
  }
}

const activateOrder = async (orderId) => {
  const confirmed = await showConfirm('确认激活', '确定要激活这个订单吗？这将为用户生成 API Key。')

  if (!confirmed) return

  activatingOrderId.value = orderId
  try {
    const response = await apiClient.put(`/admin/orders/${orderId}/activate`)
    if (response && response.success) {
      showToast('订单激活成功', 'success')
      await loadOrders()
    } else {
      throw new Error(response?.error || '激活失败')
    }
  } catch (error) {
    showToast(error.message || '激活订单失败', 'error')
    console.error('Failed to activate order:', error)
  } finally {
    activatingOrderId.value = null
  }
}

const deleteOrder = async (orderId) => {
  const confirmed = await showConfirm('确认删除', '确定要删除这个订单吗？此操作不可恢复。')

  if (!confirmed) return

  deletingOrderId.value = orderId
  try {
    const response = await apiClient.delete(`/admin/orders/${orderId}`)
    if (response && response.success) {
      showToast('订单删除成功', 'success')
      await loadOrders()
    } else {
      throw new Error(response?.error || '删除失败')
    }
  } catch (error) {
    showToast(error.message || '删除订单失败', 'error')
    console.error('Failed to delete order:', error)
  } finally {
    deletingOrderId.value = null
  }
}

const loadPlans = async () => {
  try {
    const response = await apiClient.get('/plans?includeInactive=true')
    if (response && response.success) {
      plans.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load plans:', error)
  }
}

const handleCreateOrder = async () => {
  if (!createForm.value.userEmail || !createForm.value.planId) {
    showToast('请填写用户邮箱和选择套餐', 'error')
    return
  }

  creatingOrder.value = true
  try {
    const response = await apiClient.post('/admin/orders', {
      userEmail: createForm.value.userEmail,
      planId: createForm.value.planId
    })
    if (response && response.success) {
      showToast('订单创建成功', 'success')
      showCreateModal.value = false
      createForm.value = { userEmail: '', planId: '' }
      await loadOrders()
    } else {
      throw new Error(response?.error || '创建失败')
    }
  } catch (error) {
    showToast(error.message || '创建订单失败', 'error')
    console.error('Failed to create order:', error)
  } finally {
    creatingOrder.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待激活',
    activated: '已激活',
    expired: '已过期'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    activated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadOrders()
  loadPlans()
})
</script>
