<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-8">
      <svg class="mx-auto h-8 w-8 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
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
      <p class="mt-2 text-sm text-gray-400">加载中...</p>
    </div>

    <div v-else-if="announcements.length === 0" class="text-center py-8">
      <p class="text-gray-400">暂无公告</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="announcement in announcements"
        :key="announcement.id"
        class="bg-white/5 backdrop-blur-sm border rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        :class="
          announcement.type === 'important'
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-white/10'
        "
        @click="toggleExpand(announcement.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span v-if="announcement.isPinned" class="text-yellow-400">📌</span>
              <h3
                class="text-lg font-semibold"
                :class="
                  announcement.type === 'important'
                    ? 'text-red-400'
                    : 'text-white'
                "
              >
                {{ announcement.title }}
              </h3>
              <span
                v-if="announcement.type === 'important'"
                class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400"
              >
                重要
              </span>
            </div>
            <p
              v-if="!expandedItems[announcement.id]"
              class="text-sm text-gray-300 line-clamp-2"
            >
              {{ announcement.content }}
            </p>
            <div
              v-else
              class="text-sm text-gray-300 prose prose-invert max-w-none"
              v-html="formatContent(announcement.content)"
            />
            <p class="text-xs text-gray-500 mt-2">
              {{ formatDate(announcement.createdAt) }}
            </p>
          </div>
          <button
            class="ml-4 text-gray-400 hover:text-white transition-colors"
            @click.stop="toggleExpand(announcement.id)"
          >
            <svg
              class="w-5 h-5 transform transition-transform"
              :class="{ 'rotate-180': expandedItems[announcement.id] }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContentStore } from '@/stores/content'

const contentStore = useContentStore()
const expandedItems = ref({})

const loading = computed(() => contentStore.loadingAnnouncements)
const announcements = computed(() => contentStore.announcements)

function toggleExpand(id) {
  expandedItems.value[id] = !expandedItems.value[id]
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatContent(content) {
  if (!content) return ''
  // 简单的 Markdown 转 HTML（只处理基本格式）
  let html = content
  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>')
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
  // 斜体
  html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
  // 代码块
  html = html.replace(/```([^`]+)```/gim, '<pre class="bg-gray-800 p-2 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>')
  // 行内代码
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm">$1</code>')
  // 换行
  html = html.replace(/\n/gim, '<br />')
  return html
}

onMounted(() => {
  if (announcements.value.length === 0) {
    contentStore.fetchAnnouncements()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

