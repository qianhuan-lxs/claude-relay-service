import { ref } from 'vue'

const showConfirmModal = ref(false)
const confirmOptions = ref({
  title: '',
  message: '',
  confirmText: '继续',
  cancelText: '取消'
})
const confirmResolve = ref(null)

export function useConfirm() {
  const showConfirm = (titleOrOptions, message, confirmText = '继续', cancelText = '取消') => {
    return new Promise((resolve) => {
      // 支持对象参数和独立参数两种调用方式
      let title, msg, confirm, cancel
      if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
        // 对象参数形式：{ title, message, confirmText, cancelText }
        title = titleOrOptions.title || ''
        msg = titleOrOptions.message || ''
        confirm = titleOrOptions.confirmText || '继续'
        cancel = titleOrOptions.cancelText || '取消'
      } else {
        // 独立参数形式：showConfirm(title, message, confirmText, cancelText)
        title = titleOrOptions || ''
        msg = message || ''
        confirm = confirmText
        cancel = cancelText
      }

      console.log('showConfirm called:', { title, msg, confirm, cancel })
      confirmOptions.value = {
        title,
        message: msg,
        confirmText: confirm,
        cancelText: cancel
      }
      confirmResolve.value = resolve
      showConfirmModal.value = true
      console.log('showConfirmModal set to:', showConfirmModal.value)
    })
  }

  const handleConfirm = () => {
    showConfirmModal.value = false
    if (confirmResolve.value) {
      confirmResolve.value(true)
      confirmResolve.value = null
    }
  }

  const handleCancel = () => {
    showConfirmModal.value = false
    if (confirmResolve.value) {
      confirmResolve.value(false)
      confirmResolve.value = null
    }
  }

  return {
    showConfirmModal,
    confirmOptions,
    showConfirm,
    handleConfirm,
    handleCancel
  }
}
