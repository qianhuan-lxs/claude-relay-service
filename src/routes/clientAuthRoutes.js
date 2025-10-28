const express = require('express')
const router = express.Router()

const clientAuthService = require('../services/clientAuthService')
const { authenticateClient } = require('../middleware/clientAuth')
const redeemService = require('../services/redeemService')
const input = require('../utils/clientInputValidator')
const logger = require('../utils/logger')

// POST /api/client/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {}

    // validate inputs
    const v = input.validateRegistrationInput({ username, email, password })

    // create user
    const user = await clientAuthService.createUser(v)

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user
    })
  } catch (error) {
    const message = error?.message || 'Registration failed'
    const isConflict = /already/i.test(message)
    logger.error('❌ Client register error:', error)
    return res.status(isConflict ? 409 : 400).json({ success: false, error: 'register_failed', message })
  }
})

// POST /api/client/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}

    const v = input.validateLoginInput({ username, password })

    const user = await clientAuthService.authenticateUser(v.username, v.password)
    if (!user) {
      return res.status(401).json({ success: false, error: 'invalid_credentials', message: 'Invalid username or password' })
    }

    const sessionToken = await clientAuthService.createSession(user.id, user)

    return res.json({ success: true, user, sessionToken })
  } catch (error) {
    logger.error('❌ Client login error:', error)
    return res.status(500).json({ success: false, error: 'login_failed', message: 'Internal server error' })
  }
})

// POST /api/client/auth/logout
router.post('/logout', authenticateClient, async (req, res) => {
  try {
    if (req.clientSessionToken) {
      await clientAuthService.deleteSession(req.clientSessionToken)
    }
    return res.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    logger.error('❌ Client logout error:', error)
    return res.status(500).json({ success: false, error: 'logout_failed', message: 'Internal server error' })
  }
})

// GET /api/client/auth/profile
router.get('/profile', authenticateClient, async (req, res) => {
  try {
    const profile = await clientAuthService.getUserProfile(req.clientUser.id)
    if (!profile) {
      return res.status(404).json({ success: false, error: 'not_found', message: 'User not found' })
    }
    return res.json({ success: true, user: profile })
  } catch (error) {
    logger.error('❌ Client profile error:', error)
    return res.status(500).json({ success: false, error: 'profile_failed', message: 'Internal server error' })
  }
})

// POST /api/client/auth/refresh
router.post('/refresh', authenticateClient, async (req, res) => {
  try {
    const ok = await clientAuthService.refreshSession(req.clientSessionToken)
    if (!ok) {
      return res.status(401).json({ success: false, error: 'invalid_session', message: 'Invalid or expired session' })
    }
    return res.json({ success: true, sessionToken: req.clientSessionToken })
  } catch (error) {
    logger.error('❌ Client session refresh error:', error)
    return res.status(500).json({ success: false, error: 'refresh_failed', message: 'Internal server error' })
  }
})

module.exports = router


// 🎟️ 激活兑换码并返回明文 API Key（需登录）
router.post('/redeem', authenticateClient, async (req, res) => {
  try {
    const { code } = req.body || {}
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'invalid_code', message: '兑换码不能为空' })
    }
    const result = await redeemService.activateRedeem(code.trim(), req.clientUser)
    return res.json({ success: true, data: result })
  } catch (error) {
    return res.status(400).json({ success: false, error: 'redeem_failed', message: error.message || '兑换失败' })
  }
})

