<template>
  <div v-if="show" class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-900/60">
    <div
      class="relative top-10 mx-auto w-full max-w-xl rounded-lg bg-white shadow dark:bg-gray-800"
    >
      <div class="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">创建用户</h3>
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

      <form class="space-y-4 px-6 py-5" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >用户名</label
            >
            <input
              v-model.trim="form.username"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="必填"
              required
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >显示名称</label
            >
            <input
              v-model.trim="form.displayName"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >邮箱</label
            >
            <input
              v-model.trim="form.email"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="可选"
              type="email"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >名</label
            >
            <input
              v-model.trim="form.firstName"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >姓</label
            >
            <input
              v-model.trim="form.lastName"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >角色</label
            >
            <select
              v-model="form.role"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <input
              id="active"
              v-model="form.isActive"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              type="checkbox"
            />
            <label class="text-sm text-gray-700 dark:text-gray-300" for="active">启用</label>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <button
            class="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            type="button"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
            :disabled="submitting"
            type="submit"
          >
            <svg
              v-if="submitting"
              class="-ml-1 mr-2 h-4 w-4 animate-spin"
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
              />
              <path
                class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                fill="currentColor"
              />
            </svg>
            创建
          </button>
        </div>
      </form>
    </div>
  </div>
  <div v-else />
</template>

<script setup>
import { reactive, ref } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'created'])

const submitting = ref(false)
const form = reactive({
  username: '',
  displayName: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'user',
  isActive: true
})

async function handleSubmit() {
  if (!form.username) {
    showToast('用户名为必填项', 'error')
    return
  }
  submitting.value = true
  try {
    const res = await apiClient.post('/users', { ...form })
    if (res && res.success) {
      showToast('用户创建成功', 'success')
      emit('created', res.user)
      emit('close')
    } else {
      showToast(res?.message || '创建失败', 'error')
    }
  } catch (e) {
    showToast(e?.response?.data?.message || e.message || '创建失败', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped></style>
