/**
 * 简单的 Toast 通知工具
 */
export function showToast(message, type = 'info') {
  // 创建 toast 元素
  const toast = document.createElement('div')
  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
        ? 'bg-red-500'
        : type === 'warning'
          ? 'bg-yellow-500'
          : 'bg-blue-500'

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0`
  toast.textContent = message

  // 添加到页面
  document.body.appendChild(toast)

  // 3秒后自动移除
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)'
    toast.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

