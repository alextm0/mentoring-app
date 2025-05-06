# Mentorship Platform API

## Overview
The Mentorship Platform API is a backend service designed to support a mentorship application where mentors can manage assignments, resources, submissions, and comments, and mentees can view assignments, access resources, and submit their work. It provides:

- Secure JWT-based authentication
- Role-based access control (MENTOR / MENTEE)
- Health monitoring endpoint
- Comprehensive Swagger documentation
- Unit & integration tests
- Middleware for rate-limiting, CORS, logging, and error handling

Built with Node.js, Express, and PostgreSQL.

---

## Features

### 1. User Management
- **Signup & Login** via JWT  
- Roles: **MENTOR** & **MENTEE**  
- Mentors can attach/detach mentees  
- Mentees can view their mentor’s details

### 2. Assignments
- Mentors: create, update, delete assignments  
- Mentees: view assignments assigned by their mentor  
- Pagination support for lists

### 3. Resources
- Mentors: create, update, delete resources (optional assignment link)  
- Mentees: view their mentor’s resources  
- Pagination support for lists

### 4. Submissions
- Mentees: submit work (code snippets) for assignments  
- Mentors: view submissions & toggle completion  
- Pagination support for lists

### 5. Comments
- Mentors: comment on submissions with line numbers  
- Mentors & mentees: view comments on submissions  
- Pagination support for lists

### 6. System Health
- **GET `/health`** returns API + DB status, memory usage, uptime

### 7. Security & Performance
- JWT authentication & role checks  
- Rate limiting (excluding `/health` & `/api-docs`)  
- CORS configuration  
- Request logging

### 8. Documentation
- Swagger UI available at **`/api-docs`**

---

## Technologies Used

| Category       | Libraries / Tools                              |
| -------------- | ----------------------------------------------- |
| **Backend**    | Node.js, Express, PostgreSQL,  |
| **Security**   | jsonwebtoken, bcryptjs, express-rate-limit, cors |
| **Docs**       | swagger-ui-express, js-yaml                    |
| **Testing**    | Jest, Supertest                          |
| **Validation** | zod                                             |
| **Logging**    | winston                                         |
| **Utilities**  | uuid, dotenv                                    |
| **Dev Tools**  | ESLint, Prettier                                |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── assignments.controller.js
│   │   ├── auth.controller.js
│   │   ├── comments.controller.js
│   │   ├── resources.controller.js
│   │   ├── submissions.controller.js
│   │   └── users.controller.js
│   ├── docs/
│   │   └── api.yaml
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimit.js
│   │   └── requestLogger.js
│   ├── models/
│   │   ├── assignment.js
│   │   ├── comment.js
│   │   ├── resource.js
│   │   ├── submission.js
│   │   └── user.js
│   ├── repos/
│   │   ├── assignments.repo.js
│   │   ├── comments.repo.js
│   │   ├── resources.repo.js
│   │   ├── submissions.repo.js
│   │   └── users.repo.js
│   ├── routes/
│   │   ├── assignments.js
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── index.js
│   │   ├── resources.js
│   │   ├── submissions.js
│   │   └── users.js
│   ├── tests/
│   │   ├── integration/
│   │   │   └── health.test.js
│   │   └── unit/
│   │       ├── assignments.test.js
│   │       ├── auth.test.js
│   │       ├── comments.test.js
│   │       ├── resources.test.js
│   │       ├── submissions.test.js
│   │       └── users.test.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   └── logger.js
│   └── app.js
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites
- **Node.js** ≥ 16.x  
- **PostgreSQL** ≥ 12.x  
- **npm** (or Yarn)

### Installation

1. **Clone & install**  
   ```bash
   git clone <repo-url> mentorship-app
   cd mentorship-app
   npm install
   ```

2. **Configure environment**  
   ```bash
   cp .env.example .env
   # edit .env:
   # PORT=3000
   # DATABASE_URL=postgres://user:pass@localhost:5432/mentorship_db
   # JWT_SECRET=your_jwt_secret
   # FRONTEND_URL=http://localhost:3000
   ```

3. **Initialize database (Neon)**  
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the server**  
   ```bash
   npm start
   ```
