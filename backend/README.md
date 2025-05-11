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
- Mentees can view their mentor's details

### 2. Assignments
- Mentors: create, update, delete assignments  
- Mentees: view assignments assigned by their mentor  
- Pagination support for lists

### 3. Resources
- Mentors: create, update, delete resources (optional assignment link)  
- Mentees: view their mentor's resources  
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

### 9. User Activity Monitoring
- Tracks all CRUD operations performed by users
- Analyzes operation frequency to detect suspicious activity
- Automatically flags users exceeding threshold limits
- Admin dashboard for viewing and managing monitored users
- Background job runs hourly to check for unusual patterns

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration

### Users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/mentees` - Get mentor's mentees (MENTOR only)
- `GET /api/v1/users/mentor` - Get mentee's mentor (MENTEE only)

### Assignments
- `POST /api/v1/assignments` - Create assignment (MENTOR only)
- `GET /api/v1/assignments` - List assignments (MENTOR only)
- `GET /api/v1/assignments/mine` - List mentee's assignments (MENTEE only)
- `PUT /api/v1/assignments/:id` - Update assignment (MENTOR only)
- `DELETE /api/v1/assignments/:id` - Delete assignment (MENTOR only)

### Resources
- `POST /api/v1/resources` - Create resource (MENTOR only)
- `GET /api/v1/resources` - List resources (MENTOR only)
- `GET /api/v1/resources/mine` - List mentee's resources (MENTEE only)
- `GET /api/v1/resources/:id` - Get resource details
- `PUT /api/v1/resources/:id` - Update resource (MENTOR only)
- `DELETE /api/v1/resources/:id` - Delete resource (MENTOR only)

### Submissions
- `POST /api/v1/submissions` - Submit work (MENTEE only)
- `GET /api/v1/submissions/mine` - List mentee's submissions (MENTEE only)
- `GET /api/v1/submissions/assignment/:id` - List assignment submissions (MENTOR only)
- `PUT /api/v1/submissions/:id/toggle` - Toggle submission completion (MENTOR only)

### Comments
- `POST /api/v1/comments` - Add comment to submission (MENTOR only)
- `GET /api/v1/comments/:submissionId` - Get submission comments

### System
- `GET /api/v1/health` - Check system health
- `GET /api-docs` - API documentation (Swagger UI)

### Monitored Users
- `GET /api/v1/monitored-users` - List all monitored users (ADMIN only)
- `GET /api/v1/monitored-users/active` - List active monitored users (ADMIN only)
- `GET /api/v1/monitored-users/:id` - Get monitored user details (ADMIN only)
- `POST /api/v1/monitored-users/:id/resolve` - Resolve monitored user (ADMIN only)

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
   cd mentorship-app/backend
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

## Monitoring System Setup

The user activity monitoring system tracks all CRUD operations and automatically flags users with suspicious activity patterns:

1. **Run migrations**
   ```bash
   npm run migrate-logs
   npm run migrate-monitored-users
   ```

2. **Ensure user data exists**
   The monitoring system tracks actions performed by registered users. Before running the simulation:
   - Create at least one user in the system through the regular signup process, or
   - The simulation script will automatically create a test user if none exists

3. **Test the monitoring system**
   ```bash
   # Simulate suspicious activity (creates logs and runs analysis)
   npm run simulate-activity
   
   # Manually trigger analysis
   npm run analyze-activity
   
   # Check if any users are monitored
   npm run check-monitored
   ```

4. **Access monitored users via API**
   ```
   GET /api/v1/monitored-users/active
   ```

The system runs automatically every hour to check for suspicious patterns in user activity. It will flag users who:
- Perform more than 100 operations within an hour
- Perform more than 1000 operations within a 24-hour period
