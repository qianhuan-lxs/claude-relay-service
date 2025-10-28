<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md border rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-center mb-2">登录账户</h2>
      <p class="text-center text-gray-600 mb-6">欢迎回来，请登录您的账户</p>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block mb-1">用户名或邮箱</label>
          <input v-model="username" type="text" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block mb-1">密码</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="flex items-center justify-between text-sm">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="remember" />
            记住我
          </label>
          <a class="text-blue-600" href="#">忘记密码？</a>
        </div>
        <button class="w-full bg-blue-600 text-white py-2 rounded" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </form>
      <div class="text-center text-sm mt-4">
        还没有账户？
        <router-link to="/auth/register" class="text-blue-600">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const res = await auth.login({ username: username.value, password: password.value })
    if (res.success) {
      router.replace('/dashboard')
    } else {
      error.value = res.message || '登录失败'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>


