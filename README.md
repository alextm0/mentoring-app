# Mentoring Application

A full-stack mentoring platform built with Next.js, Express.js, and PostgreSQL that enables mentors to create assignments, provide resources, and give feedback to mentees through code submissions.

## Features

### For Mentors
- Create and manage assignments
- Add learning resources (standalone or assignment-linked)
- Review code submissions
- Provide line-by-line comments on submissions
- Track mentee progress
- Manage multiple mentees

### For Mentees
- View assigned tasks and resources
- Submit code solutions
- Receive feedback through inline comments
- Track learning progress
- Access mentor-provided resources

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- JWT for authentication

### Backend
- Express.js
- Node.js
- PostgreSQL (via Neon)
- Drizzle ORM
- JWT authentication
- Jest for testing

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Neon account)
- npm or yarn

## Environment Setup

### Backend (.env)
```env
# Database
DATABASE_URL=your_neon_postgres_connection_string
DIRECT_URL=your_neon_direct_connection_string

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Database Schema

```sql
-- users
id            uuid  pk
email         text  unique not null
password_hash text  not null
role          text  check (role in ('MENTOR','MENTEE')) not null
mentor_id     uuid  references users(id)
created_at    timestamptz default now()

-- assignments
id            uuid  pk
mentor_id     uuid  references users(id)
title         text  not null
description   text
created_at    timestamptz default now()

-- resources
id            uuid  pk
mentor_id     uuid references users(id)
assignment_id uuid references assignments(id) null
title         text  not null
url           text  not null
created_at    timestamptz default now()

-- submissions
id            uuid  pk
assignment_id uuid references assignments(id)
mentee_id     uuid references users(id)
snippet       text  not null
completed     boolean default false
created_at    timestamptz default now()

-- comments
id            uuid  pk
submission_id uuid references submissions(id)
mentor_id     uuid references users(id)
line_number   integer
comment       text not null
created_at    timestamptz default now()
```

## API Endpoints

### Authentication
- POST /api/v1/auth/signup - Register new user
- POST /api/v1/auth/login - Login user

### Assignments
- POST /api/v1/assignments - Create assignment (mentor)
- GET /api/v1/assignments - List all assignments (mentor)
- GET /api/v1/assignments/mine - List mentee's assignments
- PUT /api/v1/assignments/:id - Update assignment (mentor)
- DELETE /api/v1/assignments/:id - Delete assignment (mentor)

### Resources
- POST /api/v1/resources - Create resource (mentor)
- GET /api/v1/resources - List all resources (mentor)
- GET /api/v1/resources/mine - List mentee's resources
- GET /api/v1/resources/:id - Get resource details
- PUT /api/v1/resources/:id - Update resource (mentor)
- DELETE /api/v1/resources/:id - Delete resource (mentor)

### Submissions
- POST /api/v1/submissions - Create submission (mentee)
- GET /api/v1/submissions/mine - List mentee's submissions
- GET /api/v1/submissions/:assignmentId - List assignment submissions (mentor)
- PATCH /api/v1/submissions/:id/complete - Toggle completion (mentor)

### Comments
- POST /api/v1/comments - Create comment (mentor)
- GET /api/v1/comments/:submissionId - List submission comments

### Mentor Management
- POST /api/v1/mentors/:mentorId/mentees - Attach mentee to mentor
- GET /api/v1/mentors/:mentorId/mentees - List mentor's mentees
- DELETE /api/v1/mentors/:mentorId/mentees/:menteeId - Detach mentee

## Installation & Setup

1. Clone the repository
```bash
git clone <repository-url>
cd mentoring-app
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up the database
```bash
# In backend directory
npm run db:push # Apply schema changes
npm run db:seed # (Optional) Seed initial data
```

4. Start the development servers
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

5. Run tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow functional programming patterns
- Use React Server Components where possible
- Implement proper error handling
- Write comprehensive tests

### Git Workflow
1. Create feature branch from main
2. Make changes and test
3. Submit PR with description
4. Get review and approval
5. Merge to main