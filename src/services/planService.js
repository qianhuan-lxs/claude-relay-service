const { v4: uuidv4 } = require('uuid')
const redis = require('../models/redis')
const logger = require('../utils/logger')

class PlanService {
  /**
   * 计算倍速
   * @param {number} displayLimit - 用户看到的额度
   * @param {number} actualLimit - 实际额度
   * @returns {number} 倍速
   */
  calculateSpeedMultiplier(displayLimit, actualLimit) {
    if (!actualLimit || actualLimit === 0) {
      return 1
    }
    return displayLimit / actualLimit
  }

  /**
   * 创建套餐
   * @param {Object} planData - 套餐数据
   * @returns {Promise<Object>} 创建的套餐
   */
  async createPlan(planData) {
    try {
      const { type, dailyLimitDisplay, dailyLimitActual, totalLimitDisplay, totalLimitActual } =
        planData

      // 计算倍速
      let speedMultiplier = 1
      if (type === 'monthly') {
        speedMultiplier = this.calculateSpeedMultiplier(dailyLimitDisplay, dailyLimitActual)
      } else if (type === 'usage') {
        speedMultiplier = this.calculateSpeedMultiplier(totalLimitDisplay, totalLimitActual)
      }

      const planId = planData.id || uuidv4()
      const planRecord = {
        id: planId,
        name: planData.name,
        type: planData.type,
        price: parseFloat(planData.price) || 0,
        xianyuLink: planData.xianyuLink || '',
        apiKeyTemplateId: planData.apiKeyTemplateId || '',
        isActive: planData.isActive !== undefined ? planData.isActive : true,
        speedMultiplier
      }

      // 月卡特有字段
      if (type === 'monthly') {
        planRecord.duration = parseInt(planData.duration) || 30
        planRecord.dailyLimitActual = parseFloat(dailyLimitActual) || 0
        planRecord.dailyLimitDisplay = parseFloat(dailyLimitDisplay) || 0
        planRecord.description = planData.description || ''
      }

      // 计量特有字段
      if (type === 'usage') {
        planRecord.totalLimitActual = parseFloat(totalLimitActual) || 0
        planRecord.totalLimitDisplay = parseFloat(totalLimitDisplay) || 0
      }

      const result = await redis.createPlan(planRecord)
      logger.info(`✅ Created plan: ${planRecord.name} (${planId})`)
      return result
    } catch (error) {
      logger.error(`❌ Failed to create plan:`, error)
      throw error
    }
  }

  /**
   * 获取套餐详情
   * @param {string} planId - 套餐ID
   * @returns {Promise<Object|null>} 套餐详情
   */
  async getPlan(planId) {
    try {
      const plan = await redis.getPlan(planId)
      if (plan) {
        // 转换数据类型
        plan.price = parseFloat(plan.price) || 0
        plan.isActive = plan.isActive === 'true'
        plan.speedMultiplier = parseFloat(plan.speedMultiplier) || 1
        plan.apiKeyTemplateId = plan.apiKeyTemplateId || ''

        if (plan.type === 'monthly') {
          plan.duration = parseInt(plan.duration) || 30
          plan.dailyLimitActual = parseFloat(plan.dailyLimitActual) || 0
          plan.dailyLimitDisplay = parseFloat(plan.dailyLimitDisplay) || 0
        } else if (plan.type === 'usage') {
          plan.totalLimitActual = parseFloat(plan.totalLimitActual) || 0
          plan.totalLimitDisplay = parseFloat(plan.totalLimitDisplay) || 0
        }
      }
      return plan
    } catch (error) {
      logger.error(`❌ Failed to get plan ${planId}:`, error)
      throw error
    }
  }

  /**
   * 获取所有套餐
   * @param {boolean} includeInactive - 是否包含未启用的套餐
   * @returns {Promise<Array>} 套餐列表
   */
  async getAllPlans(includeInactive = false) {
    try {
      const plans = await redis.getAllPlans(includeInactive)
      return plans.map((plan) => {
        plan.price = parseFloat(plan.price) || 0
        plan.isActive = plan.isActive === 'true'
        plan.speedMultiplier = parseFloat(plan.speedMultiplier) || 1
        plan.apiKeyTemplateId = plan.apiKeyTemplateId || ''

        if (plan.type === 'monthly') {
          plan.duration = parseInt(plan.duration) || 30
          plan.dailyLimitActual = parseFloat(plan.dailyLimitActual) || 0
          plan.dailyLimitDisplay = parseFloat(plan.dailyLimitDisplay) || 0
        } else if (plan.type === 'usage') {
          plan.totalLimitActual = parseFloat(plan.totalLimitActual) || 0
          plan.totalLimitDisplay = parseFloat(plan.totalLimitDisplay) || 0
        }

        return plan
      })
    } catch (error) {
      logger.error(`❌ Failed to get all plans:`, error)
      throw error
    }
  }

