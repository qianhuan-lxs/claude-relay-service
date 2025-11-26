const redis = require('../models/redis')
const crypto = require('crypto')
const logger = require('../utils/logger')
const config = require('../../config/config')

class UserService {
  constructor() {
    this.userPrefix = 'user:'
    this.usernamePrefix = 'username:'
    this.userSessionPrefix = 'user_session:'
  }

  // 🔑 生成用户ID
  generateUserId() {
    return crypto.randomBytes(16).toString('hex')
  }

  // 🔑 生成会话Token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  // 👤 创建或更新用户
  async createOrUpdateUser(userData) {
    try {
      const {
        username,
        email,
        displayName,
        firstName,
        lastName,
        role = config.userManagement.defaultUserRole,
        isActive = true
      } = userData

      // 检查用户是否已存在
      let user = await this.getUserByUsername(username)
      const isNewUser = !user

      if (isNewUser) {
        const userId = this.generateUserId()
        user = {
          id: userId,
          username,
          email,
          displayName,
          firstName,
          lastName,
          role,
          isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          apiKeyCount: 0,
          totalUsage: {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0
          }
        }
      } else {
        // 更新现有用户信息
        user = {
          ...user,
          email,
          displayName,
          firstName,
          lastName,
          updatedAt: new Date().toISOString()
        }
      }

      // 保存用户信息
      await redis.set(`${this.userPrefix}${user.id}`, JSON.stringify(user))
      await redis.set(`${this.usernamePrefix}${username}`, user.id)

      // 如果是新用户，尝试转移匹配的API Keys
      if (isNewUser) {
        await this.transferMatchingApiKeys(user)
      }

      logger.info(`📝 ${isNewUser ? 'Created' : 'Updated'} user: ${username} (${user.id})`)
      return user
    } catch (error) {
      logger.error('❌ Error creating/updating user:', error)
      throw error
    }
  }

  // 👤 通过用户名获取用户
  async getUserByUsername(username) {
    try {
      const userId = await redis.get(`${this.usernamePrefix}${username}`)
      if (!userId) {
        return null
      }

      const userData = await redis.get(`${this.userPrefix}${userId}`)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      logger.error('❌ Error getting user by username:', error)
      throw error
    }
  }

