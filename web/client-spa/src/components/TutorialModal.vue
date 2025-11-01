<template>
  <div
    v-if="show && tutorial"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-white mb-1">{{ tutorial.title }}</h2>
          <p v-if="tutorial.category" class="text-sm text-gray-400">{{ tutorial.category }}</p>
        </div>
        <button
          @click="close"
          class="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="prose prose-invert max-w-none">
          <!-- 渲染 Markdown 内容 -->
          <div class="text-gray-200 whitespace-pre-wrap">{{ tutorial.content }}</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
        <p class="text-sm text-gray-400">
          {{ formatDate(tutorial.createdAt) }}
        </p>
        <button
          @click="close"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  tutorial: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

