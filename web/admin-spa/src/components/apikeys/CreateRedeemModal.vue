<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">创建兑换码</h3>
        <button
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          @click="$emit('close')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key 名称
          </label>
          <input
            v-model="form.name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="输入API Key名称"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            描述
          </label>
          <textarea
            v-model="form.description"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="输入描述（可选）"
            rows="2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            过期时间
          </label>
          <input
            v-model="form.expiresAt"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            type="datetime-local"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            备注
          </label>
          <input
            v-model="form.notes"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="输入备注（可选）"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            type="button"
            @click="$emit('close')"
          >
            取消
          </button>
          <button
            class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            :disabled="loading"
            type="submit"
          >
            {{ loading ? '创建中...' : '创建兑换码' }}
          </button>
        </div>
      </form>

      <!-- 成功显示兑换码 -->
      <div
        v-if="createdRedeem"
        class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
      >
        <h4 class="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
          兑换码创建成功！
        </h4>
        <div class="space-y-2">
          <div>
            <span class="text-xs text-green-600 dark:text-green-400">兑换码：</span>
            <code
              class="rounded bg-green-100 px-2 py-1 font-mono text-sm dark:bg-green-800 dark:text-green-200"
              >{{ createdRedeem.code }}</code
            >
          </div>
          <div>
            <span class="text-xs text-green-600 dark:text-green-400">API Key ID：</span>
            <span class="text-sm text-green-800 dark:text-green-200">{{
              createdRedeem.apiKeyId
            }}</span>
          </div>
        </div>
        <button
          class="mt-3 rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
          @click="copyToClipboard(createdRedeem.code)"
        >
          复制兑换码
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const createdRedeem = ref(null)

const form = reactive({
  name: '',
  description: '',
  expiresAt: '',
  notes: ''
})

const handleSubmit = async () => {
  loading.value = true
  createdRedeem.value = null // 重置状态
  try {
    const payload = {
      name: form.name,
      description: form.description,
      notes: form.notes
    }

    if (form.expiresAt) {
      payload.expiresAt = new Date(form.expiresAt).toISOString()
    }

    console.log('提交兑换码创建请求:', payload)
    const response = await apiClient.post('/admin/redeems', payload)
    console.log('兑换码创建响应:', response)
    console.log('响应数据:', response.data)

    if (response.data && response.data.success) {
      createdRedeem.value = response.data.data
      console.log('设置createdRedeem:', createdRedeem.value)
      showToast('兑换码创建成功！', 'success')
      emit('success', response.data.data)
    } else {
      console.error('API返回失败:', response.data)
      throw new Error(response.data?.message || '创建失败')
    }
  } catch (error) {
    console.error('创建兑换码失败:', error)
    console.error('错误详情:', error.response?.data)
    showToast(error.message || '创建兑换码失败', 'error')
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('兑换码已复制到剪贴板', 'success')
  } catch (error) {
    console.error('复制失败:', error)
    showToast('复制失败', 'error')
  }
}
</script>
