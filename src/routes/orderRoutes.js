const express = require('express')
const router = express.Router()
const orderService = require('../services/orderService')
const { authenticateAdmin, authenticateUser } = require('../middleware/auth')
const logger = require('../utils/logger')

// 管理员：获取所有订单
router.get('/orders', authenticateAdmin, async (req, res) => {
  try {
    const status = req.query.status || null
    const orders = await orderService.getAllOrders(status)
    res.json({ success: true, data: orders })
  } catch (error) {
    logger.error('Failed to get all orders:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：获取订单详情
router.get('/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const order = await orderService.getOrder(id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    res.json({ success: true, data: order })
  } catch (error) {
    logger.error('Failed to get order:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：激活订单
router.put('/orders/:id/activate', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const activatedBy = req.user?.username || req.user?.id || 'admin'
    const order = await orderService.activateOrder(id, activatedBy)
    res.json({ success: true, data: order })
  } catch (error) {
    logger.error('Failed to activate order:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：删除订单
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    await orderService.deleteOrder(id)
    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    logger.error('Failed to delete order:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 管理员：手动创建订单
router.post('/orders', authenticateAdmin, async (req, res) => {
  try {
    const { planId, userEmail } = req.body

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required' })
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail is required' })
    }

    // 按邮箱查询用户
    const userService = require('../services/userService')
    const user = await userService.getUserByEmail(userEmail)

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: `User with email ${userEmail} not found` })
    }

    const userUsername = user.username || user.email || user.id
    const order = await orderService.createOrder(user.id, userUsername, planId)

    res.json({ success: true, data: order })
  } catch (error) {
    logger.error('Failed to create order by admin:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 用户：创建订单
router.post('/users/orders', authenticateUser, async (req, res) => {
  try {
    const { planId } = req.body
    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required' })
    }

    const userId = req.user.id
    const userUsername = req.user.username || req.user.email || userId
    const order = await orderService.createOrder(userId, userUsername, planId)
    res.json({ success: true, data: order })
  } catch (error) {
    logger.error('Failed to create order:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 用户：获取自己的订单列表
router.get('/users/orders', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const orders = await orderService.getUserOrders(userId)
    res.json({ success: true, data: orders })
  } catch (error) {
    logger.error('Failed to get user orders:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 用户：获取订单详情
router.get('/users/orders/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const order = await orderService.getOrder(id)

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    // 验证订单属于当前用户
    if (order.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' })
    }

    res.json({ success: true, data: order })
  } catch (error) {
    logger.error('Failed to get order:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
