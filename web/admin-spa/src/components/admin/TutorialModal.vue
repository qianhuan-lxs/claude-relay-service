<template>
  <div v-if="show" class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-900/60">
    <div
      class="relative top-10 mx-auto w-full max-w-2xl rounded-lg bg-white shadow dark:bg-gray-800"
    >
      <div class="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ tutorial ? '编辑教程' : '创建教程' }}
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
            rows="10"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              分类
            </label>
            <input
              v-model.trim="form.category"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="如：快速开始、高级用法"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              排序顺序
            </label>
            <input
              v-model.number="form.sortOrder"
              class="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              min="0"
              type="number"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">数字越小越靠前</p>
          </div>
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
            {{ tutorial ? '更新' : '创建' }}
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
  tutorial: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const submitting = ref(false)
const form = reactive({
  title: '',
  content: '',
  category: '快速开始',
  sortOrder: 0,
  isActive: true
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.tutorial) {
      form.title = props.tutorial.title || ''
      form.content = props.tutorial.content || ''
      form.category = props.tutorial.category || '快速开始'
      form.sortOrder = props.tutorial.sortOrder || 0
      form.isActive = props.tutorial.isActive !== undefined ? props.tutorial.isActive : true
    } else if (newVal && !props.tutorial) {
      form.title = ''
      form.content = ''
      form.category = '快速开始'
      form.sortOrder = 0
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
    if (props.tutorial) {
      await apiClient.put(`/admin/tutorials/${props.tutorial.id}`, form)
      showToast('教程更新成功', 'success')
    } else {
      await apiClient.post('/admin/tutorials', form)
      showToast('教程创建成功', 'success')
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
