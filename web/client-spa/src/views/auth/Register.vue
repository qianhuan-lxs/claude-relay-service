<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md border rounded-lg p-6 shadow-sm">
      <h2 class="text-2xl font-bold text-center mb-2">创建账户</h2>
      <p class="text-center text-gray-600 mb-6">注册并开始使用我们的服务</p>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block mb-1">用户名</label>
          <input v-model="username" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block mb-1">邮箱地址</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block mb-1">密码</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
          <ul class="text-xs text-gray-500 mt-2 space-y-1">
            <li>至少8个字符</li>
            <li>包含大写字母</li>
            <li>包含小写字母</li>
            <li>包含数字</li>
          </ul>
        </div>
        <div>
          <label class="block mb-1">确认密码</label>
          <input v-model="confirm" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <button class="w-full bg-blue-600 text-white py-2 rounded" :disabled="!canSubmit || loading">{{ loading ? '创建中...' : '创建账户' }}</button>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </form>
      <div class="text-center text-sm mt-4">
        已有账户？
        <router-link to="/auth/login" class="text-blue-600">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')

const canSubmit = computed(() => password.value.length >= 8 && password.value === confirm.value)
const loading = ref(false)
const error = ref('')
const auth = useAuthStore()

async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await auth.register({ username: username.value, email: email.value, password: password.value })
    if (res.success) {
      // auto login after registration
      const loginRes = await auth.login({ username: username.value, password: password.value })
      if (loginRes.success) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/login')
      }
    } else {
      error.value = res.message || '注册失败'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>


