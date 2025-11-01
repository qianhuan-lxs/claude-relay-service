<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">教程管理</h1>
        <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">管理系统教程</p>
      </div>
      <div class="mt-4 space-x-3 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="loading"
          @click="showCreateModal = true"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 4v16m8-8H4"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
          创建教程
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="loading"
          @click="loadTutorials"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
          刷新
        </button>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">分类筛选：</label>
      <select
        v-model="categoryFilter"
        class="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        @change="loadTutorials"
      >
        <option value="">全部</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div v-if="loading" class="p-8 text-center">
        <svg class="mx-auto h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
      </div>

      <div v-else-if="filteredTutorials.length === 0" class="p-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">暂无教程</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              标题
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              分类
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              排序
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              状态
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              创建时间
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-for="tutorial in filteredTutorials" :key="tutorial.id">
            <td class="whitespace-nowrap px-6 py-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ tutorial.title }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ tutorial.category }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ tutorial.sortOrder }}
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="
                  tutorial.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                "
              >
                {{ tutorial.isActive ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(tutorial.createdAt) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                @click="editTutorial(tutorial)"
              >
                编辑
              </button>
              <button
                class="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                @click="confirmDelete(tutorial)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tutorial Modal -->
    <TutorialModal
      :show="showCreateModal || showEditModal"
      :tutorial="editingTutorial"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :confirm-class="'bg-red-600 hover:bg-red-700'"
      :confirm-text="'删除'"
      :message="`确定要删除教程「${deletingTutorial?.title}」吗？`"
      :show="showDeleteModal"
      :title="'确认删除'"
      @cancel="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import TutorialModal from '@/components/admin/TutorialModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const loading = ref(true)
const tutorials = ref([])
const categoryFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingTutorial = ref(null)
const deletingTutorial = ref(null)

const categories = computed(() => {
  const cats = new Set(tutorials.value.map((t) => t.category).filter(Boolean))
  return Array.from(cats).sort()
})

const filteredTutorials = computed(() => {
  let filtered = tutorials.value
  if (categoryFilter.value) {
    filtered = filtered.filter((t) => t.category === categoryFilter.value)
  }
  return filtered
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

async function loadTutorials() {
  loading.value = true
  try {
    const response = await apiClient.get('/admin/tutorials')
    if (response.success) {
      tutorials.value = response.data || []
    } else {
      tutorials.value = []
    }
  } catch (error) {
    showToast('加载教程失败', 'error')
    tutorials.value = []
  } finally {
    loading.value = false
  }
}

function editTutorial(tutorial) {
  editingTutorial.value = tutorial
  showEditModal.value = true
}

function confirmDelete(tutorial) {
  deletingTutorial.value = tutorial
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingTutorial.value) return

  try {
    await apiClient.delete(`/admin/tutorials/${deletingTutorial.value.id}`)
    showToast('删除成功', 'success')
    showDeleteModal.value = false
    deletingTutorial.value = null
    await loadTutorials()
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingTutorial.value = null
}

function handleSaved() {
  loadTutorials()
}

onMounted(() => {
  loadTutorials()
})
</script>
