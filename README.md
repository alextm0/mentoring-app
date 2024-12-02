
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
- Authentication: TBD (NextAuth/Firebase Auth/JWT)
- State Management: TBD (Redux/Zustand/Context API)
- Dotenv: For environment variables
- Nodemon: For backend development
- CORS: For Cross-Origin Resource Sharing

## Features
- User Authentication and Authorization
- Mentor-Mentee Interaction:
    - Resource sharing
    - Learning roadmaps
    - Session scheduling
    - Code reviews
- Learning Progress Tracking
- Modern UI with Tailwind CSS

## Learning Goals
- Understanding backend and API development with Express.js
- Implementing authentication and authorization
- Designing relational databases with PostgreSQL
- ORM utilization with Prisma
- Building scalable full-stack applications

## Folder Structure
```
/mentoring-app
│
├── /client       # Frontend code
│   ├── /public
│   ├── /pages
│   ├── /styles
│   ├── /components
│   └── package.json
│
├── /backend      # Backend code
│   ├── /src
│   │   ├── app.js
│   │   ├── server.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Yarn or npm

### Setup
1. Clone the repository.
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the `/client` and `/backend` directories and install dependencies.
   ```bash
   cd client
   npm install
   cd ../backend
   npm install
   ```
3. Set up environment variables in `/backend/.env` and `/client/.env`.

4. Start the development servers.
   ```bash
   # For the backend
   npm run dev

   # For the frontend
   cd client
   npm run dev
   ```

## To-Do
- [ ] Finalize authentication mechanism (e.g., NextAuth or Firebase Auth)
- [ ] Complete database schema design and integration
- [ ] Implement API routes and backend services
- [ ] Develop the frontend pages and components
- [ ] Create tests for backend APIs
- [ ] Optimize performance for production

## Notes
- Remember to use **dotenv** for secure handling of sensitive data.
- Ensure CORS is configured properly for secure API communication.
- Document APIs and maintain code consistency.

---

**Mentoring App** © 2023 - All rights reserved.
