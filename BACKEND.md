# Backend Architecture — LearnHub LMS

Detailed technical reference for the backend codebase.

---

## Architecture Overview

The backend follows a layered architecture:

```
Request → Route → Middleware → Controller → Service → Model → MongoDB
```

- **Routes** — define endpoints and attach middleware chains
- **Middleware** — auth verification, role authorization, input validation, error handling
- **Controllers** — thin handlers: extract request data, call service, send response
- **Services** — all business logic lives here (no DB queries in controllers)
- **Models** — Mongoose schemas with instance methods

---

## Data Models

### User

```
name          String   required
email         String   required, unique, indexed
passwordHash  String   required (bcrypt, 12 rounds)
role          String   enum: admin | instructor | student
avatar        String   default: ""
bio           String   default: ""
isVerified    Boolean  default: false
verifyToken   String   email verification token
verifyTokenExpiry Date  24h expiry
resetOtp      String   6-digit OTP for password reset
resetOtpExpiry Date   15min expiry
timestamps    createdAt, updatedAt
```

### Course

```
title         String   required
description   String
category      String   indexed
price         Number   default: 0
instructor    ObjectId ref: User, required, indexed
lessons       [ObjectId] ref: Lesson
averageRating Number   0–5, recomputed on review add/remove
thumbnail     String
timestamps    createdAt, updatedAt
```

Text index on `title` + `description` for full-text search.

### Lesson

```
title     String   required
content   String
videoUrl  String
order     Number   default: 0
course    ObjectId ref: Course, required, indexed
timestamps
```

### Enrollment

```
student   ObjectId ref: User, required, indexed
course    ObjectId ref: Course, required, indexed
progress  Number   0–100, default: 0
timestamps
```

Compound unique index on `(student, course)` — prevents duplicate enrollments.

### Review

```
student   ObjectId ref: User, required
course    ObjectId ref: Course, required, indexed
rating    Number   1–5, required
comment   String
timestamps
```

Compound unique index on `(student, course)` — one review per student per course.

---

## Middleware

### `auth.js`

- `verifyToken` — extracts Bearer token from `Authorization` header, verifies with `JWT_SECRET`, attaches `req.user = { id, role }`
- `authorize(...roles)` — checks `req.user.role` is in the allowed list, throws 403 otherwise

### `errorHandler.js`

Global Express error handler. Maps `err.status` to HTTP status code, returns `{ error: message }` JSON. Hides stack traces in production.

### `validate.js`

Runs `validationResult(req)` from express-validator. If errors exist, returns 400 with the first error message.

---

## Security Measures

| Measure           | Implementation                                      |
| ----------------- | --------------------------------------------------- |
| Password hashing  | bcryptjs, 12 salt rounds                            |
| JWT access token  | 15 minute expiry, signed with `JWT_SECRET`          |
| JWT refresh token | 7 day expiry, stored in HttpOnly cookie             |
| Rate limiting     | 20 req/hr on auth routes, 100 req/15min globally    |
| HTTP headers      | Helmet sets CSP, HSTS, X-Frame-Options, etc.        |
| CORS              | Restricted to `CORS_ORIGIN` env var                 |
| Input validation  | express-validator on all write endpoints            |
| Ownership checks  | Instructors can only edit their own courses/lessons |
| Data sanitization | `toJSON()` strips passwordHash, OTP, verify tokens  |

---

## Email Flow (Nodemailer)

Uses plain Nodemailer SMTP — no SDK dependency.

**Registration:**

1. `authService.register()` generates a `crypto.randomBytes(32)` token
2. Stores `verifyToken` + `verifyTokenExpiry` (24h) on the user
3. Sends HTML email with link: `CLIENT_URL/verify-email?token=<token>`
4. `GET /api/auth/verify-email?token=` validates token, sets `isVerified: true`

**Password Reset:**

1. `authService.requestPasswordReset()` generates a 6-digit OTP
2. Stores `resetOtp` + `resetOtpExpiry` (15min) on the user
3. Sends OTP via email
4. `POST /api/auth/password-reset/confirm` validates OTP, updates password

---

## Scripts

### `scripts/seedAdmin.js`

Creates the first admin user if none exists.

```bash
node scripts/seedAdmin.js
```

Default: `admin@learnhub.com` / `Admin@1234` — change immediately after first login.

### `scripts/testEmail.js`

Sends a test email to `EMAIL_USER` to verify SMTP config.

```bash
node scripts/testEmail.js
```
