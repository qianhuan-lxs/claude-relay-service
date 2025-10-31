const clientAuthService = require('../services/clientAuthService')
const logger = require('../utils/logger')

/**
 * Client authentication middleware
 * Validates session token and attaches user data to request
 */
const authenticateClient = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required'
      })
    }

    // Validate session token
    const session = await clientAuthService.validateSession(token)

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session token'
      })
    }

    // Attach user data to request
    req.clientUser = {
      id: session.userId,
      username: session.username,
      email: session.email
    }

    // Attach session token for potential use in routes
    req.clientSessionToken = token

    next()
  } catch (error) {
    logger.error('❌ Client authentication middleware error:', error)
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    })
  }
}

/**
 * Optional client authentication middleware
 * Similar to authenticateClient but doesn't fail if no token provided
 * Useful for endpoints that work for both authenticated and anonymous users
 */
const optionalAuthenticateClient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.clientUser = null
      req.clientSessionToken = null
      return next()
    }

    const token = authHeader.substring(7)

    if (!token) {
      req.clientUser = null
      req.clientSessionToken = null
      return next()
    }

    // Validate session token
    const session = await clientAuthService.validateSession(token)

    if (session) {
      req.clientUser = {
        id: session.userId,
        username: session.username,
        email: session.email
      }
      req.clientSessionToken = token
    } else {
      req.clientUser = null
      req.clientSessionToken = null
    }

    next()
  } catch (error) {
    logger.error('❌ Optional client authentication middleware error:', error)
    // Don't fail the request, just log the error
    req.clientUser = null
    req.clientSessionToken = null
    next()
  }
}

module.exports = {
  authenticateClient,
  optionalAuthenticateClient
}
