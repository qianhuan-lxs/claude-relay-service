<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Navigation -->
    <nav class="relative z-50 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">C</span>
          </div>
          <span class="text-white text-xl font-bold">Code</span>
        </div>
        <div class="hidden md:flex items-center space-x-8">
          <a href="#features" class="text-gray-300 hover:text-white transition-colors">功能</a>
          <a href="#pricing" class="text-gray-300 hover:text-white transition-colors">定价</a>
          <a href="#docs" class="text-gray-300 hover:text-white transition-colors">文档</a>
        </div>
        <div class="flex items-center space-x-4">
          <router-link to="/auth/login" class="text-gray-300 hover:text-white transition-colors">登录</router-link>
          <router-link to="/auth/register" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            开始使用
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="relative">
      <!-- Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div class="text-center">
          <!-- Main Heading -->
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI编程
            </span>
            <br>
            <span class="text-white">新时代</span>
          </h1>
          
          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            为开发者提供强大的AI编程助手，提升开发效率，释放创意潜能
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <router-link to="/auth/register" class="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <span class="relative z-10">开始使用</span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </router-link>
            <a href="#features" class="px-8 py-4 border-2 border-gray-400 text-gray-300 rounded-xl font-semibold text-lg hover:border-white hover:text-white transition-all duration-300">
              了解更多
            </a>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div class="text-gray-400">活跃开发者</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div class="text-gray-400">服务可用性</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div class="text-gray-400">技术支持</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section id="features" class="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">为什么选择我们</h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">三大核心优势，助力您的AI开发之旅</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">智能高效</h3>
            <p class="text-gray-300 leading-relaxed">AI驱动的代码生成和优化，大幅提升开发效率，让复杂的编程任务变得简单直观</p>
          </div>

          <!-- Feature 2 -->
          <div class="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">安全可靠</h3>
            <p class="text-gray-300 leading-relaxed">企业级安全标准，端到端加密保护，确保您的代码和数据安全，让开发无后顾之忧</p>
          </div>

          <!-- Feature 3 -->
          <div class="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">灵活易用</h3>
            <p class="text-gray-300 leading-relaxed">支持多种编程语言和框架，提供丰富的API接口，轻松集成到现有开发流程中</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-12 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center space-x-2 mb-4 md:mb-0">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">C</span>
            </div>
            <span class="text-white text-xl font-bold">Code</span>
          </div>
          <div class="text-gray-400 text-sm">
            © 2025 Code. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e2e;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text animation */
.gradient-text {
  background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Button pulse effect */
.btn-pulse {
  position: relative;
  overflow: hidden;
}

.btn-pulse::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-pulse:hover::before {
  left: 100%;
}
</style>


