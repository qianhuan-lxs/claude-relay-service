<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">兑换码激活</h1>
        <router-link to="/dashboard" class="text-blue-600">返回仪表盘</router-link>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-10">
      <div class="bg-white border rounded-xl p-6 shadow-sm">
        <p class="text-gray-600 mb-4">请输入兑换码以获取您的 API Key。</p>
        <form @submit.prevent="onSubmit" class="flex gap-3">
          <input v-model="code" class="flex-1 border rounded-lg px-4 py-2" placeholder="输入兑换码" required />
          <button class="px-6 py-2 rounded-lg bg-blue-600 text-white" :disabled="loading">
            {{ loading ? '兑换中...' : '立即兑换' }}
          </button>
        </form>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
        <div v-if="apiKey" class="mt-6 bg-gray-50 border rounded-lg p-4">
          <div class="text-sm text-gray-600 mb-2">兑换成功，您的 API Key：</div>
          <div class="flex items-center gap-3">
            <code class="text-sm break-all">{{ apiKey }}</code>
            <button class="text-blue-600 text-sm" @click="copy(apiKey)">复制</button>
          </div>
          <p class="text-xs text-gray-500 mt-2">请妥善保存，出于安全考虑此密钥只显示一次。</p>
        </div>
      </div>
    </main>
  </div>
  
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/config/api'

const code = ref('')
const loading = ref(false)
const error = ref('')
const apiKey = ref('')

async function onSubmit() {
  error.value = ''
  apiKey.value = ''
  loading.value = true
  try {
    const res = await api.post('/client/auth/redeem', { code: code.value.trim() })
    if (res.data?.success) {
      apiKey.value = res.data.data?.apiKey || ''
      if (!apiKey.value) {
        error.value = '兑换成功，但未返回密钥。'
      }
    } else {
      error.value = res.data?.message || '兑换失败'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || '兑换失败'
  } finally {
    loading.value = false
  }
}

function copy(text) {
  navigator.clipboard?.writeText(text)
}
</script>

<style scoped>
</style>