  /**
   * 更新套餐
   * @param {string} planId - 套餐ID
   * @param {Object} planData - 更新的数据
   * @returns {Promise<Object>} 更新后的套餐
   */
  async updatePlan(planId, planData) {
    try {
      const existingPlan = await this.getPlan(planId)
      if (!existingPlan) {
        throw new Error(`Plan ${planId} not found`)
      }

      // 确保使用正确的值来计算倍速
      // 对于月卡套餐，使用 dailyLimitDisplay 和 dailyLimitActual
      // 对于计量套餐，使用 totalLimitDisplay 和 totalLimitActual
      // 如果 planData 中的字段是 undefined，使用 existingPlan 的值
      // 如果 planData 中的字段有值（包括 0），使用 planData 的值
      let dailyLimitDisplay, dailyLimitActual, totalLimitDisplay, totalLimitActual

      if (existingPlan.type === 'monthly') {
        // 对于月卡套餐，只处理月卡相关字段
        // 如果字段在 planData 中存在（不是 undefined），使用 planData 的值
        // 否则使用 existingPlan 的值
        // 注意：需要正确处理 0 值，不能使用 || 0，因为 0 是有效值
        if (planData.dailyLimitDisplay !== undefined) {
          dailyLimitDisplay = parseFloat(planData.dailyLimitDisplay)
          if (isNaN(dailyLimitDisplay)) {
            dailyLimitDisplay = parseFloat(existingPlan.dailyLimitDisplay) || 0
          }
        } else {
          dailyLimitDisplay = parseFloat(existingPlan.dailyLimitDisplay) || 0
        }

        if (planData.dailyLimitActual !== undefined) {
          dailyLimitActual = parseFloat(planData.dailyLimitActual)
          if (isNaN(dailyLimitActual)) {
            dailyLimitActual = parseFloat(existingPlan.dailyLimitActual) || 0
          }
        } else {
          dailyLimitActual = parseFloat(existingPlan.dailyLimitActual) || 0
        }

        // 调试日志
        logger.debug(
          `🔍 Updating monthly plan ${planId}: dailyLimitDisplay=${dailyLimitDisplay}, dailyLimitActual=${dailyLimitActual}, existingPlan.dailyLimitDisplay=${existingPlan.dailyLimitDisplay}, existingPlan.dailyLimitActual=${existingPlan.dailyLimitActual}, planData.dailyLimitDisplay=${planData.dailyLimitDisplay}, planData.dailyLimitActual=${planData.dailyLimitActual}`
        )

        // 重新计算倍速（使用正确的值）
        planData.speedMultiplier = this.calculateSpeedMultiplier(
          dailyLimitDisplay,
          dailyLimitActual
        )

        logger.debug(`🔍 Calculated speedMultiplier: ${planData.speedMultiplier}`)

        // 确保更新 planData 中的字段值（用于保存到 Redis）
        planData.dailyLimitDisplay = dailyLimitDisplay
        planData.dailyLimitActual = dailyLimitActual
      } else if (existingPlan.type === 'usage') {
        // 对于计量套餐，只处理计量相关字段
        // 注意：需要正确处理 0 值，不能使用 || 0，因为 0 是有效值
        if (planData.totalLimitDisplay !== undefined) {
          totalLimitDisplay = parseFloat(planData.totalLimitDisplay)
          if (isNaN(totalLimitDisplay)) {
            totalLimitDisplay = parseFloat(existingPlan.totalLimitDisplay) || 0
          }
        } else {
          totalLimitDisplay = parseFloat(existingPlan.totalLimitDisplay) || 0
        }

        if (planData.totalLimitActual !== undefined) {
          totalLimitActual = parseFloat(planData.totalLimitActual)
          if (isNaN(totalLimitActual)) {
            totalLimitActual = parseFloat(existingPlan.totalLimitActual) || 0
          }
        } else {
          totalLimitActual = parseFloat(existingPlan.totalLimitActual) || 0
        }

        // 重新计算倍速（使用正确的值）
        planData.speedMultiplier = this.calculateSpeedMultiplier(
          totalLimitDisplay,
          totalLimitActual
        )

        // 确保更新 planData 中的字段值（用于保存到 Redis）
        planData.totalLimitDisplay = totalLimitDisplay
        planData.totalLimitActual = totalLimitActual
      }

      const result = await redis.updatePlan(planId, planData)
      logger.info(`✅ Updated plan: ${planId}`)
      return result
    } catch (error) {
      logger.error(`❌ Failed to update plan ${planId}:`, error)
      throw error
    }
  }

  /**
   * 删除套餐
   * @param {string} planId - 套餐ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deletePlan(planId) {
    try {
      await redis.deletePlan(planId)
      logger.info(`✅ Deleted plan: ${planId}`)
      return true
    } catch (error) {
      logger.error(`❌ Failed to delete plan ${planId}:`, error)
      throw error
    }
  }
}

module.exports = new PlanService()
