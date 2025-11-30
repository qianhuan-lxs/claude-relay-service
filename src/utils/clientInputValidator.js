const logger = require('./logger')

class ClientInputValidator {
  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {string} - Validated username
   * @throws {Error} - If validation fails
   */
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('用户名不能为空')
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3) {
      throw new Error('用户名至少需要3个字符')
    }

    if (trimmedUsername.length > 30) {
      throw new Error('用户名不能超过30个字符')
    }

    // Allow alphanumeric characters, underscores, and Chinese characters
    // Unicode ranges: \u4e00-\u9fa5 (CJK统一汉字), \u3400-\u4db5 (CJK扩展A)
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5\u3400-\u4db5]+$/
    if (!usernameRegex.test(trimmedUsername)) {
      throw new Error('用户名只能包含字母、数字、下划线和中文')
    }

    // Cannot start with underscore
    if (trimmedUsername.startsWith('_')) {
      throw new Error('用户名不能以下划线开头')
    }

    // Cannot end with underscore
    if (trimmedUsername.endsWith('_')) {
      throw new Error('用户名不能以下划线结尾')
    }

    // 对于包含中文的用户名，不转换为小写（保持原样）
    // 对于纯英文的用户名，转换为小写
    if (/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return trimmedUsername.toLowerCase()
    }
    return trimmedUsername
  }

  /**
   * Validate email format (RFC 5322 compliant)
   * @param {string} email - Email to validate
   * @returns {string} - Validated email
   * @throws {Error} - If validation fails
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('邮箱地址不能为空')
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail.length === 0) {
      throw new Error('邮箱地址不能为空')
    }

    if (trimmedEmail.length > 254) {
      throw new Error('邮箱地址过长')
    }

    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('邮箱格式无效')
    }

    // Additional checks
    if (trimmedEmail.includes('..')) {
      throw new Error('邮箱地址不能包含连续的点')
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      throw new Error('邮箱地址不能以点开头或结尾')
    }

    return trimmedEmail
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {string} - Validated password
   * @throws {Error} - If validation fails
   */
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('密码不能为空')
    }

    // 只检查基本要求：长度
    // 其他要求（大小写、数字等）只是建议，不在后端强制验证
    if (password.length < 1) {
      throw new Error('密码不能为空')
    }

    if (password.length > 128) {
      throw new Error('密码过长（最多128个字符）')
    }

    return password
  }

  /**
   * Validate all registration input
   * @param {Object} input - Registration input object
   * @param {string} input.username - Username
   * @param {string} input.email - Email
   * @param {string} input.password - Password
   * @returns {Object} - Validated input object
   * @throws {Error} - If validation fails
   */
  static validateRegistrationInput(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('注册数据不能为空')
    }

    const { username, email, password } = input

    try {
      const validatedUsername = this.validateUsername(username)
      const validatedEmail = this.validateEmail(email)
      const validatedPassword = this.validatePassword(password)

      return {
        username: validatedUsername,
        email: validatedEmail,
        password: validatedPassword
      }
    } catch (error) {
      logger.debug(`Input validation failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Validate login input
   * @param {Object} input - Login input object
   * @param {string} input.username - Username or email
   * @param {string} input.password - Password
   * @returns {Object} - Validated input object
   * @throws {Error} - If validation fails
   */
  static validateLoginInput(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('登录数据不能为空')
    }

    const { username, password } = input

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('用户名或邮箱不能为空')
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new Error('密码不能为空')
    }

    // 对于包含中文的用户名，不转换为小写（保持原样）
    // 对于纯英文的用户名，转换为小写
    const trimmedUsername = username.trim()
    const normalizedUsername = /^[a-zA-Z0-9_]+$/.test(trimmedUsername)
      ? trimmedUsername.toLowerCase()
      : trimmedUsername

    return {
      username: normalizedUsername,
      password
    }
  }
}

module.exports = ClientInputValidator
