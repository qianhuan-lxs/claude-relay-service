<!-- b84bc1d7-ca85-406d-96ae-5332d26fef1f 5a8401e9-8710-4605-a421-2c577967a0ff -->
# Client User Authentication Backend Implementation

## Overview

Build login and registration backend API endpoints for client users, using Redis as the database, PBKDF2 for password hashing, open registration model, and Redis session tokens with TTL.

## Implementation Strategy

### 1. Create Client Authentication Service

**File**: `src/services/clientAuthService.js`

- User CRUD operations in Redis with prefix `client_user:{userId}`
- Password hashing using Node.js `crypto.pbkdf2` (100k iterations, sha512)
- Session token generation and validation
- Username/email uniqueness validation
- User lookup by username or email

**Redis Keys**:

- `client_user:{userId}` - user data (username, email, passwordHash, salt, createdAt, etc.)
- `client_username:{username}` - username -> userId mapping
- `client_email:{email}` - email -> userId mapping
- `client_session:{sessionToken}` - session data with TTL

### 2. Create Client Auth Routes

**File**: `src/routes/clientAuthRoutes.js`

**Endpoints**:

- `POST /api/client/auth/register` - User registration
  - Validate username (3-30 chars, alphanumeric+underscore)
  - Validate email format
  - Validate password (min 8 chars)
  - Check username/email uniqueness
  - Hash password with PBKDF2
  - Store user in Redis
  - Return success message (no auto-login)

- `POST /api/client/auth/login` - User login
  - Validate credentials
  - Verify password hash
  - Generate session token
  - Store session in Redis with TTL (from config or default 7 days)
  - Return sessionToken and user info

- `POST /api/client/auth/logout` - User logout
  - Require authentication
  - Delete session from Redis
  - Return success

- `GET /api/client/auth/profile` - Get current user profile
  - Require authentication
  - Return user data (without password/salt)

- `POST /api/client/auth/refresh` - Refresh session
  - Validate existing session
  - Extend TTL
  - Return new expiry time

### 3. Create Authentication Middleware

**File**: `src/middleware/clientAuth.js`

- `authenticateClient` middleware
  - Extract token from `Authorization: Bearer {token}` header
  - Validate session exists in Redis
  - Attach `req.clientUser` with user data
  - Return 401 if invalid/expired

### 4. Update Express App Routes

**File**: `src/app.js`

- Mount client auth routes at `/api/client/auth`
- Ensure routes are registered before static file serving

### 5. Configuration Updates

**File**: `config/config.js`

Add client auth configuration:

```javascript
clientAuth: {
  sessionTimeout: 7 * 24 * 60 * 60, // 7 days in seconds
  passwordMinLength: 8,
  usernameMinLength: 3,
  usernameMaxLength: 30
}
```

### 6. Input Validation Utilities

**File**: `src/utils/clientInputValidator.js`

- `validateUsername(username)` - alphanumeric + underscore, 3-30 chars
- `validateEmail(email)` - RFC 5322 compliant
- `validatePassword(password)` - min 8 chars, check strength
- Throw descriptive errors for invalid inputs

## Implementation Details

### Password Hashing (PBKDF2)

```javascript
const crypto = require('crypto')

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

function verifyPassword(password, hash, salt) {
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === hashToVerify
}
```

### User Schema in Redis

```javascript
{
  id: 'uuid',
  username: 'string',
  email: 'string',
  passwordHash: 'string',
  salt: 'string',
  createdAt: 'ISO timestamp',
  lastLoginAt: 'ISO timestamp',
  isActive: true
}
```

### Session Schema in Redis

```javascript
{
  userId: 'uuid',
  username: 'string',
  email: 'string',
  createdAt: 'ISO timestamp',
  expiresAt: 'ISO timestamp'
}
```

## Testing Checklist

- [ ] Register new user successfully
- [ ] Reject duplicate username
- [ ] Reject duplicate email
- [ ] Reject invalid email format
- [ ] Reject weak passwords
- [ ] Login with valid credentials
- [ ] Login fails with wrong password
- [ ] Session token works for protected routes
- [ ] Session expires after TTL
- [ ] Logout removes session
- [ ] Profile endpoint returns user data
- [ ] Refresh extends session TTL

## Files to Create

1. `src/services/clientAuthService.js` - Core auth logic
2. `src/routes/clientAuthRoutes.js` - API endpoints
3. `src/middleware/clientAuth.js` - Auth middleware
4. `src/utils/clientInputValidator.js` - Input validation

## Files to Modify

1. `src/app.js` - Mount new routes
2. `config/config.js` - Add clientAuth config section

## Dependencies

No new npm packages required (using built-in `crypto` module)

### To-dos

- [ ] 初始化 web/client-spa (Vue3+Vite) 与基础依赖
- [ ] 复用 admin-spa 的 Tailwind/PostCSS 到 client-spa
- [ ] 实现 Home、Login、Register、Dashboard 初版组件
- [ ] 配置路由与守卫、占位登录态与重定向规则
- [ ] 在 Express 挂载 client-spa 静态资源与 history fallback
- [ ] 为 client-spa 配置 Vite 代理到后端 /api
- [ ] 按 README 校验并记录启动步骤（含 Redis 密码）