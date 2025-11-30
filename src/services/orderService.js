const { v4: uuidv4 } = require('uuid')
const redis = require('../models/redis')
const logger = require('../utils/logger')
const planService = require('./planService')
const apiKeyTemplateService = require('./apiKeyTemplateService')

class OrderService {
  /**
   * 创建订单（带幂等性校验）
   * @param {string} userId - 用户ID
   * @param {string} userUsername - 用户名
   * @param {string} planId - 套餐ID
   * @returns {Promise<Object>} 创建的订单或更新的订单
   */
  async createOrder(userId, userUsername, planId) {
    try {
      const plan = await planService.getPlan(planId)
      if (!plan) {
        throw new Error(`Plan ${planId} not found`)
      }

      if (!plan.isActive) {
        throw new Error(`Plan ${planId} is not active`)
      }

      // 幂等性校验：检查是否已有同一用户同一套餐的待激活订单
      const existingOrder = await redis.getPendingOrderByUserAndPlan(userId, planId)

      if (existingOrder) {
        // 如果已存在待激活订单，更新过期时间（3天后）
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 3)

        await redis.updateOrder(existingOrder.id, {
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString() // 更新创建时间
        })

        logger.info(
          `✅ Updated existing order: ${existingOrder.id} for user ${userUsername}, plan: ${plan.name}`
        )
        return await redis.getOrder(existingOrder.id)
      }

      // 创建新订单
      const orderId = uuidv4()
      const now = new Date()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 3) // 3天后过期

      const orderData = {
        id: orderId,
        userId,
        userUsername,
        planId,
        planName: plan.name,
        price: plan.price,
        expiresAt: expiresAt.toISOString()
      }

      const result = await redis.createOrder(orderData)
      logger.info(`✅ Created order: ${orderId} for user ${userUsername}, plan: ${plan.name}`)
      return result
    } catch (error) {
      logger.error(`❌ Failed to create order:`, error)
      throw error
    }
  }

  /**
   * 获取订单详情
   * @param {string} orderId - 订单ID
   * @returns {Promise<Object|null>} 订单详情
   */
  async getOrder(orderId) {
    try {
      const order = await redis.getOrder(orderId)
      if (order) {
        order.price = parseFloat(order.price) || 0
      }
      return order
    } catch (error) {
      logger.error(`❌ Failed to get order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * 获取用户订单列表
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 订单列表
   */
  async getUserOrders(userId) {
    try {
      const orders = await redis.getUserOrders(userId)
      return orders.map((order) => {
        order.price = parseFloat(order.price) || 0
        return order
      })
    } catch (error) {
      logger.error(`❌ Failed to get user orders for ${userId}:`, error)
      throw error
    }
  }

  /**
   * 获取所有订单
   * @param {string|null} status - 订单状态筛选（pending/activated/expired）
   * @returns {Promise<Array>} 订单列表
   */
  async getAllOrders(status = null) {
    try {
      const orders = await redis.getAllOrders(status)
      return orders.map((order) => {
        order.price = parseFloat(order.price) || 0
        return order
      })
    } catch (error) {
      logger.error(`❌ Failed to get all orders:`, error)
      throw error
    }
  }

  /**
   * 激活订单
   * @param {string} orderId - 订单ID
   * @param {string} activatedBy - 激活管理员
   * @returns {Promise<Object>} 激活后的订单
   */
  async activateOrder(orderId, activatedBy) {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      if (order.status !== 'pending') {
        throw new Error(`Order ${orderId} is not in pending status`)
      }

      // 获取套餐
      const plan = await planService.getPlan(order.planId)
      if (!plan) {
        throw new Error(`Plan ${order.planId} not found`)
      }

      // 获取 API Key 模板
      const template = await apiKeyTemplateService.getTemplateByPlanId(order.planId)
      if (!template) {
        throw new Error(`API Key template for plan ${order.planId} not found`)
      }

      // 准备覆盖配置
      // 注意：不再覆盖模板中的 dailyCostLimit 和 totalCostLimit
      // 因为模板中的值已经考虑了倍速等因素，应该直接使用模板中的值
      const overrides = {
        // 添加订单ID关联，用于费用倍速计算
        orderId: orderId
      }

      // 生成 API Key 名称：套餐名+用户名+订单号前四位
      const orderIdPrefix = orderId.substring(0, 4)
      const apiKeyName = `${plan.name}${order.userUsername}${orderIdPrefix}`

      // 添加名称到覆盖配置
      overrides.name = apiKeyName

      // 从模板生成 API Key
      const apiKey = await apiKeyTemplateService.generateApiKeyFromTemplate(
        template.id,
        order.userId,
        order.userUsername,
        overrides
      )

      // 计算过期时间（月卡需要）
      let expiresAt = ''
      if (plan.type === 'monthly') {
        const expiresDate = new Date()
        expiresDate.setDate(expiresDate.getDate() + plan.duration)
        expiresAt = expiresDate.toISOString()
      }

      // 更新订单状态
      await redis.updateOrder(orderId, {
        expiresAt
      })

      await redis.activateOrder(orderId, apiKey.id, activatedBy)

      logger.info(`✅ Activated order: ${orderId}, generated API Key: ${apiKey.id}`)
      return await this.getOrder(orderId)
    } catch (error) {
      logger.error(`❌ Failed to activate order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * 删除订单
   * @param {string} orderId - 订单ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteOrder(orderId) {
    try {
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      // 如果订单已激活，不允许删除（或者需要先删除关联的 API Key）
      if (order.status === 'activated') {
        throw new Error(`Cannot delete activated order ${orderId}`)
      }

      await redis.deleteOrder(orderId)
      logger.info(`✅ Deleted order: ${orderId}`)
      return true
    } catch (error) {
      logger.error(`❌ Failed to delete order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * 检查并更新过期订单
   * @returns {Promise<number>} 更新的订单数量
   */
  async checkOrderExpiration() {
    try {
      const allOrders = await this.getAllOrders()
      const now = new Date()
      let expiredCount = 0

      for (const order of allOrders) {
        // 检查待激活订单是否过期（3天）
        if (order.status === 'pending' && order.expiresAt) {
          const expiresDate = new Date(order.expiresAt)
          if (expiresDate < now) {
            await redis.updateOrder(order.id, { status: 'expired' })
            expiredCount++
            logger.info(`✅ Marked pending order ${order.id} as expired`)
          }
        }

        // 检查已激活的月卡订单是否过期
        if (order.status === 'activated' && order.expiresAt) {
          const expiresDate = new Date(order.expiresAt)
          if (expiresDate < now) {
            await redis.updateOrder(order.id, { status: 'expired' })
            expiredCount++
            logger.info(`✅ Marked activated order ${order.id} as expired`)
          }
        }

        // 检查计量订单是否用完（需要检查 API Key 的使用情况）
        if (order.apiKeyId) {
          // TODO: 检查 API Key 的 totalCostLimit 是否已用完
          // 这需要从 apiKeyService 获取使用统计
        }
      }

      if (expiredCount > 0) {
        logger.info(`✅ Checked order expiration, marked ${expiredCount} orders as expired`)
      }

      return expiredCount
    } catch (error) {
      logger.error(`❌ Failed to check order expiration:`, error)
      throw error
    }
  }
}

module.exports = new OrderService()