  // 👤 通过邮箱获取用户
  async getUserByEmail(email) {
    try {
      const client = redis.getClientSafe()

      // 查找所有用户
      const ldapKeys = await client.keys(`${this.userPrefix}*`)
      const clientKeys = await client.keys(`client_user:*`)
      const allKeys = [...ldapKeys, ...clientKeys]

      for (const key of allKeys) {
        try {
          const type = await client.type(key)
          if (type !== 'string') {
            continue
          }

          const userData = await client.get(key)
          if (userData) {
            let user = JSON.parse(userData)

            // 检查邮箱是否匹配（不区分大小写）
            if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
              // 处理客户端用户：转换为统一格式
              if (key.startsWith('client_user:')) {
                user = {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  displayName: user.displayName || user.username,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  role: user.role || 'user',
                  isActive: user.isActive !== false,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt || user.createdAt,
                  lastLoginAt: user.lastLoginAt || null
                }
              }

              return user
            }
          }
        } catch (error) {
          // 忽略单个用户的解析错误，继续查找
          continue
        }
      }

      return null
    } catch (error) {
      logger.error('❌ Error getting user by email:', error)
      throw error
    }
  }

  // 👤 通过ID获取用户
  async getUserById(userId, calculateUsage = true) {
    try {
      // 先尝试查找 LDAP 用户
      let userData = await redis.get(`${this.userPrefix}${userId}`)
      let isClientUser = false

      // 如果没找到，尝试查找客户端注册的用户
      if (!userData) {
        userData = await redis.get(`client_user:${userId}`)
        isClientUser = true
      }

      if (!userData) {
        return null
      }

      let user = JSON.parse(userData)

      // 如果是客户端用户，转换为统一格式
      if (isClientUser) {
        user = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName || user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || 'user',
          isActive: user.isActive !== false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt || user.createdAt,
          lastLoginAt: user.lastLoginAt || null,
          apiKeyCount: 0,
          totalUsage: {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0
          }
        }
      }

      // 确保必要的字段存在
      if (!user.role) {
        user.role = 'user'
      }
      if (typeof user.isActive === 'undefined') {
        user.isActive = true
      }
      if (!user.displayName) {
        user.displayName = user.username
      }

      // Calculate totalUsage by aggregating user's API keys usage (if requested)
      if (calculateUsage) {
        try {
          const usageStats = await this.calculateUserUsageStats(userId)
          user.totalUsage = usageStats.totalUsage
          user.apiKeyCount = usageStats.apiKeyCount
        } catch (error) {
          logger.error('❌ Error calculating user usage stats:', error)
          // Fallback to stored values if calculation fails
          user.totalUsage = user.totalUsage || {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalCost: 0
          }
          user.apiKeyCount = user.apiKeyCount || 0
        }
      }

      return user
    } catch (error) {
      logger.error('❌ Error getting user by ID:', error)
      throw error
    }
  }

  // 📊 计算用户使用统计（通过聚合API Keys）
  async calculateUserUsageStats(userId) {
    try {
      // Use the existing apiKeyService method which already includes usage stats
      const apiKeyService = require('./apiKeyService')
      const userApiKeys = await apiKeyService.getUserApiKeys(userId, true) // Include deleted keys for stats

      const totalUsage = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0
      }

      for (const apiKey of userApiKeys) {
        if (apiKey.usage && apiKey.usage.total) {
          totalUsage.requests += apiKey.usage.total.requests || 0
          totalUsage.inputTokens += apiKey.usage.total.inputTokens || 0
          totalUsage.outputTokens += apiKey.usage.total.outputTokens || 0
          totalUsage.totalCost += apiKey.totalCost || 0
        }
      }

      logger.debug(
        `📊 Calculated user ${userId} usage: ${totalUsage.requests} requests, ${totalUsage.inputTokens} input tokens, $${totalUsage.totalCost.toFixed(4)} total cost from ${userApiKeys.length} API keys`
      )

      // Count only non-deleted API keys for the user's active count
      const activeApiKeyCount = userApiKeys.filter((key) => key.isDeleted !== 'true').length

      return {
        totalUsage,
        apiKeyCount: activeApiKeyCount
      }
    } catch (error) {
      logger.error('❌ Error calculating user usage stats:', error)
      return {
        totalUsage: {
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0
        },
        apiKeyCount: 0
      }
    }
  }

  // 📋 获取所有用户列表（管理员功能）
  async getAllUsers(options = {}) {
    try {
      const client = redis.getClientSafe()
      const { page = 1, limit = 20, role, isActive } = options

      // 同时查找 LDAP 用户和客户端注册的用户
      const ldapKeys = await client.keys(`${this.userPrefix}*`)
      const clientKeys = await client.keys(`client_user:*`)
      const allKeys = [...ldapKeys, ...clientKeys]

      const users = []
      for (const key of allKeys) {
        try {
          // 只处理字符串类型的 key
          const type = await client.type(key)
          if (type !== 'string') {
            logger.debug(`⚠️ Skipping key ${key} with type ${type}`)
            continue
          }

          const userData = await client.get(key)
          if (userData) {
            let user = JSON.parse(userData)

            // 处理客户端用户：转换为统一格式
            if (key.startsWith('client_user:')) {
              user = {
                id: String(user.id), // 确保 ID 是字符串类型
                username: user.username,
                email: user.email,
                displayName: user.displayName || user.username,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role || 'user', // 客户端用户默认为 'user'
                isActive: user.isActive !== false,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt || user.createdAt,
                lastLoginAt: user.lastLoginAt || null,
                apiKeyCount: 0,
                totalUsage: {
                  requests: 0,
                  inputTokens: 0,
                  outputTokens: 0,
                  totalCost: 0
                }
              }
            }

            // 确保必要的字段存在
            if (!user.role) {
              user.role = 'user'
            }
            if (typeof user.isActive === 'undefined') {
              user.isActive = true
            }
            if (!user.displayName) {
              user.displayName = user.username
            }

            // 应用过滤条件
            if (role && user.role !== role) {
              continue
            }
            if (typeof isActive === 'boolean' && user.isActive !== isActive) {
              continue
            }

            // Calculate dynamic usage stats for each user
            try {
              const usageStats = await this.calculateUserUsageStats(user.id)
              user.totalUsage = usageStats.totalUsage
              user.apiKeyCount = usageStats.apiKeyCount
            } catch (error) {
              logger.error(`❌ Error calculating usage for user ${user.id}:`, error)
              // Fallback to stored values
              user.totalUsage = user.totalUsage || {
                requests: 0,
                inputTokens: 0,
                outputTokens: 0,
                totalCost: 0
              }
              user.apiKeyCount = user.apiKeyCount || 0
            }

            users.push(user)
          }
        } catch (error) {
          // 跳过类型不匹配或解析错误的 key
          if (error.message && error.message.includes('WRONGTYPE')) {
            logger.debug(`⚠️ Skipping key ${key} due to wrong type: ${error.message}`)
          } else {
            logger.error(`❌ Error processing user key ${key}:`, error)
          }
          continue
        }
      }

      // 排序和分页
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedUsers = users.slice(startIndex, endIndex)

      return {
        users: paginatedUsers,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      }
    } catch (error) {
      logger.error('❌ Error getting all users:', error)
      throw error
    }
  }

  // 🔄 更新用户状态
  async updateUserStatus(userId, isActive) {
    try {
      const user = await this.getUserById(userId, false) // Skip usage calculation
      if (!user) {
        throw new Error('User not found')
      }

      user.isActive = isActive
      user.updatedAt = new Date().toISOString()

      await redis.set(`${this.userPrefix}${userId}`, JSON.stringify(user))
      logger.info(`🔄 Updated user status: ${user.username} -> ${isActive ? 'active' : 'disabled'}`)

      // 如果禁用用户，删除所有会话并禁用其所有API Keys
      if (!isActive) {
        await this.invalidateUserSessions(userId)

        // Disable all user's API keys when user is disabled
        try {
          const apiKeyService = require('./apiKeyService')
          const result = await apiKeyService.disableUserApiKeys(userId)
          logger.info(`🔑 Disabled ${result.count} API keys for disabled user: ${user.username}`)
        } catch (error) {
          logger.error('❌ Error disabling user API keys during user disable:', error)
        }
      }

      return user
    } catch (error) {
      logger.error('❌ Error updating user status:', error)
      throw error
    }
  }

  // 🔄 更新用户角色
  async updateUserRole(userId, role) {
    try {
      const user = await this.getUserById(userId, false) // Skip usage calculation
      if (!user) {
        throw new Error('User not found')
      }

      user.role = role
      user.updatedAt = new Date().toISOString()

      await redis.set(`${this.userPrefix}${userId}`, JSON.stringify(user))
      logger.info(`🔄 Updated user role: ${user.username} -> ${role}`)

      return user
    } catch (error) {
      logger.error('❌ Error updating user role:', error)
      throw error
    }
  }

  // 📊 更新用户API Key数量 (已废弃，现在通过聚合计算)
  async updateUserApiKeyCount(userId, _count) {
    // This method is deprecated since apiKeyCount is now calculated dynamically
    // in getUserById by aggregating the user's API keys
    logger.debug(
      `📊 updateUserApiKeyCount called for ${userId} but is now deprecated (count auto-calculated)`
    )
  }

  // 📝 记录用户登录
  async recordUserLogin(userId) {
    try {
      const user = await this.getUserById(userId, false) // Skip usage calculation
      if (!user) {
        return
      }

      user.lastLoginAt = new Date().toISOString()
      await redis.set(`${this.userPrefix}${userId}`, JSON.stringify(user))
    } catch (error) {
      logger.error('❌ Error recording user login:', error)
    }
  }

  // 🎫 创建用户会话
  async createUserSession(userId, sessionData = {}) {
    try {
      const sessionToken = this.generateSessionToken()
      const session = {
        token: sessionToken,
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + config.userManagement.userSessionTimeout).toISOString(),
        ...sessionData
      }

      const ttl = Math.floor(config.userManagement.userSessionTimeout / 1000)
      await redis.setex(`${this.userSessionPrefix}${sessionToken}`, ttl, JSON.stringify(session))

      logger.info(`🎫 Created session for user: ${userId}`)
      return sessionToken
    } catch (error) {
      logger.error('❌ Error creating user session:', error)
      throw error
    }
  }

  // 🎫 验证用户会话
  async validateUserSession(sessionToken) {
    try {
      const sessionData = await redis.get(`${this.userSessionPrefix}${sessionToken}`)
      if (!sessionData) {
        return null
      }

      const session = JSON.parse(sessionData)

      // 检查会话是否过期
      if (new Date() > new Date(session.expiresAt)) {
        await this.invalidateUserSession(sessionToken)
        return null
      }

      // 获取用户信息
      const user = await this.getUserById(session.userId, false) // Skip usage calculation for validation
      if (!user || !user.isActive) {
        await this.invalidateUserSession(sessionToken)
        return null
      }

      return { session, user }
    } catch (error) {
      logger.error('❌ Error validating user session:', error)
      return null
    }
  }

  // 🚫 使用户会话失效
  async invalidateUserSession(sessionToken) {
    try {
      await redis.del(`${this.userSessionPrefix}${sessionToken}`)
      logger.info(`🚫 Invalidated session: ${sessionToken}`)
    } catch (error) {
      logger.error('❌ Error invalidating user session:', error)
    }
  }

  // 🚫 使用户所有会话失效
  async invalidateUserSessions(userId) {
    try {
      const client = redis.getClientSafe()
      const pattern = `${this.userSessionPrefix}*`
      const keys = await client.keys(pattern)

      for (const key of keys) {
        const sessionData = await client.get(key)
        if (sessionData) {
          const session = JSON.parse(sessionData)
          if (session.userId === userId) {
            await client.del(key)
          }
        }
      }

      logger.info(`🚫 Invalidated all sessions for user: ${userId}`)
    } catch (error) {
      logger.error('❌ Error invalidating user sessions:', error)
    }
  }

  // 🗑️ 删除用户（软删除，标记为不活跃）
  async deleteUser(userId) {
    try {
      const user = await this.getUserById(userId, false) // Skip usage calculation
      if (!user) {
        throw new Error('User not found')
      }

      // 软删除：标记为不活跃并添加删除时间戳
      user.isActive = false
      user.deletedAt = new Date().toISOString()
      user.updatedAt = new Date().toISOString()

      await redis.set(`${this.userPrefix}${userId}`, JSON.stringify(user))

      // 删除所有会话
      await this.invalidateUserSessions(userId)

      // Disable all user's API keys when user is deleted
      try {
        const apiKeyService = require('./apiKeyService')
        const result = await apiKeyService.disableUserApiKeys(userId)
        logger.info(`🔑 Disabled ${result.count} API keys for deleted user: ${user.username}`)
      } catch (error) {
        logger.error('❌ Error disabling user API keys during user deletion:', error)
      }

      logger.info(`🗑️ Soft deleted user: ${user.username} (${userId})`)
      return user
    } catch (error) {
      logger.error('❌ Error deleting user:', error)
      throw error
    }
  }

  // 📊 获取用户统计信息
  async getUserStats() {
    try {
      const client = redis.getClientSafe()
      const apiKeyService = require('./apiKeyService')

      // 同时查找 LDAP 用户和客户端注册的用户
      const ldapKeys = await client.keys(`${this.userPrefix}*`)
      const clientKeys = await client.keys(`client_user:*`)
      const allKeys = [...ldapKeys, ...clientKeys]

      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        totalApiKeys: 0,
        totalUsage: {
          requests: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0
        }
      }

      // 统计用户信息
      for (const key of allKeys) {
        try {
          // 只处理字符串类型的 key
          const type = await client.type(key)
          if (type !== 'string') {
            logger.debug(`⚠️ Skipping key ${key} with type ${type} in stats`)
            continue
          }

          const userData = await client.get(key)
          if (userData) {
            let user = JSON.parse(userData)

            // 处理客户端用户：转换为统一格式
            if (key.startsWith('client_user:')) {
              user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user', // 客户端用户默认为 'user'
                isActive: user.isActive !== false,
                apiKeyCount: 0,
                totalUsage: {
                  requests: 0,
                  inputTokens: 0,
                  outputTokens: 0,
                  totalCost: 0
                }
              }
            }

            // 确保必要的字段存在
            if (!user.role) {
              user.role = 'user'
            }
            if (typeof user.isActive === 'undefined') {
              user.isActive = true
            }

            stats.totalUsers++

            if (user.isActive) {
              stats.activeUsers++
            }

            if (user.role === 'admin') {
              stats.adminUsers++
            } else {
              stats.regularUsers++
            }
          }
        } catch (error) {
          // 跳过类型不匹配或解析错误的 key
          if (error.message && error.message.includes('WRONGTYPE')) {
            logger.debug(`⚠️ Skipping key ${key} due to wrong type in stats: ${error.message}`)
          } else {
            logger.error(`❌ Error processing user key ${key} in stats:`, error)
          }
          continue
        }
      }

      // 统计所有 API keys 的使用情况（与 /admin/dashboard 保持一致）
      // 直接获取所有 API keys 并累加使用统计，而不是通过用户来累加
      try {
        const allApiKeys = await apiKeyService.getAllApiKeys(false) // 不包括已删除的

        stats.totalApiKeys = allApiKeys.length

        // 累加所有 API keys 的使用统计
        for (const apiKey of allApiKeys) {
          if (apiKey.usage && apiKey.usage.total) {
            stats.totalUsage.requests += apiKey.usage.total.requests || 0
            stats.totalUsage.inputTokens += apiKey.usage.total.inputTokens || 0
            stats.totalUsage.outputTokens += apiKey.usage.total.outputTokens || 0
            // 使用 totalCost 字段（与 /admin/dashboard 保持一致）
            stats.totalUsage.totalCost +=
              apiKey.totalCost || apiKey.usage.total.cost || apiKey.usage.total.totalCost || 0
          }
        }

        logger.debug(
          `📊 User stats: ${stats.totalUsers} users, ${stats.totalApiKeys} API keys, ${stats.totalUsage.requests} requests, $${stats.totalUsage.totalCost.toFixed(4)} total cost`
        )
      } catch (error) {
        logger.error('❌ Error calculating API key stats in getUserStats:', error)
        // 如果获取所有 API keys 失败，回退到通过用户累加的方式
        for (const key of allKeys) {
          try {
            const type = await client.type(key)
            if (type !== 'string') {
              continue
            }

            const userData = await client.get(key)
            if (userData) {
              let user = JSON.parse(userData)
              if (key.startsWith('client_user:')) {
                user = {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  role: user.role || 'user',
                  isActive: user.isActive !== false
                }
              }

              try {
                const usageStats = await this.calculateUserUsageStats(user.id)
                stats.totalApiKeys += usageStats.apiKeyCount
                stats.totalUsage.requests += usageStats.totalUsage.requests
                stats.totalUsage.inputTokens += usageStats.totalUsage.inputTokens
                stats.totalUsage.outputTokens += usageStats.totalUsage.outputTokens
                stats.totalUsage.totalCost += usageStats.totalUsage.totalCost
              } catch (err) {
                logger.error(`❌ Error calculating usage for user ${user.id} in stats:`, err)
              }
            }
          } catch (err) {
            continue
          }
        }
      }

      return stats
    } catch (error) {
      logger.error('❌ Error getting user stats:', error)
      throw error
    }
  }

  // 🔄 转移匹配的API Keys给新用户
  async transferMatchingApiKeys(user) {
    try {
      const apiKeyService = require('./apiKeyService')
      const { displayName, username, email } = user

      // 获取所有API Keys
      const allApiKeys = await apiKeyService.getAllApiKeys()

      // 找到没有用户ID的API Keys（即由Admin创建的）
      const unownedApiKeys = allApiKeys.filter((key) => !key.userId || key.userId === '')

      if (unownedApiKeys.length === 0) {
        logger.debug(`📝 No unowned API keys found for potential transfer to user: ${username}`)
        return
      }

      // 构建匹配字符串数组（只考虑displayName、username、email，去除空值和重复值）
      const matchStrings = new Set()
      if (displayName) {
        matchStrings.add(displayName.toLowerCase().trim())
      }
      if (username) {
        matchStrings.add(username.toLowerCase().trim())
      }
      if (email) {
        matchStrings.add(email.toLowerCase().trim())
      }

      const matchingKeys = []

      // 查找名称匹配的API Keys（只进行完全匹配）
      for (const apiKey of unownedApiKeys) {
        const keyName = apiKey.name ? apiKey.name.toLowerCase().trim() : ''

        // 检查API Key名称是否与用户信息完全匹配
        for (const matchString of matchStrings) {
          if (keyName === matchString) {
            matchingKeys.push(apiKey)
            break // 找到匹配后跳出内层循环
          }
        }
      }

      // 转移匹配的API Keys
      let transferredCount = 0
      for (const apiKey of matchingKeys) {
        try {
          await apiKeyService.updateApiKey(apiKey.id, {
            userId: user.id,
            userUsername: user.username,
            createdBy: user.username
          })

          transferredCount++
          logger.info(`🔄 Transferred API key "${apiKey.name}" (${apiKey.id}) to user: ${username}`)
        } catch (error) {
          logger.error(`❌ Failed to transfer API key ${apiKey.id} to user ${username}:`, error)
        }
      }

      if (transferredCount > 0) {
        logger.success(
          `🎉 Successfully transferred ${transferredCount} API key(s) to new user: ${username} (${displayName})`
        )
      } else if (matchingKeys.length === 0) {
        logger.debug(`📝 No matching API keys found for user: ${username} (${displayName})`)
      }
    } catch (error) {
      logger.error('❌ Error transferring matching API keys:', error)
      // Don't throw error to prevent blocking user creation
    }
  }
}

module.exports = new UserService()
