<template>
  <header class="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">C</span>
          </div>
          <span class="ml-2 text-xl font-bold text-white">Code</span>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center space-x-1">
          <router-link
            to="/dashboard"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="isActive('/dashboard') 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'"
          >
            仪表盘
          </router-link>
          <router-link
            to="/statistics"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="isActive('/statistics') 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'"
          >
            使用统计
          </router-link>
          <router-link
            to="/plans"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative"
            :class="isActive('/plans') 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'"
          >
            <span class="relative">
              限时优惠
              <span v-if="!isActive('/plans')" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </span>
          </router-link>
          <router-link
            to="/redeem"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="isActive('/redeem') 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'"
          >
            兑换订阅
          </router-link>
          <router-link
            to="/docs"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="isActive('/docs') 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'"
          >
            使用教程
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="relative" ref="userMenuRef">
          <button
            @click="toggleUserMenu"
            class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
          >
            <!-- Avatar -->
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {{ userInitial }}
            </div>
            <!-- Username -->
            <span class="text-white font-medium text-sm hidden sm:block">{{ displayName }}</span>
            <!-- Dropdown Icon -->
            <svg
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': showUserMenu }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showUserMenu"
            ref="dropdownRef"
            class="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-slate-700">
              <p class="text-sm font-medium text-white">{{ displayName }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ userEmail }}</p>
            </div>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div class="md:hidden border-t border-slate-700/50">
      <nav class="flex items-center justify-around px-4 py-2">
        <router-link
          to="/dashboard"
          class="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="isActive('/dashboard') 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' 
            : 'text-gray-400'"
        >
          仪表盘
        </router-link>
        <router-link
          to="/statistics"
          class="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="isActive('/statistics') 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' 
            : 'text-gray-400'"
        >
          使用统计
        </router-link>
        <router-link
          to="/redeem"
          class="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="isActive('/redeem') 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' 
            : 'text-gray-400'"
        >
          兑换订阅
        </router-link>
        <router-link
          to="/docs"
          class="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="isActive('/docs') 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white' 
            : 'text-gray-400'"
        >
          使用教程
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const dropdownRef = ref(null)
const userMenuRef = ref(null)

const displayName = computed(() => {
  return authStore.user?.username || '用户'
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const userInitial = computed(() => {
  const name = displayName.value
  return name.charAt(0).toUpperCase()
})

function isActive(path) {
  return route.path === path
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('登出失败:', error)
    // 即使登出失败，也清除本地状态并跳转
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    router.push('/auth/login')
  }
  closeUserMenu()
}
</script>

<style scoped>
/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

