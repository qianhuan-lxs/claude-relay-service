const express = require('express')
const router = express.Router()
const planService = require('../services/planService')
const { authenticateAdmin, authenticateUser } = require('../middleware/auth')
const logger = require('../utils/logger')

// 管理员：获取所有套餐
router.get('/plans', authenticateAdmin, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const plans = await planService.getAllPlans(includeInactive)
    res.json({ success: true, data: plans })
  } catch (error) {
    logger.error('Failed to get all plans:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：创建套餐
router.post('/plans', authenticateAdmin, async (req, res) => {
  try {
    const planData = req.body
    const plan = await planService.createPlan(planData)
    res.json({ success: true, data: plan })
  } catch (error) {
    logger.error('Failed to create plan:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：获取套餐详情
router.get('/plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const plan = await planService.getPlan(id)
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' })
    }
    res.json({ success: true, data: plan })
  } catch (error) {
    logger.error('Failed to get plan:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：更新套餐
router.put('/plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const planData = req.body
    const plan = await planService.updatePlan(id, planData)
    res.json({ success: true, data: plan })
  } catch (error) {
    logger.error('Failed to update plan:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：删除套餐
router.delete('/plans/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    await planService.deletePlan(id)
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete plan:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 客户端：获取可用套餐列表
router.get('/users/plans', authenticateUser, async (req, res) => {
  try {
    const plans = await planService.getAllPlans(false) // 只获取启用的套餐
    res.json({ success: true, data: plans })
  } catch (error) {
    logger.error('Failed to get plans for user:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
