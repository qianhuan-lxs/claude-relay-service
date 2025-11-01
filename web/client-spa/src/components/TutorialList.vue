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

    <div v-else-if="groupedTutorials.length === 0" class="text-center py-8">
      <p class="text-gray-400">暂无教程</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="group in groupedTutorials" :key="group.category" class="space-y-3">
        <h3 class="text-lg font-semibold text-white border-b border-white/10 pb-2">
          {{ group.category }}
        </h3>
        <div class="space-y-2">
          <div
            v-for="tutorial in group.tutorials"
            :key="tutorial.id"
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
            @click="openTutorial(tutorial)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-base font-medium text-white mb-2">
                  {{ tutorial.title }}
                </h4>
                <p class="text-sm text-gray-300 line-clamp-2">
                  {{ getPreview(tutorial.content) }}
                </p>
              </div>
              <svg
                class="w-5 h-5 text-gray-400 ml-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tutorial Modal -->
    <TutorialModal :show="showModal" :tutorial="selectedTutorial" @close="closeModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useContentStore } from '@/stores/content'
import TutorialModal from './TutorialModal.vue'

const contentStore = useContentStore()

const loading = computed(() => contentStore.loadingTutorials)
const tutorials = computed(() => contentStore.tutorials)
const showModal = ref(false)
const selectedTutorial = ref(null)

const groupedTutorials = computed(() => {
  const groups = {}
  tutorials.value.forEach((tutorial) => {
    const category = tutorial.category || '其他'
    if (!groups[category]) {
      groups[category] = {
        category,
        tutorials: []
      }
    }
    groups[category].tutorials.push(tutorial)
  })
  // 按 sortOrder 排序每个分类内的教程
  Object.values(groups).forEach((group) => {
    group.tutorials.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  })
  return Object.values(groups).sort((a, b) => a.category.localeCompare(b.category))
})

function getPreview(content) {
  if (!content) return ''
  // 移除 Markdown 语法，提取纯文本
  let text = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接标记
    .replace(/`([^`]+)`/g, '$1') // 移除行内代码标记
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

function openTutorial(tutorial) {
  selectedTutorial.value = tutorial
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTutorial.value = null
}

onMounted(() => {
  if (tutorials.value.length === 0) {
    contentStore.fetchTutorials()
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

