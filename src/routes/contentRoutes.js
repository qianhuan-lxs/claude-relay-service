const express = require('express')
const router = express.Router()

const redis = require('../models/redis')
const logger = require('../utils/logger')

// 📢 获取启用的公告列表（公开访问）
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await redis.getAllAnnouncements(true) // activeOnly = true
    return res.json({ success: true, data: announcements })
  } catch (error) {
    logger.error('Failed to get announcements:', error)
    return res.status(500).json({ error: 'Failed to get announcements', message: error.message })
  }
})

// 📚 获取启用的教程列表（公开访问）
router.get('/tutorials', async (req, res) => {
  try {
    const tutorials = await redis.getAllTutorials(true) // activeOnly = true
    return res.json({ success: true, data: tutorials })
  } catch (error) {
    logger.error('Failed to get tutorials:', error)
    return res.status(500).json({ error: 'Failed to get tutorials', message: error.message })
  }
})

module.exports = router

