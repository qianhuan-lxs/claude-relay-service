const { v4: uuidv4 } = require('uuid')
const redis = require('../models/redis')
const logger = require('../utils/logger')
const apiKeyService = require('./apiKeyService')

class ApiKeyTemplateService {
  /**
   * 创建 API Key 模板
   * @param {Object} templateData - 模板数据
   * @returns {Promise<Object>} 创建的模板
   */
  async createTemplate(templateData) {
    try {
      const templateId = templateData.id || uuidv4()
      const templateRecord = {
        id: templateId,
        name: templateData.name,
        planId: templateData.planId || '',
        ...templateData
      }

      const result = await redis.createApiKeyTemplate(templateRecord)
      logger.info(`✅ Created API Key template: ${templateRecord.name} (${templateId})`)
      return result
    } catch (error) {
      logger.error(`❌ Failed to create API Key template:`, error)
      throw error
    }
  }

  /**
   * 获取模板详情
   * @param {string} templateId - 模板ID
   * @returns {Promise<Object|null>} 模板详情
   */
  async getTemplate(templateId) {
    try {
      const template = await redis.getApiKeyTemplate(templateId)
      if (template) {
        // 转换数据类型
        template.tokenLimit = template.tokenLimit ? parseInt(template.tokenLimit) : null
        template.concurrencyLimit = template.concurrencyLimit
          ? parseInt(template.concurrencyLimit)
          : null
        template.rateLimitWindow = template.rateLimitWindow
          ? parseInt(template.rateLimitWindow)
          : null
        template.rateLimitRequests = template.rateLimitRequests
          ? parseInt(template.rateLimitRequests)
          : null
        template.rateLimitCost = template.rateLimitCost ? parseFloat(template.rateLimitCost) : null
        template.dailyCostLimit = template.dailyCostLimit
          ? parseFloat(template.dailyCostLimit)
          : null
        template.totalCostLimit = template.totalCostLimit
          ? parseFloat(template.totalCostLimit)
          : null
        template.weeklyOpusCostLimit = template.weeklyOpusCostLimit
          ? parseFloat(template.weeklyOpusCostLimit)
          : null
        template.enableModelRestriction = template.enableModelRestriction === 'true'
        template.enableClientRestriction = template.enableClientRestriction === 'true'
      }
      return template
    } catch (error) {
      logger.error(`❌ Failed to get API Key template ${templateId}:`, error)
      throw error
    }
  }

  /**
   * 根据套餐ID获取模板
   * @param {string} planId - 套餐ID
   * @returns {Promise<Object|null>} 模板详情
   */
  async getTemplateByPlanId(planId) {
    try {
      const template = await redis.getApiKeyTemplateByPlanId(planId)
      if (template) {
        // 转换数据类型
        template.tokenLimit = template.tokenLimit ? parseInt(template.tokenLimit) : null
        template.concurrencyLimit = template.concurrencyLimit
          ? parseInt(template.concurrencyLimit)
          : null
        template.rateLimitWindow = template.rateLimitWindow
          ? parseInt(template.rateLimitWindow)
          : null
        template.rateLimitRequests = template.rateLimitRequests
          ? parseInt(template.rateLimitRequests)
          : null
        template.rateLimitCost = template.rateLimitCost ? parseFloat(template.rateLimitCost) : null
        template.dailyCostLimit = template.dailyCostLimit
          ? parseFloat(template.dailyCostLimit)
          : null
        template.totalCostLimit = template.totalCostLimit
          ? parseFloat(template.totalCostLimit)
          : null
        template.weeklyOpusCostLimit = template.weeklyOpusCostLimit
          ? parseFloat(template.weeklyOpusCostLimit)
          : null
        template.enableModelRestriction = template.enableModelRestriction === 'true'
        template.enableClientRestriction = template.enableClientRestriction === 'true'
      }
      return template
    } catch (error) {
      logger.error(`❌ Failed to get API Key template by planId ${planId}:`, error)
      throw error
    }
  }

