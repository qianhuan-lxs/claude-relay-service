const express = require('express')
const router = express.Router()
const apiKeyTemplateService = require('../services/apiKeyTemplateService')
const { authenticateAdmin } = require('../middleware/auth')
const logger = require('../utils/logger')

// 获取所有模板
router.get('/api-key-templates', authenticateAdmin, async (req, res) => {
  try {
    const templates = await apiKeyTemplateService.getAllTemplates()
    res.json({ success: true, data: templates })
  } catch (error) {
    logger.error('Failed to get all API Key templates:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 创建模板
router.post('/api-key-templates', authenticateAdmin, async (req, res) => {
  try {
    const templateData = req.body
    const template = await apiKeyTemplateService.createTemplate(templateData)
    res.json({ success: true, data: template })
  } catch (error) {
    logger.error('Failed to create API Key template:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 获取模板详情
router.get('/api-key-templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const template = await apiKeyTemplateService.getTemplate(id)
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' })
    }
    res.json({ success: true, data: template })
  } catch (error) {
    logger.error('Failed to get API Key template:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 更新模板
router.put('/api-key-templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const templateData = req.body
    const template = await apiKeyTemplateService.updateTemplate(id, templateData)
    res.json({ success: true, data: template })
  } catch (error) {
    logger.error('Failed to update API Key template:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 删除模板
router.delete('/api-key-templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    await apiKeyTemplateService.deleteTemplate(id)
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete API Key template:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// 根据套餐获取模板
router.get('/api-key-templates/plan/:planId', authenticateAdmin, async (req, res) => {
  try {
    const { planId } = req.params
    const template = await apiKeyTemplateService.getTemplateByPlanId(planId)
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found for this plan' })
    }
    res.json({ success: true, data: template })
  } catch (error) {
    logger.error('Failed to get API Key template by planId:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
