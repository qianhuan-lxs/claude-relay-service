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
      throw new Error('Username is required')
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    if (trimmedUsername.length > 30) {
      throw new Error('Username must be no more than 30 characters long')
    }

    // Allow alphanumeric characters and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(trimmedUsername)) {
      throw new Error('Username can only contain letters, numbers, and underscores')
    }

    // Cannot start with underscore
    if (trimmedUsername.startsWith('_')) {
      throw new Error('Username cannot start with an underscore')
    }

    // Cannot end with underscore
    if (trimmedUsername.endsWith('_')) {
      throw new Error('Username cannot end with an underscore')
    }

    return trimmedUsername.toLowerCase()
  }

  /**
   * Validate email format (RFC 5322 compliant)
   * @param {string} email - Email to validate
   * @returns {string} - Validated email
   * @throws {Error} - If validation fails
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required')
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail.length === 0) {
      throw new Error('Email cannot be empty')
    }

    if (trimmedEmail.length > 254) {
      throw new Error('Email is too long')
    }

    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format')
    }

    // Additional checks
    if (trimmedEmail.includes('..')) {
      throw new Error('Email cannot contain consecutive dots')
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      throw new Error('Email cannot start or end with a dot')
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
      throw new Error('Password is required')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      throw new Error('Password is too long (maximum 128 characters)')
    }

    // Check for common weak patterns
    if (password === password.toLowerCase()) {
      throw new Error('Password must contain at least one uppercase letter')
    }

    if (password === password.toUpperCase()) {
      throw new Error('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number')
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey'
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new Error('Password is too common, please choose a stronger password')
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
      throw new Error('Registration data is required')
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
      throw new Error('Login data is required')
    }

    const { username, password } = input

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error('Username or email is required')
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new Error('Password is required')
    }

    return {
      username: username.trim().toLowerCase(),
      password
    }
  }
}

module.exports = ClientInputValidator
