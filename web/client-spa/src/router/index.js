import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Statistics from '../views/Statistics.vue'
import Redeem from '../views/Redeem.vue'
import Tutorial from '../views/Tutorial.vue'

function isAuthenticated() {
  return !!localStorage.getItem('userToken')
}

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/auth/login', name: 'login', component: Login },
  { path: '/auth/register', name: 'register', component: Register },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/statistics', name: 'statistics', component: Statistics },
  { path: '/redeem', name: 'redeem', component: Redeem },
  { path: '/docs', name: 'tutorial', component: Tutorial }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const authed = isAuthenticated()
  // 未登录：允许访问首页和认证页；禁止访问需要登录的页面
  if (!authed && (to.name === 'dashboard' || to.name === 'statistics' || to.name === 'redeem')) {
    return { name: 'login' }
  }
  // 已登录：访问首页/登录/注册时跳转到仪表盘
  if (authed && (to.name === 'home' || to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }
})

export default router


