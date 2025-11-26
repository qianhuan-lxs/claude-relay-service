const redis = require('../models/redis')
const logger = require('../utils/logger')
const crypto = require('crypto')
const config = require('../../config/config')
const userService = require('./userService')
const planService = require('./planService')
const orderService = require('./orderService')
const apiKeyTemplateService = require('./apiKeyTemplateService')

// 解密函数（从 data-transfer-enhanced.js 复制）
function decryptClaudeData(encryptedData) {
  if (!encryptedData || !config.security.encryptionKey) {
    return encryptedData
  }

  try {
    if (encryptedData.includes(':')) {
      const parts = encryptedData.split(':')
      const key = crypto.scryptSync(config.security.encryptionKey, 'salt', 32)
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
    return encryptedData
  } catch (error) {
    logger.warn(`⚠️  Failed to decrypt data: ${error.message}`)
    return encryptedData
  }
}

function decryptGeminiData(encryptedData) {
  if (!encryptedData || !config.security.encryptionKey) {
    return encryptedData
  }

  try {
    if (encryptedData.includes(':')) {
      const parts = encryptedData.split(':')
      const key = crypto.scryptSync(config.security.encryptionKey, 'gemini-account-salt', 32)
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
    return encryptedData
  } catch (error) {
    logger.warn(`⚠️  Failed to decrypt data: ${error.message}`)
    return encryptedData
  }
}

// 加密函数
function encryptClaudeData(data) {
  if (!data || !config.security.encryptionKey) {
    return data
  }

  const key = crypto.scryptSync(config.security.encryptionKey, 'salt', 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return `${iv.toString('hex')}:${encrypted}`
}

function encryptGeminiData(data) {
  if (!data || !config.security.encryptionKey) {
    return data
  }

  const key = crypto.scryptSync(config.security.encryptionKey, 'gemini-account-salt', 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return `${iv.toString('hex')}:${encrypted}`
}

// 获取导出预览（数据统计）
async function getExportPreview() {
  try {
    const client = redis.getClientSafe()
    const stats = {}

    // API Keys
    const apiKeyKeys = await client.keys('apikey:*')
    stats.apikeys = apiKeyKeys.filter((k) => k !== 'apikey:hash_map').length

    // 账户
    const claudeKeys = await client.keys('claude:account:*')
    const geminiKeys = await client.keys('gemini_account:*')
    const ccrKeys = await client.keys('ccr_account:*')
    const droidKeys = await client.keys('droid_account:*')
    stats.accounts =
      claudeKeys.length + geminiKeys.length + ccrKeys.length + droidKeys.length

    // 用户
    const userKeys = await client.keys('user:*')
    stats.users = userKeys.filter((k) => !k.includes('user_email:') && !k.includes('user_session:')).length

    // 套餐
    const planKeys = await client.keys('plan:*')
    stats.plans = planKeys.filter((k) => k !== 'plans:list').length

    // API Key 模板
    const templateKeys = await client.keys('apikey_template:*')
    stats.apiKeyTemplates = templateKeys.filter((k) => k !== 'apikey_templates:list').length

    // 订单
    const orderKeys = await client.keys('order:*')
    stats.orders = orderKeys.filter((k) => k !== 'orders:list').length

    // 公告
    const announcementKeys = await client.keys('announcement:*')
    stats.announcements = announcementKeys.filter((k) => k !== 'announcements:list').length

    // 教程
    const tutorialKeys = await client.keys('tutorial:*')
    stats.tutorials = tutorialKeys.filter((k) => k !== 'tutorials:list').length

    return stats
  } catch (error) {
    logger.error('❌ Failed to get export preview:', error)
    throw error
  }
}

// 导出数据
async function exportData(options = {}) {
  try {
    const {
      types = ['all'],
      includeStats = false,
      decrypt = false // 默认保持加密状态
    } = options

    const client = redis.getClientSafe()
    const exportDataObj = {
      metadata: {
        version: '2.0',
        exportDate: new Date().toISOString(),
        sanitized: false,
        decrypted: decrypt,
        types
      },
      data: {}
    }

    // 导出 API Keys
    if (types.includes('all') || types.includes('apikeys')) {
      logger.info('📤 Exporting API Keys...')
      const keys = await client.keys('apikey:*')
      const apiKeys = []

      for (const key of keys) {
        if (key === 'apikey:hash_map') {
          continue
        }

        const data = await client.hgetall(key)
        if (data && Object.keys(data).length > 0) {
          // 导出使用统计数据（如果需要）
          if (includeStats && data.id) {
            // 这里可以添加使用统计导出逻辑
            // 暂时跳过，因为比较复杂
          }

          apiKeys.push(data)
        }
      }

      exportDataObj.data.apiKeys = apiKeys
      logger.info(`✅ Exported ${apiKeys.length} API Keys`)
    }

    // 导出账户（简化版，只导出 Claude 和 Gemini）
    if (types.includes('all') || types.includes('accounts')) {
      logger.info('📤 Exporting accounts...')
      
      // Claude 账户
      const claudeKeys = await client.keys('claude:account:*')
      const claudeAccounts = []
      for (const key of claudeKeys) {
        const data = await client.hgetall(key)
        if (data && Object.keys(data).length > 0) {
          // 如果要求解密且不是脱敏
          if (decrypt) {
            if (data.email) data.email = decryptClaudeData(data.email)
            if (data.password) data.password = decryptClaudeData(data.password)
            if (data.accessToken) data.accessToken = decryptClaudeData(data.accessToken)
            if (data.refreshToken) data.refreshToken = decryptClaudeData(data.refreshToken)
            if (data.claudeAiOauth) {
              const decrypted = decryptClaudeData(data.claudeAiOauth)
              try {
                data.claudeAiOauth = JSON.parse(decrypted)
              } catch (e) {
                data.claudeAiOauth = decrypted
              }
            }
          }
          claudeAccounts.push(data)
        }
      }
      exportDataObj.data.claudeAccounts = claudeAccounts

      // Gemini 账户
      const geminiKeys = await client.keys('gemini_account:*')
      const geminiAccounts = []
      for (const key of geminiKeys) {
        const data = await client.hgetall(key)
        if (data && Object.keys(data).length > 0) {
          if (decrypt) {
            if (data.geminiOauth) {
              const decrypted = decryptGeminiData(data.geminiOauth)
              try {
                data.geminiOauth = JSON.parse(decrypted)
              } catch (e) {
                data.geminiOauth = decrypted
              }
            }
            if (data.accessToken) data.accessToken = decryptGeminiData(data.accessToken)
            if (data.refreshToken) data.refreshToken = decryptGeminiData(data.refreshToken)
          }
          geminiAccounts.push(data)
        }
      }
      exportDataObj.data.geminiAccounts = geminiAccounts

      logger.info(`✅ Exported ${claudeAccounts.length} Claude accounts and ${geminiAccounts.length} Gemini accounts`)
    }

    // 导出用户
    if (types.includes('all') || types.includes('users')) {
      logger.info('📤 Exporting users...')
      const users = await userService.getAllUsers()
      exportDataObj.data.users = users
      logger.info(`✅ Exported ${users.length} users`)
    }

    // 导出套餐
    if (types.includes('all') || types.includes('plans')) {
      logger.info('📤 Exporting plans...')
      const plans = await planService.getAllPlans(true) // includeInactive
      exportDataObj.data.plans = plans
      logger.info(`✅ Exported ${plans.length} plans`)
    }

    // 导出 API Key 模板
    if (types.includes('all') || types.includes('apiKeyTemplates')) {
      logger.info('📤 Exporting API Key templates...')
      const templates = await apiKeyTemplateService.getAllTemplates()
      exportDataObj.data.apiKeyTemplates = templates
      logger.info(`✅ Exported ${templates.length} API Key templates`)
    }

    // 导出订单
    if (types.includes('all') || types.includes('orders')) {
      logger.info('📤 Exporting orders...')
      const orders = await orderService.getAllOrders()
      exportDataObj.data.orders = orders
      logger.info(`✅ Exported ${orders.length} orders`)
    }

    // 导出公告
    if (types.includes('all') || types.includes('announcements')) {
      logger.info('📤 Exporting announcements...')
      const announcements = await redis.getAllAnnouncements(false) // includeInactive
      exportDataObj.data.announcements = announcements
      logger.info(`✅ Exported ${announcements.length} announcements`)
    }

    // 导出教程
    if (types.includes('all') || types.includes('tutorials')) {
      logger.info('📤 Exporting tutorials...')
      const tutorials = await redis.getAllTutorials(false) // includeInactive
      exportDataObj.data.tutorials = tutorials
      logger.info(`✅ Exported ${tutorials.length} tutorials`)
    }

    // 计算总记录数
    let totalRecords = 0
    Object.values(exportDataObj.data).forEach((arr) => {
      if (Array.isArray(arr)) {
        totalRecords += arr.length
      }
    })
    exportDataObj.metadata.totalRecords = totalRecords

    return exportDataObj
  } catch (error) {
    logger.error('❌ Failed to export data:', error)
    throw error
  }
}

// 导入数据
async function importData(importDataObj, options = {}) {
  try {
    const { force = false, skipConflicts = false, types = ['all'] } = options

    // 验证文件格式
    if (!importDataObj.metadata || !importDataObj.data) {
      throw new Error('Invalid backup file format')
    }

    const client = redis.getClientSafe()
    const stats = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: {}
    }

    // 导入 API Keys
    if ((types.includes('all') || types.includes('apikeys')) && importDataObj.data.apiKeys) {
      logger.info('📥 Importing API Keys...')
      const apiKeyStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const apiKey of importDataObj.data.apiKeys) {
        try {
          const exists = await client.exists(`apikey:${apiKey.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              apiKeyStats.skipped++
              continue
            } else {
              // 在API中，默认跳过冲突
              apiKeyStats.skipped++
              continue
            }
          }

          // 保存 API Key
          const pipeline = client.pipeline()
          for (const [field, value] of Object.entries(apiKey)) {
            if (field !== 'usageStats') {
              pipeline.hset(`apikey:${apiKey.id}`, field, value)
            }
          }
          await pipeline.exec()

          // 更新哈希映射（如果有）
          if (apiKey.apiKey && !importDataObj.metadata.sanitized) {
            await client.hset('apikey:hash_map', apiKey.apiKey, apiKey.id)
          }

          apiKeyStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import API Key ${apiKey.id}:`, error.message)
          apiKeyStats.errors++
        }
      }
      
      stats.details.apikeys = apiKeyStats
      stats.imported += apiKeyStats.imported
      stats.skipped += apiKeyStats.skipped
      stats.errors += apiKeyStats.errors
    }

    // 导入账户
    if ((types.includes('all') || types.includes('accounts')) && importDataObj.data.claudeAccounts) {
      logger.info('📥 Importing Claude accounts...')
      const accountStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const account of importDataObj.data.claudeAccounts) {
        try {
          const exists = await client.exists(`claude:account:${account.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              accountStats.skipped++
              continue
            } else {
              accountStats.skipped++
              continue
            }
          }

          // 如果数据已解密，需要重新加密
          const accountData = { ...account }
          if (importDataObj.metadata.decrypted && !importDataObj.metadata.sanitized) {
            if (accountData.email) accountData.email = encryptClaudeData(accountData.email)
            if (accountData.password) accountData.password = encryptClaudeData(accountData.password)
            if (accountData.accessToken) accountData.accessToken = encryptClaudeData(accountData.accessToken)
            if (accountData.refreshToken) accountData.refreshToken = encryptClaudeData(accountData.refreshToken)
            if (accountData.claudeAiOauth) {
              const oauthStr = typeof accountData.claudeAiOauth === 'object' 
                ? JSON.stringify(accountData.claudeAiOauth) 
                : accountData.claudeAiOauth
              accountData.claudeAiOauth = encryptClaudeData(oauthStr)
            }
          }

          const pipeline = client.pipeline()
          for (const [field, value] of Object.entries(accountData)) {
            pipeline.hset(`claude:account:${account.id}`, field, value)
          }
          await pipeline.exec()

          accountStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import Claude account ${account.id}:`, error.message)
          accountStats.errors++
        }
      }
      
      stats.details.claudeAccounts = accountStats
      stats.imported += accountStats.imported
      stats.skipped += accountStats.skipped
      stats.errors += accountStats.errors
    }

    // 导入 Gemini 账户
    if ((types.includes('all') || types.includes('accounts')) && importDataObj.data.geminiAccounts) {
      logger.info('📥 Importing Gemini accounts...')
      const accountStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const account of importDataObj.data.geminiAccounts) {
        try {
          const exists = await client.exists(`gemini_account:${account.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              accountStats.skipped++
              continue
            } else {
              accountStats.skipped++
              continue
            }
          }

          const accountData = { ...account }
          if (importDataObj.metadata.decrypted && !importDataObj.metadata.sanitized) {
            if (accountData.geminiOauth) {
              const oauthStr = typeof accountData.geminiOauth === 'object'
                ? JSON.stringify(accountData.geminiOauth)
                : accountData.geminiOauth
              accountData.geminiOauth = encryptGeminiData(oauthStr)
            }
            if (accountData.accessToken) accountData.accessToken = encryptGeminiData(accountData.accessToken)
            if (accountData.refreshToken) accountData.refreshToken = encryptGeminiData(accountData.refreshToken)
          }

          const pipeline = client.pipeline()
          for (const [field, value] of Object.entries(accountData)) {
            pipeline.hset(`gemini_account:${account.id}`, field, value)
          }
          await pipeline.exec()

          accountStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import Gemini account ${account.id}:`, error.message)
          accountStats.errors++
        }
      }
      
      stats.details.geminiAccounts = accountStats
      stats.imported += accountStats.imported
      stats.skipped += accountStats.skipped
      stats.errors += accountStats.errors
    }

    // 导入用户（简化版，使用 userService）
    if ((types.includes('all') || types.includes('users')) && importDataObj.data.users) {
      logger.info('📥 Importing users...')
      const userStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const user of importDataObj.data.users) {
        try {
          // 这里需要实现用户导入逻辑
          // 暂时跳过，因为用户创建需要密码处理等
          userStats.skipped++
        } catch (error) {
          logger.error(`❌ Failed to import user ${user.id}:`, error.message)
          userStats.errors++
        }
      }
      
      stats.details.users = userStats
      stats.skipped += userStats.skipped
      stats.errors += userStats.errors
    }

    // 导入套餐
    if ((types.includes('all') || types.includes('plans')) && importDataObj.data.plans) {
      logger.info('📥 Importing plans...')
      const planStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const plan of importDataObj.data.plans) {
        try {
          const exists = await client.exists(`plan:${plan.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              planStats.skipped++
              continue
            } else {
              planStats.skipped++
              continue
            }
          }

          await redis.createPlan(plan)
          planStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import plan ${plan.id}:`, error.message)
          planStats.errors++
        }
      }
      
      stats.details.plans = planStats
      stats.imported += planStats.imported
      stats.skipped += planStats.skipped
      stats.errors += planStats.errors
    }

    // 导入 API Key 模板
    if ((types.includes('all') || types.includes('apiKeyTemplates')) && importDataObj.data.apiKeyTemplates) {
      logger.info('📥 Importing API Key templates...')
      const templateStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const template of importDataObj.data.apiKeyTemplates) {
        try {
          const exists = await client.exists(`apikey_template:${template.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              templateStats.skipped++
              continue
            } else {
              templateStats.skipped++
              continue
            }
          }

          await redis.createApiKeyTemplate(template)
          templateStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import API Key template ${template.id}:`, error.message)
          templateStats.errors++
        }
      }
      
      stats.details.apiKeyTemplates = templateStats
      stats.imported += templateStats.imported
      stats.skipped += templateStats.skipped
      stats.errors += templateStats.errors
    }

    // 导入订单
    if ((types.includes('all') || types.includes('orders')) && importDataObj.data.orders) {
      logger.info('📥 Importing orders...')
      const orderStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const order of importDataObj.data.orders) {
        try {
          const exists = await client.exists(`order:${order.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              orderStats.skipped++
              continue
            } else {
              orderStats.skipped++
              continue
            }
          }

          await redis.createOrder(order)
          orderStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import order ${order.id}:`, error.message)
          orderStats.errors++
        }
      }
      
      stats.details.orders = orderStats
      stats.imported += orderStats.imported
      stats.skipped += orderStats.skipped
      stats.errors += orderStats.errors
    }

    // 导入公告
    if ((types.includes('all') || types.includes('announcements')) && importDataObj.data.announcements) {
      logger.info('📥 Importing announcements...')
      const announcementStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const announcement of importDataObj.data.announcements) {
        try {
          const exists = await client.exists(`announcement:${announcement.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              announcementStats.skipped++
              continue
            } else {
              announcementStats.skipped++
              continue
            }
          }

          await redis.createAnnouncement(announcement)
          announcementStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import announcement ${announcement.id}:`, error.message)
          announcementStats.errors++
        }
      }
      
      stats.details.announcements = announcementStats
      stats.imported += announcementStats.imported
      stats.skipped += announcementStats.skipped
      stats.errors += announcementStats.errors
    }

    // 导入教程
    if ((types.includes('all') || types.includes('tutorials')) && importDataObj.data.tutorials) {
      logger.info('📥 Importing tutorials...')
      const tutorialStats = { imported: 0, skipped: 0, errors: 0 }
      
      for (const tutorial of importDataObj.data.tutorials) {
        try {
          const exists = await client.exists(`tutorial:${tutorial.id}`)

          if (exists && !force) {
            if (skipConflicts) {
              tutorialStats.skipped++
              continue
            } else {
              tutorialStats.skipped++
              continue
            }
          }

          await redis.createTutorial(tutorial)
          tutorialStats.imported++
        } catch (error) {
          logger.error(`❌ Failed to import tutorial ${tutorial.id}:`, error.message)
          tutorialStats.errors++
        }
      }
      
      stats.details.tutorials = tutorialStats
      stats.imported += tutorialStats.imported
      stats.skipped += tutorialStats.skipped
      stats.errors += tutorialStats.errors
    }

    return stats
  } catch (error) {
    logger.error('❌ Failed to import data:', error)
    throw error
  }
}

module.exports = {
  getExportPreview,
  exportData,
  importData
}

