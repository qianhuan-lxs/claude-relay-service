<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800"
      >
        <div
          class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ editingPlan ? '编辑套餐' : '创建套餐' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="$emit('close')"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 步骤指示器 -->
        <div
          class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
        >
          <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center">
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  currentStep >= 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                ]"
              >
                1
              </div>
              <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >套餐信息</span
              >
            </div>
            <div class="h-0.5 w-8 bg-gray-300 dark:bg-gray-600"></div>
            <div class="flex items-center">
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  currentStep >= 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                ]"
              >
                2
              </div>
              <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >API Key 模板</span
              >
            </div>
            <div class="h-0.5 w-8 bg-gray-300 dark:bg-gray-600"></div>
            <div class="flex items-center">
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  currentStep >= 3
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                ]"
              >
                3
              </div>
              <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >闲鱼链接</span
              >
            </div>
          </div>
        </div>

        <form class="p-6" @submit.prevent="handleSubmit">
          <!-- 步骤 1: 套餐基本信息 -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                套餐名称 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="输入套餐名称"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                套餐类型 <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-4">
                <label class="flex cursor-pointer items-center">
                  <input
                    v-model="form.type"
                    class="mr-2 text-blue-600"
                    type="radio"
                    value="monthly"
                    @change="handleTypeChange"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">月卡</span>
                </label>
                <label class="flex cursor-pointer items-center">
                  <input
                    v-model="form.type"
                    class="mr-2 text-blue-600"
                    type="radio"
                    value="usage"
                    @change="handleTypeChange"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">计量</span>
                </label>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                价格（人民币） <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.price"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="输入价格"
                required
                step="0.01"
                type="number"
              />
            </div>

            <!-- 月卡特有字段 -->
            <template v-if="form.type === 'monthly'">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  时长（天数） <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.duration"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="1"
                  placeholder="输入天数"
                  required
                  type="number"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  每日额度（实际，美元） <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.dailyLimitActual"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="0"
                  placeholder="输入实际每日额度"
                  required
                  step="0.01"
                  type="number"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  每日额度（显示给用户，美元） <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.dailyLimitDisplay"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="0"
                  placeholder="输入显示给用户的每日额度"
                  required
                  step="0.01"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500">
                  倍速将自动计算：{{ speedMultiplier.toFixed(2) }}x
                </p>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  描述
                </label>
                <textarea
                  v-model="form.description"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="输入套餐描述（可选）"
                  rows="3"
                />
              </div>
            </template>

            <!-- 计量特有字段 -->
            <template v-if="form.type === 'usage'">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  总额度（实际，美元） <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.totalLimitActual"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="0"
                  placeholder="输入实际总额度"
                  required
                  step="0.01"
                  type="number"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  总额度（显示给用户，美元） <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.totalLimitDisplay"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  min="0"
                  placeholder="输入显示给用户的总额度"
                  required
                  step="0.01"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500">
                  倍速将自动计算：{{ speedMultiplier.toFixed(2) }}x
                </p>
              </div>
            </template>
          </div>

          <!-- 步骤 2: API Key 模板配置 -->
          <div v-if="currentStep === 2" class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              配置 API Key 模板，这些配置将在激活订单时应用到生成的 API Key
            </p>
            <!-- 这里可以复用 CreateApiKeyModal 的表单逻辑，但简化为模板配置 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                模板名称 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="templateForm.name"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="输入模板名称"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                每日费用限额（美元）
              </label>
              <input
                v-model.number="templateForm.dailyCostLimit"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="输入每日费用限额（0表示无限制）"
                step="0.01"
                type="number"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                总费用限额（美元）
              </label>
              <input
                v-model.number="templateForm.totalCostLimit"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="输入总费用限额（0表示无限制）"
                step="0.01"
                type="number"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                并发限制
              </label>
              <input
                v-model.number="templateForm.concurrencyLimit"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="输入并发限制（0表示无限制）"
                type="number"
              />
            </div>

            <!-- 速率限制 -->
            <div
              class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20"
            >
              <h4 class="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                速率限制设置（可选）
              </h4>
              <div class="grid grid-cols-1 gap-2 lg:grid-cols-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    时间窗口（分钟）
                  </label>
                  <input
                    v-model.number="templateForm.rateLimitWindow"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="1"
                    placeholder="无限制"
                    type="number"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    请求次数限制
                  </label>
                  <input
                    v-model.number="templateForm.rateLimitRequests"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="1"
                    placeholder="无限制"
                    type="number"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    费用限制（美元）
                  </label>
                  <input
                    v-model.number="templateForm.rateLimitCost"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="0"
                    placeholder="无限制"
                    step="0.01"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opus 模型周费用限制（美元）
              </label>
              <input
                v-model.number="templateForm.weeklyOpusCostLimit"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                min="0"
                placeholder="输入 Opus 周费用限制（0表示无限制）"
                step="0.01"
                type="number"
              />
              <p class="mt-1 text-xs text-gray-500">
                设置 Opus 模型的周费用限制（周一到周日），仅限 Claude 官方账户
              </p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                权限
              </label>
              <select
                v-model="templateForm.permissions"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">全部</option>
                <option value="claude">仅 Claude</option>
                <option value="gemini">仅 Gemini</option>
                <option value="openai">仅 OpenAI</option>
                <option value="droid">仅 Droid</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                描述
              </label>
              <textarea
                v-model="templateForm.description"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="输入模板描述（可选）"
                rows="3"
              />
            </div>
          </div>

          <!-- 步骤 3: 闲鱼链接 -->
          <div v-if="currentStep === 3" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                闲鱼链接 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.xianyuLink"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="输入闲鱼商品链接"
                required
                type="url"
              />
              <p class="mt-1 text-xs text-gray-500">用户点击购买时将跳转到此链接</p>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="mt-6 flex justify-between">
            <button
              v-if="currentStep > 1"
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              type="button"
              @click="currentStep--"
            >
              上一步
            </button>
            <div v-else></div>

            <div class="flex gap-3">
              <button
                class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                type="button"
                @click="$emit('close')"
              >
                取消
              </button>
              <button
                v-if="currentStep < 3"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                :disabled="loading"
                type="button"
                @click="nextStep"
              >
                下一步
              </button>
              <button
                v-else
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                :disabled="loading"
                type="submit"
              >
                {{ loading ? '创建中...' : editingPlan ? '更新' : '创建' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const props = defineProps({
  plan: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const currentStep = ref(1)
const editingPlan = computed(() => !!props.plan)

const form = ref({
  name: '',
  type: 'monthly',
  price: 0,
  duration: 30,
  dailyLimitActual: 0,
  dailyLimitDisplay: 0,
  totalLimitActual: 0,
  totalLimitDisplay: 0,
  description: '',
  xianyuLink: ''
})

const templateForm = ref({
  name: '',
  dailyCostLimit: 0,
  totalCostLimit: 0,
  weeklyOpusCostLimit: 0,
  concurrencyLimit: 0,
  rateLimitWindow: null,
  rateLimitRequests: null,
  rateLimitCost: null,
  permissions: 'all',
  claudeAccountId: '',
  geminiAccountId: '',
  openaiAccountId: '',
  bedrockAccountId: '',
  droidAccountId: '',
  enableModelRestriction: false,
  restrictedModels: [],
  enableClientRestriction: false,
  allowedClients: [],
  tags: [],
  description: ''
})

const speedMultiplier = computed(() => {
  if (form.value.type === 'monthly') {
    if (!form.value.dailyLimitActual || form.value.dailyLimitActual === 0) return 1
    return form.value.dailyLimitDisplay / form.value.dailyLimitActual
  } else {
    if (!form.value.totalLimitActual || form.value.totalLimitActual === 0) return 1
    return form.value.totalLimitDisplay / form.value.totalLimitActual
  }
})

const handleTypeChange = () => {
  // 重置相关字段
  if (form.value.type === 'monthly') {
    form.value.totalLimitActual = 0
    form.value.totalLimitDisplay = 0
  } else {
    form.value.duration = 30
    form.value.dailyLimitActual = 0
    form.value.dailyLimitDisplay = 0
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // 准备模板数据
    const templateData = {
      name: templateForm.value.name,
      planId: editingPlan.value ? props.plan.id : '', // 编辑时使用现有 planId
      dailyCostLimit: templateForm.value.dailyCostLimit || 0,
      totalCostLimit: templateForm.value.totalCostLimit || 0,
      weeklyOpusCostLimit: templateForm.value.weeklyOpusCostLimit || 0,
      concurrencyLimit: templateForm.value.concurrencyLimit || 0,
      rateLimitWindow: templateForm.value.rateLimitWindow || null,
      rateLimitRequests: templateForm.value.rateLimitRequests || null,
      rateLimitCost: templateForm.value.rateLimitCost || null,
      permissions: templateForm.value.permissions || 'all',
      claudeAccountId: templateForm.value.claudeAccountId || '',
      geminiAccountId: templateForm.value.geminiAccountId || '',
      openaiAccountId: templateForm.value.openaiAccountId || '',
      bedrockAccountId: templateForm.value.bedrockAccountId || '',
      droidAccountId: templateForm.value.droidAccountId || '',
      enableModelRestriction: templateForm.value.enableModelRestriction || false,
      restrictedModels: templateForm.value.restrictedModels || [],
      enableClientRestriction: templateForm.value.enableClientRestriction || false,
      allowedClients: templateForm.value.allowedClients || [],
      tags: templateForm.value.tags || [],
      description: templateForm.value.description || ''
    }

    let templateId
    if (editingPlan.value && props.plan.apiKeyTemplateId) {
      // 编辑时更新现有模板
      const templateResponse = await apiClient.put(
        `/admin/api-key-templates/${props.plan.apiKeyTemplateId}`,
        templateData
      )
      if (!templateResponse || !templateResponse.success) {
        throw new Error('更新 API Key 模板失败')
      }
      templateId = props.plan.apiKeyTemplateId
    } else {
      // 创建新模板
      const templateResponse = await apiClient.post('/admin/api-key-templates', templateData)
      if (!templateResponse || !templateResponse.success) {
        throw new Error('创建 API Key 模板失败')
      }
      templateId = templateResponse.data.id
    }

    // 创建或更新套餐
    const planData = {
      ...form.value,
      apiKeyTemplateId: templateId
    }

    let response
    if (editingPlan.value) {
      response = await apiClient.put(`/admin/plans/${props.plan.id}`, planData)
    } else {
      response = await apiClient.post('/admin/plans', planData)
    }

    if (response && response.success) {
      // 如果是新创建的模板，更新模板的 planId
      if (!editingPlan.value) {
        await apiClient.put(`/admin/api-key-templates/${templateId}`, {
          planId: response.data.id
        })
      }

      showToast(editingPlan.value ? '套餐更新成功' : '套餐创建成功', 'success')
      emit('success')
    } else {
      throw new Error(response?.error || '操作失败')
    }
  } catch (error) {
    showToast(error.message || '操作失败', 'error')
    console.error('Failed to create/update plan:', error)
  } finally {
    loading.value = false
  }
}

// 加载模板数据
const loadTemplateData = async (templateId) => {
  try {
    const response = await apiClient.get(`/admin/api-key-templates/${templateId}`)
    if (response && response.success && response.data) {
      const template = response.data
      templateForm.value = {
        name: template.name || '',
        dailyCostLimit: template.dailyCostLimit || 0,
        totalCostLimit: template.totalCostLimit || 0,
        weeklyOpusCostLimit: template.weeklyOpusCostLimit || 0,
        concurrencyLimit: template.concurrencyLimit || 0,
        rateLimitWindow: template.rateLimitWindow || null,
        rateLimitRequests: template.rateLimitRequests || null,
        rateLimitCost: template.rateLimitCost || null,
        permissions: template.permissions || 'all',
        claudeAccountId: template.claudeAccountId || '',
        geminiAccountId: template.geminiAccountId || '',
        openaiAccountId: template.openaiAccountId || '',
        bedrockAccountId: template.bedrockAccountId || '',
        droidAccountId: template.droidAccountId || '',
        enableModelRestriction: template.enableModelRestriction || false,
        restrictedModels: template.restrictedModels || [],
        enableClientRestriction: template.enableClientRestriction || false,
        allowedClients: template.allowedClients || [],
        tags: template.tags || [],
        description: template.description || ''
      }
    }
  } catch (error) {
    console.error('Failed to load template data:', error)
  }
}

// 初始化编辑数据
watch(
  () => props.plan,
  async (plan) => {
    if (plan) {
      form.value = {
        name: plan.name || '',
        type: plan.type || 'monthly',
        price: plan.price || 0,
        duration: plan.duration || 30,
        dailyLimitActual: plan.dailyLimitActual || 0,
        dailyLimitDisplay: plan.dailyLimitDisplay || 0,
        totalLimitActual: plan.totalLimitActual || 0,
        totalLimitDisplay: plan.totalLimitDisplay || 0,
        description: plan.description || '',
        xianyuLink: plan.xianyuLink || ''
      }

      // 加载模板数据
      if (plan.apiKeyTemplateId) {
        await loadTemplateData(plan.apiKeyTemplateId)
      }
    } else {
      // 重置表单
      templateForm.value = {
        name: '',
        dailyCostLimit: 0,
        totalCostLimit: 0,
        weeklyOpusCostLimit: 0,
        concurrencyLimit: 0,
        rateLimitWindow: null,
        rateLimitRequests: null,
        rateLimitCost: null,
        permissions: 'all',
        claudeAccountId: '',
        geminiAccountId: '',
        openaiAccountId: '',
        bedrockAccountId: '',
        droidAccountId: '',
        enableModelRestriction: false,
        restrictedModels: [],
        enableClientRestriction: false,
        allowedClients: [],
        tags: [],
        description: ''
      }
    }
  },
  { immediate: true }
)
</script>
