
# Mentoring App

## Overview

This project is a full-stack mentoring application designed to connect mentors and mentees, manage resources, schedule sessions, track learning progress, and perform code reviews. It serves as both a learning project and a potential monetizable platform.

## Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma

### Tools & Libraries
- **Authentication**: NextAuth
- **State Management**: Zustand
- **Form validation**: Zod

## Features
- User Authentication and Authorization
- Mentor-Mentee Interaction:
    - Resource sharing
    - Learning roadmaps
    - Session scheduling
    - Code reviews
- Learning Progress Tracking

## Project Roadmap

### Step 1: Project Initialization
- [x] Set up project structure with `client` and `backend` directories.
- [x] Initialize Git and set up `.gitignore`.
- [x] Install essential dependencies for both frontend and backend.

**Learning Path**:
- Next.js Basics: Routing, pages, and API routes.
- Node.js Basics: Middleware, routing, and Express.js setup.

---

### Step 2: Backend Setup and Database Integration
- [ ] Create and configure `app.js` and `server.js`.
- [ ] Set up Prisma ORM and define database schema.
- [ ] Build API routes for user authentication and CRUD operations.

**Learning Path**:
- Prisma Documentation: Schema, migrations, and queries.
- Express.js: Routes, middleware, and error handling.
- PostgreSQL: Relationships, indexing, and queries.

---

### Step 3: Frontend Development
- [ ] Build the landing page 
- [ ] Build register / login components
- [ ] Build the dashboard for mentors / mentees
- [ ] Build the roadmap + code review components

---

### Step 4: Authentication and Authorization
- [ ] Implement token-based authentication with JWT.
- [ ] Add middleware to protect backend routes.
- [ ] Build role-based access control (RBAC).

**Learning Path**:
- JWT Documentation: Token creation and validation.
- Role-Based Authorization: Handling roles and permissions.

---

### Step 5: Feature Development
- [ ] Mentor Dashboard: Track mentees and create learning resources.
- [ ] Mentee Dashboard: View progress and book sessions.
- [ ] Code Review System: Submit and review code with comments.
- [ ] Visual Roadmap: Add data visualizations.

**Learning Path**:
- React Query: State management and data fetching.
- Chart.js: Building interactive charts.

---

### Step 6: Testing and Deployment
- [ ] Write unit tests for backend and frontend.
- [ ] Deploy frontend (Vercel) and backend (Render).
- [ ] Test database connection (NeonDB or Supabase).

**Learning Path**:
- Testing Libraries: `jest` for backend, `react-testing-library` for frontend.
- Deployment Best Practices: CI/CD pipeline setup.

---

## Daily Workflow
1. Pick a task from the roadmap.
2. Study related concepts from the learning path.
3. Implement the feature and test thoroughly.
4. Commit your changes with clear messages.

---

## Todo List
- [ ] Set up project structure and dependencies.
- [ ] Implement database schema and test connection.
- [ ] Build authentication and authorization.
- [ ] Develop dashboards for mentors and mentees.
- [ ] Add progress tracking and visualizations.
- [ ] Write tests and deploy the application.

---

---

**Mentoring App** © 2024 - All rights reserved.
