const crypto = require('crypto')
const redis = require('../models/redis')
const logger = require('../utils/logger')
const config = require('../../config/config')

class ClientAuthService {
  constructor() {
    this.userPrefix = 'client_user:'
    this.usernamePrefix = 'client_username:'
    this.emailPrefix = 'client_email:'
    this.sessionPrefix = 'client_session:'
    
    // PBKDF2 configuration
    this.pbkdf2Iterations = 100000
    this.pbkdf2KeyLength = 64
    this.pbkdf2Digest = 'sha512'
    this.saltLength = 32
  }

  /**
   * Generate a unique user ID
   * @returns {string} - UUID v4
   */
  generateUserId() {
    return crypto.randomUUID()
  }

  /**
   * Generate a session token
   * @returns {string} - Random hex string
   */
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Hash password using PBKDF2
   * @param {string} password - Plain text password
   * @returns {Object} - Object containing hash and salt
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(this.saltLength).toString('hex')
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      this.pbkdf2Iterations,
      this.pbkdf2KeyLength,
      this.pbkdf2Digest
    ).toString('hex')
    
    return { hash, salt }
  }

  /**
   * Verify password against hash and salt
   * @param {string} password - Plain text password
   * @param {string} hash - Stored password hash
   * @param {string} salt - Stored salt
   * @returns {boolean} - True if password matches
   */
  verifyPassword(password, hash, salt) {
    const hashToVerify = crypto.pbkdf2Sync(
      password,
      salt,
      this.pbkdf2Iterations,
      this.pbkdf2KeyLength,
      this.pbkdf2Digest
    ).toString('hex')
    
    return hash === hashToVerify
  }

  /**
   * Check if username is already taken
   * @param {string} username - Username to check
   * @returns {boolean} - True if username exists
   */
  async isUsernameTaken(username) {
    try {
      const userId = await redis.get(`${this.usernamePrefix}${username}`)
      return userId !== null
    } catch (error) {
      logger.error('❌ Error checking username availability:', error)
      throw error
    }
  }

  /**
   * Check if email is already taken
   * @param {string} email - Email to check
   * @returns {boolean} - True if email exists
   */
  async isEmailTaken(email) {
    try {
      const userId = await redis.get(`${this.emailPrefix}${email}`)
      return userId !== null
    } catch (error) {
      logger.error('❌ Error checking email availability:', error)
      throw error
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Plain text password
   * @returns {Object} - Created user object (without password data)
   */
  async createUser(userData) {
    try {
      const { username, email, password } = userData

      // Check if username is already taken
      if (await this.isUsernameTaken(username)) {
        throw new Error('Username is already taken')
      }

      // Check if email is already taken
      if (await this.isEmailTaken(email)) {
        throw new Error('Email is already registered')
      }

      // Generate user ID and hash password
      const userId = this.generateUserId()
      const { hash, salt } = this.hashPassword(password)

      // Create user object
      const user = {
        id: userId,
        username,
        email,
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        isActive: true
      }

      // Store user data in Redis
      await redis.set(`${this.userPrefix}${userId}`, JSON.stringify(user))
      
      // Create username and email mappings
      await redis.set(`${this.usernamePrefix}${username}`, userId)
      await redis.set(`${this.emailPrefix}${email}`, userId)

      logger.info(`✅ Client user created: ${username} (${userId})`)

      // Return user data without sensitive information
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    } catch (error) {
      logger.error('❌ Error creating client user:', error)
      throw error
    }
  }

  /**
   * Find user by username or email
   * @param {string} identifier - Username or email
   * @returns {Object|null} - User object or null if not found
   */
  async findUserByIdentifier(identifier) {
    try {
      // Try to find by username first
      let userId = await redis.get(`${this.usernamePrefix}${identifier}`)
      
      // If not found by username, try by email
      if (!userId) {
        userId = await redis.get(`${this.emailPrefix}${identifier}`)
      }

      if (!userId) {
        return null
      }

      // Get user data
      const userData = await redis.get(`${this.userPrefix}${userId}`)
      if (!userData) {
        return null
      }

      return JSON.parse(userData)
    } catch (error) {
      logger.error('❌ Error finding user by identifier:', error)
      throw error
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object|null} - User object or null if not found
   */
  async getUserById(userId) {
    try {
      const userData = await redis.get(`${this.userPrefix}${userId}`)
      if (!userData) {
        return null
      }

      return JSON.parse(userData)
    } catch (error) {
      logger.error('❌ Error getting user by ID:', error)
      throw error
    }
  }

  /**
   * Authenticate user credentials
   * @param {string} identifier - Username or email
   * @param {string} password - Plain text password
   * @returns {Object|null} - User object if authentication succeeds, null otherwise
   */
  async authenticateUser(identifier, password) {
    try {
      const user = await this.findUserByIdentifier(identifier)
      
      if (!user) {
        return null
      }

      if (!user.isActive) {
        logger.security(`🚫 Login attempt for inactive user: ${identifier}`)
        return null
      }

      const isValidPassword = this.verifyPassword(password, user.passwordHash, user.salt)
      
      if (!isValidPassword) {
        logger.security(`🚫 Invalid password attempt for user: ${identifier}`)
        return null
      }

      // Update last login time
      user.lastLoginAt = new Date().toISOString()
      await redis.set(`${this.userPrefix}${user.id}`, JSON.stringify(user))

      logger.info(`✅ Client user authenticated: ${user.username}`)

      // Return user data without sensitive information
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    } catch (error) {
      logger.error('❌ Error authenticating user:', error)
      throw error
    }
  }

  /**
   * Create a user session
   * @param {string} userId - User ID
   * @param {Object} userData - User data to store in session
   * @returns {string} - Session token
   */
  async createSession(userId, userData) {
    try {
      const sessionToken = this.generateSessionToken()
      const sessionTimeout = config.clientAuth?.sessionTimeout || (7 * 24 * 60 * 60) // 7 days default
      
      const session = {
        userId,
        username: userData.username,
        email: userData.email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + sessionTimeout * 1000).toISOString()
      }

      // Store session with TTL
      await redis.setex(`${this.sessionPrefix}${sessionToken}`, sessionTimeout, JSON.stringify(session))

      logger.info(`🎫 Client session created for user: ${userData.username}`)

      return sessionToken
    } catch (error) {
      logger.error('❌ Error creating client session:', error)
      throw error
    }
  }

  /**
   * Validate session token
   * @param {string} sessionToken - Session token
   * @returns {Object|null} - Session data if valid, null otherwise
   */
  async validateSession(sessionToken) {
    try {
      const sessionData = await redis.get(`${this.sessionPrefix}${sessionToken}`)
      
      if (!sessionData) {
        return null
      }

      const session = JSON.parse(sessionData)

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.deleteSession(sessionToken)
        return null
      }

      // Verify user still exists and is active
      const user = await this.getUserById(session.userId)
      if (!user || !user.isActive) {
        await this.deleteSession(sessionToken)
        return null
      }

      return session
    } catch (error) {
      logger.error('❌ Error validating client session:', error)
      return null
    }
  }

  /**
   * Delete session
   * @param {string} sessionToken - Session token
   */
  async deleteSession(sessionToken) {
    try {
      await redis.del(`${this.sessionPrefix}${sessionToken}`)
      logger.info(`🚫 Client session deleted: ${sessionToken}`)
    } catch (error) {
      logger.error('❌ Error deleting client session:', error)
    }
  }

  /**
   * Refresh session TTL
   * @param {string} sessionToken - Session token
   * @returns {boolean} - True if session was refreshed
   */
  async refreshSession(sessionToken) {
    try {
      const sessionData = await redis.get(`${this.sessionPrefix}${sessionToken}`)
      
      if (!sessionData) {
        return false
      }

      const session = JSON.parse(sessionData)
      const sessionTimeout = config.clientAuth?.sessionTimeout || (7 * 24 * 60 * 60)

      // Update expiry time
      session.expiresAt = new Date(Date.now() + sessionTimeout * 1000).toISOString()

      // Store with new TTL
      await redis.setex(`${this.sessionPrefix}${sessionToken}`, sessionTimeout, JSON.stringify(session))

      logger.debug(`🔄 Client session refreshed: ${sessionToken}`)

      return true
    } catch (error) {
      logger.error('❌ Error refreshing client session:', error)
      return false
    }
  }

  /**
   * Get user profile (without sensitive data)
   * @param {string} userId - User ID
   * @returns {Object|null} - User profile or null if not found
   */
  async getUserProfile(userId) {
    try {
      const user = await this.getUserById(userId)
      
      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    } catch (error) {
      logger.error('❌ Error getting user profile:', error)
      throw error
    }
  }
}

module.exports = new ClientAuthService()
