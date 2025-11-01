<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">公告管理</h1>
        <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">管理系统公告</p>
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
          创建公告
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="loading"
          @click="loadAnnouncements"
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

      <div v-else-if="filteredAnnouncements.length === 0" class="p-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">暂无公告</p>
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
              类型
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
          <tr v-for="announcement in filteredAnnouncements" :key="announcement.id">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <span v-if="announcement.isPinned" class="mr-2 text-yellow-500">📌</span>
                <span
                  class="text-sm font-medium text-gray-900 dark:text-white"
                  :class="{ 'text-red-600 dark:text-red-400': announcement.type === 'important' }"
                >
                  {{ announcement.title }}
                </span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="
                  announcement.type === 'important'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                "
              >
                {{ announcement.type === 'important' ? '重要' : '普通' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="
                  announcement.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                "
              >
                {{ announcement.isActive ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(announcement.createdAt) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                @click="editAnnouncement(announcement)"
              >
                编辑
              </button>
              <button
                class="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                @click="confirmDelete(announcement)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Announcement Modal -->
    <AnnouncementModal
      :announcement="editingAnnouncement"
      :show="showCreateModal || showEditModal"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :confirm-class="'bg-red-600 hover:bg-red-700'"
      :confirm-text="'删除'"
      :message="`确定要删除公告「${deletingAnnouncement?.title}」吗？`"
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
import AnnouncementModal from '@/components/admin/AnnouncementModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const loading = ref(true)
const announcements = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingAnnouncement = ref(null)
const deletingAnnouncement = ref(null)

const filteredAnnouncements = computed(() => {
  return announcements.value
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

async function loadAnnouncements() {
  loading.value = true
  try {
    const response = await apiClient.get('/admin/announcements')
    if (response.success) {
      announcements.value = response.data || []
    } else {
      announcements.value = []
    }
  } catch (error) {
    showToast('加载公告失败', 'error')
    announcements.value = []
  } finally {
    loading.value = false
  }
}

function editAnnouncement(announcement) {
  editingAnnouncement.value = announcement
  showEditModal.value = true
}

function confirmDelete(announcement) {
  deletingAnnouncement.value = announcement
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingAnnouncement.value) return

  try {
    await apiClient.delete(`/admin/announcements/${deletingAnnouncement.value.id}`)
    showToast('删除成功', 'success')
    showDeleteModal.value = false
    deletingAnnouncement.value = null
    await loadAnnouncements()
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingAnnouncement.value = null
}

function handleSaved() {
  loadAnnouncements()
}

onMounted(() => {
  loadAnnouncements()
})
</script>
