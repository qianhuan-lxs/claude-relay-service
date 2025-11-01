<template>
  <!-- 右下角浮动按钮 -->
  <button
    @click="showModal = true"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
    aria-label="联系客服"
  >
    <svg
      class="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      ></path>
    </svg>
  </button>

  <!-- 弹窗遮罩层 -->
  <div
    v-if="showModal"
    @click="showModal = false"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <!-- 弹窗内容 -->
    <div
      @click.stop
      class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/10 overflow-hidden transform transition-all duration-300"
    >
      <!-- 弹窗头部 -->
      <div class="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-white">联系客服</h3>
        <button
          @click="showModal = false"
          class="text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="关闭"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- 弹窗内容 -->
      <div class="p-6">
        <div class="text-center mb-4">
          <p class="text-gray-300 mb-6">扫描下方二维码添加QQ客服</p>
          
          <!-- 二维码图片 -->
          <div class="bg-white p-4 rounded-xl inline-block shadow-lg">
            <img
              :src="qrCodeUrl"
              alt="QQ客服二维码"
              class="w-64 h-64 object-contain rounded-lg"
              @error="handleImageError"
            />
          </div>
          
          <p class="text-gray-400 text-sm mt-6">扫码后请发送验证信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)

// public 目录下的文件会被直接复制到构建输出的根目录
// 使用字符串字面量，避免 Vite 在构建时尝试解析
const qrCodeUrl = '/image.png'

const handleImageError = (event) => {
  console.error('Failed to load QR code image:', event)
  event.target.style.display = 'none'
}
</script>

<style scoped>
/* 确保弹窗动画流畅 */
</style>

