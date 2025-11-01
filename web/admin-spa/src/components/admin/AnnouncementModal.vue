<template>
  <div v-if="show" class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-900/60">
    <div
      class="relative top-10 mx-auto w-full max-w-2xl rounded-lg bg-white shadow dark:bg-gray-800"
    >
      <div class="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ announcement ? '编辑公告' : '创建公告' }}
        </h3>
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
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            标题 <span class="text-red-500">*</span>
          </label>
          <input
            v-model.trim="form.title"
            class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="请输入标题"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            内容 <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model.trim="form.content"
            class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="请输入内容（支持Markdown）"
            required
            rows="8"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              类型
            </label>
            <select
              v-model="form.type"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="normal">普通</option>
              <option value="important">重要</option>
            </select>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <input
              id="isPinned"
              v-model="form.isPinned"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              type="checkbox"
            />
            <label class="text-sm text-gray-700 dark:text-gray-300" for="isPinned">置顶</label>
          </div>

          <div class="flex items-center space-x-2">
            <input
              id="isActive"
              v-model="form.isActive"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              type="checkbox"
            />
            <label class="text-sm text-gray-700 dark:text-gray-300" for="isActive">启用</label>
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
            {{ announcement ? '更新' : '创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <div v-else />
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const props = defineProps({
  show: { type: Boolean, default: false },
  announcement: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const submitting = ref(false)
const form = reactive({
  title: '',
  content: '',
  type: 'normal',
  isPinned: false,
  isActive: true
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.announcement) {
      form.title = props.announcement.title || ''
      form.content = props.announcement.content || ''
      form.type = props.announcement.type || 'normal'
      form.isPinned = props.announcement.isPinned || false
      form.isActive = props.announcement.isActive !== undefined ? props.announcement.isActive : true
    } else if (newVal && !props.announcement) {
      form.title = ''
      form.content = ''
      form.type = 'normal'
      form.isPinned = false
      form.isActive = true
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  if (!form.title || !form.content) {
    showToast('标题和内容不能为空', 'error')
    return
  }

  submitting.value = true
  try {
    if (props.announcement) {
      await apiClient.put(`/admin/announcements/${props.announcement.id}`, form)
      showToast('公告更新成功', 'success')
    } else {
      await apiClient.post('/admin/announcements', form)
      showToast('公告创建成功', 'success')
    }
    emit('saved')
    emit('close')
  } catch (error) {
    showToast(error.response?.data?.message || '操作失败', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