  /**
   * 获取所有模板
   * @returns {Promise<Array>} 模板列表
   */
  async getAllTemplates() {
    try {
      const templates = await redis.getAllApiKeyTemplates()
      return templates.map((template) => {
        template.tokenLimit = template.tokenLimit ? parseInt(template.tokenLimit) : null
        template.concurrencyLimit = template.concurrencyLimit
          ? parseInt(template.concurrencyLimit)
          : null
        template.rateLimitWindow = template.rateLimitWindow
          ? parseInt(template.rateLimitWindow)
          : null
        template.rateLimitRequests = template.rateLimitRequests
          ? parseInt(template.rateLimitRequests)
          : null
        template.rateLimitCost = template.rateLimitCost ? parseFloat(template.rateLimitCost) : null
        template.dailyCostLimit = template.dailyCostLimit
          ? parseFloat(template.dailyCostLimit)
          : null
        template.totalCostLimit = template.totalCostLimit
          ? parseFloat(template.totalCostLimit)
          : null
        template.weeklyOpusCostLimit = template.weeklyOpusCostLimit
          ? parseFloat(template.weeklyOpusCostLimit)
          : null
        template.enableModelRestriction = template.enableModelRestriction === 'true'
        template.enableClientRestriction = template.enableClientRestriction === 'true'
        return template
      })
    } catch (error) {
      logger.error(`❌ Failed to get all API Key templates:`, error)
      throw error
    }
  }

  /**
   * 更新模板
   * @param {string} templateId - 模板ID
   * @param {Object} templateData - 更新的数据
   * @returns {Promise<Object>} 更新后的模板
   */
  async updateTemplate(templateId, templateData) {
    try {
      const result = await redis.updateApiKeyTemplate(templateId, templateData)
      logger.info(`✅ Updated API Key template: ${templateId}`)
      return result
    } catch (error) {
      logger.error(`❌ Failed to update API Key template ${templateId}:`, error)
      throw error
    }
  }

  /**
   * 删除模板
   * @param {string} templateId - 模板ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteTemplate(templateId) {
    try {
      await redis.deleteApiKeyTemplate(templateId)
      logger.info(`✅ Deleted API Key template: ${templateId}`)
      return true
    } catch (error) {
      logger.error(`❌ Failed to delete API Key template ${templateId}:`, error)
      throw error
    }
  }

  /**
   * 从模板生成 API Key
   * @param {string} templateId - 模板ID
   * @param {string} userId - 用户ID
   * @param {string} userUsername - 用户名
   * @param {Object} overrides - 覆盖模板的配置（如限额等，可包含 name 字段）
   * @returns {Promise<Object>} 生成的 API Key
   */
  async generateApiKeyFromTemplate(templateId, userId, userUsername, overrides = {}) {
    try {
      const template = await this.getTemplate(templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      // 准备 API Key 数据
      const apiKeyData = {
        userId,
        userUsername,
        name: overrides.name || template.name || 'Unnamed Key', // 优先使用 overrides 中的 name
        description: template.description || '',
        tokenLimit: template.tokenLimit,
        concurrencyLimit: template.concurrencyLimit,
        rateLimitWindow: template.rateLimitWindow,
        rateLimitRequests: template.rateLimitRequests,
        rateLimitCost: template.rateLimitCost,
        claudeAccountId: template.claudeAccountId || '',
        claudeConsoleAccountId: template.claudeConsoleAccountId || '',
        geminiAccountId: template.geminiAccountId || '',
        openaiAccountId: template.openaiAccountId || '',
        azureOpenaiAccountId: template.azureOpenaiAccountId || '',
        bedrockAccountId: template.bedrockAccountId || '',
        droidAccountId: template.droidAccountId || '',
        permissions: template.permissions || 'all',
        enableModelRestriction: template.enableModelRestriction || false,
        restrictedModels: template.restrictedModels || [],
        enableClientRestriction: template.enableClientRestriction || false,
        allowedClients: template.allowedClients || [],
        tags: template.tags || [],
        icon: template.icon || ''
      }

      // 应用覆盖配置（如从套餐来的限额）
      // 注意：name 已经在上面处理了，这里不再覆盖
      const { name, ...otherOverrides } = overrides
      Object.assign(apiKeyData, otherOverrides)

      // 使用 apiKeyService 生成 API Key
      const apiKey = await apiKeyService.generateApiKey(apiKeyData)
      logger.info(`✅ Generated API Key from template ${templateId} for user ${userUsername}`)
      return apiKey
    } catch (error) {
      logger.error(`❌ Failed to generate API Key from template ${templateId}:`, error)
      throw error
    }
  }
}

module.exports = new ApiKeyTemplateService()
