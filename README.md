# LearnHub — Backend

REST API for the LearnHub LMS built with Node.js, Express, MongoDB, and JWT authentication.

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- Bcrypt password hashing
- Nodemailer (email)
- Helmet, CORS, Rate Limiting, Morgan, Express Validator

---

## Project Structure

```
backend/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── enrollmentController.js
│   ├── lessonController.js
│   ├── reviewController.js
│   └── userController.js
├── middleware/
│   ├── auth.js                 # verifyToken, authorize(roles)
│   ├── errorHandler.js         # global error handler
│   └── validate.js             # express-validator result handler
├── models/
│   ├── Course.js
│   ├── Enrollment.js
│   ├── Lesson.js
│   ├── Review.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   ├── lessonRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── scripts/
│   ├── seedAdmin.js            # creates first admin user
│   └── testEmail.js            # tests SMTP connection
├── services/
│   ├── authService.js
│   ├── courseService.js
│   ├── enrollmentService.js
│   ├── lessonService.js
│   ├── reviewService.js
│   └── userService.js
├── utils/
│   ├── generateToken.js
│   └── sendEmail.js
├── .env                        # local env (never commit)
── .gitignore
├── package.json
├── railway.json                # Railway deployment config
└── server.js                   # entry point
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally

Server runs at `http://localhost:5000`

---

## Environment Variables

| Variable             | Description                         | Example                            |
| -------------------- | ----------------------------------- | ---------------------------------- |
| `PORT`               | Server port                         | `5000`                             |
| `MONGODB_URI`        | MongoDB connection string           | `mongodb://localhost:27017/lms`    |
| `JWT_SECRET`         | Secret for access tokens            | random 32+ char string             |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens           | random 32+ char string             |
| `EMAIL_HOST`         | SMTP host                           | `smtp.gmail.com`                   |
| `EMAIL_PORT`         | SMTP port                           | `587`                              |
| `EMAIL_USER`         | SMTP username / Gmail address       | `you@gmail.com`                    |
| `EMAIL_PASS`         | SMTP password / Gmail app password  | 16-char app password               |
| `EMAIL_FROM`         | Sender display name + address       | `LearnHub <no-reply@learnhub.com>` |
| `CORS_ORIGIN`        | Allowed frontend origin(s)          | `http://localhost:5173`            |
| `CLIENT_URL`         | Frontend base URL (for email links) | `http://localhost:5173`            |
| `NODE_ENV`           | Environment                         | `development`                      |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint                  | Auth   | Description                      |
| ------ | ------------------------- | ------ | -------------------------------- |
| POST   | `/register`               | Public | Register (student or instructor) |
| POST   | `/login`                  | Public | Login, returns JWT + sets cookie |
| POST   | `/refresh`                | Cookie | Refresh access token             |
| POST   | `/logout`                 | Public | Clear refresh token cookie       |
| GET    | `/verify-email`           | Public | Verify email via token link      |
| POST   | `/password-reset`         | Public | Send OTP to email                |
| POST   | `/password-reset/confirm` | Public | Confirm OTP + set new password   |

### Users — `/api/users`

| Method | Endpoint        | Auth  | Description              |
| ------ | --------------- | ----- | ------------------------ |
| GET    | `/`             | Admin | List all users paginated |
| GET    | `/:id`          | Auth  | Get user by ID           |
| PUT    | `/:id`          | Self  | Update profile           |
| PUT    | `/:id/password` | Self  | Change password          |
| PATCH  | `/:id/role`     | Admin | Change user role         |
| DELETE | `/:id`          | Admin | Delete user              |

### Courses — `/api/courses`

| Method | Endpoint       | Auth             | Description                    |
| ------ | -------------- | ---------------- | ------------------------------ |
| GET    | `/`            | Public           | List courses (filter/paginate) |
| GET    | `/my`          | Instructor       | Get own courses                |
| GET    | `/analytics`   | Admin            | Platform analytics             |
| GET    | `/:id`         | Public           | Course detail with lessons     |
| POST   | `/`            | Instructor/Admin | Create course                  |
| PUT    | `/:id`         | Instructor/Admin | Update course                  |
| DELETE | `/:id`         | Instructor/Admin | Delete course                  |
| GET    | `/:id/reviews` | Public           | Get course reviews             |
| POST   | `/:id/reviews` | Student          | Submit review                  |

### Lessons — `/api/lessons`

| Method | Endpoint | Auth             | Description   |
| ------ | -------- | ---------------- | ------------- |
| POST   | `/`      | Instructor/Admin | Create lesson |
| PUT    | `/:id`   | Instructor/Admin | Update lesson |
| DELETE | `/:id`   | Instructor/Admin | Delete lesson |

### Enrollment — `/api`

| Method | Endpoint           | Auth    | Description             |
| ------ | ------------------ | ------- | ----------------------- |
| POST   | `/enroll`          | Student | Enroll in a course      |
| GET    | `/my-courses`      | Student | Get enrolled courses    |
| PATCH  | `/enroll/progress` | Student | Update progress (0–100) |

### Reviews — `/api/reviews`

| Method | Endpoint | Auth          | Description   |
| ------ | -------- | ------------- | ------------- |
| DELETE | `/:id`   | Student/Admin | Delete review |

---

## Authentication Flow

1. `POST /api/auth/register` → creates user, sends verification email
2. User clicks link → `GET /api/auth/verify-email?token=...` → account activated
3. `POST /api/auth/login` → returns `{ token }` + sets `refreshToken` HttpOnly cookie
4. Client sends `Authorization: Bearer <token>` on every protected request
5. On 401 → client calls `POST /api/auth/refresh` → new access token returned
6. `POST /api/auth/logout` → clears cookie

---

## Deploy to Railway

1. Push the `backend/` folder as its own GitHub repo
2. New project on [railway.app](https://railway.app) → Deploy from GitHub
3. Set all env vars from `.env.example` in the Railway dashboard
4. Railway auto-detects `package.json` and runs `node server.js`
