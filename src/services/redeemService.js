const crypto = require('crypto')
const redis = require('../models/redis')
const config = require('../../config/config')
const logger = require('../utils/logger')
const apiKeyService = require('./apiKeyService')

class RedeemService {
  constructor() {
    this.redeemPrefix = 'redeem:code:'
    this.userRedeemsPrefix = 'user:redeems:'
  }

  _generateCode(length = 16) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let out = ''
    for (let i = 0; i < length; i++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return out
  }

  _getEncryptionKey() {
    const raw = config.security.encryptionKey || ''
    const buf = Buffer.alloc(32)
    Buffer.from(String(raw)).copy(buf)
    return buf
  }

  _encryptPlaintext(plaintext) {
    if (!plaintext) {
      return ''
    }
    const key = this._getEncryptionKey()
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, enc]).toString('base64')
  }

  _decryptPlaintext(blob) {
    if (!blob) {
      return ''
    }
    const buf = Buffer.from(blob, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const enc = buf.subarray(28)
    const key = this._getEncryptionKey()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const dec = Buffer.concat([decipher.update(enc), decipher.final()])
    return dec.toString('utf8')
  }

  async createRedeemWithApiKey(options = {}) {
    const {
      name = 'Redeem Key',
      description = '',
      expiresAt = null,
      activationDays = 0,
      activationUnit = 'days',
      expirationMode = 'fixed',
      notes = '',
      adminId = ''
    } = options

    const code = this._generateCode(16)

    const created = await apiKeyService.generateApiKey({
      name,
      description,
      expiresAt,
      activationDays,
      activationUnit,
      expirationMode,
      permissions: 'all',
      createdBy: 'admin',
      tags: ['redeem']
    })

    const now = new Date().toISOString()
    const redeemData = {
      code,
      status: 'unused',
      createdAt: now,
      expiresAt: expiresAt || '',
      apiKeyId: created.id,
      userId: '',
      activatedAt: '',
      createdByAdminId: adminId || '',
      notes: notes || '',
      plaintextKeyEnc: this._encryptPlaintext(created.apiKey)
    }

    const client = redis.getClientSafe()
    await client.hset(`${this.redeemPrefix}${code}`, redeemData)

    try {
      await apiKeyService.updateApiKey(created.id, { boundRedeemCode: code })
    } catch (e) {
      logger.debug('Soft failure updating api key tags for redeem:', e)
    }

    logger.success(`🎟️ Created redeem code ${code} for apiKey ${created.id}`)
    return { code, apiKeyId: created.id, expiresAt: redeemData.expiresAt }
  }

  async getRedeem(code) {
    const client = redis.getClientSafe()
    const data = await client.hgetall(`${this.redeemPrefix}${code}`)
    return data && Object.keys(data).length > 0 ? data : null
  }

  async listRedeems() {
    const client = redis.getClientSafe()
    const keys = await client.keys(`${this.redeemPrefix}*`)
    const list = []
    for (const key of keys) {
      const data = await client.hgetall(key)
      if (data && Object.keys(data).length > 0) {
        // 获取关联的API Key信息
        try {
          const apiKeyService = require('./apiKeyService')
          const apiKey = await apiKeyService.getApiKeyById(data.apiKeyId)
          if (apiKey) {
            data.apiKeyName = apiKey.name
            data.apiKeyDescription = apiKey.description
          }
        } catch (e) {
          logger.debug('Failed to get API key info for redeem:', e)
        }
        list.push(data)
      }
    }
    return list
  }

  async getUserRedeems(userId) {
    const client = redis.getClientSafe()
    const setKey = `${this.userRedeemsPrefix}${userId}`
    // 获取该用户关联的兑换码集合
    const codes = (await client.smembers(setKey)) || []
    const results = []
    for (const code of codes) {
      try {
        const data = await this.getRedeem(code)
        if (data) {
          // 附带关联 API Key 的简要信息（若可用）
          try {
            const apiKey = await apiKeyService.getApiKeyById(data.apiKeyId)
            if (apiKey) {
              data.apiKeyName = apiKey.name
              data.apiKeyDescription = apiKey.description
            }
          } catch (e) {
            logger.debug('Failed to get API key for user redeem:', e)
          }
          results.push(data)
        }
      } catch (e) {
        logger.debug('Failed to load redeem for code:', code, e)
      }
    }
    // 按创建时间/激活时间倒序
    results.sort(
      (a, b) =>
        new Date(b.activatedAt || b.createdAt || 0) - new Date(a.activatedAt || a.createdAt || 0)
    )
    return results
  }

  async updateRedeem(code, updates) {
    const client = redis.getClientSafe()
    const key = `${this.redeemPrefix}${code}`
    const current = await client.hgetall(key)
    if (!current || Object.keys(current).length === 0) {
      throw new Error('Redeem not found')
    }

    const allowed = ['status', 'expiresAt', 'notes']
    for (const [k, v] of Object.entries(updates || {})) {
      if (allowed.includes(k)) {
        current[k] = v == null ? '' : String(v)
      }
    }
    await client.hset(key, current)
    return current
  }

  async deleteRedeem(code) {
    const client = redis.getClientSafe()
    const key = `${this.redeemPrefix}${code}`
    const cur = await client.hgetall(key)
    if (!cur || Object.keys(cur).length === 0) {
      return 0
    }
    if (cur.status === 'used') {
      throw new Error('Cannot delete a used redeem')
    }
    return client.del(key)
  }

  async activateRedeem(code, user) {
    const redeem = await this.getRedeem(code)
    if (!redeem) {
      throw new Error('兑换码不存在')
    }
    if (redeem.status !== 'unused') {
      throw new Error('兑换码不可用')
    }
    if (redeem.expiresAt && new Date() > new Date(redeem.expiresAt)) {
      await this.updateRedeem(code, { status: 'expired' })
      throw new Error('兑换码已过期')
    }

    const keyId = redeem.apiKeyId
    const tags = ['redeem']
    await apiKeyService.updateApiKey(keyId, {
      userId: user.id,
      userUsername: user.username,
      tags: JSON.stringify(tags),
      boundRedeemCode: code,
      createdBy: 'admin'
    })

    const now = new Date().toISOString()
    await this.updateRedeem(code, { status: 'used', activatedAt: now, userId: user.id })

    const client = redis.getClientSafe()
    await client.sadd(`${this.userRedeemsPrefix}${user.id}`, code)

    const plaintext = this._decryptPlaintext(redeem.plaintextKeyEnc)
    return { apiKeyId: keyId, apiKey: plaintext }
  }
}

module.exports = new RedeemService()
