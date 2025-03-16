# Mentoring App

This project is a **full-stack mentoring platform** designed to connect mentors and mentees, manage resources and assignments, track learning progress, and perform code reviews.

---

## Overview

### Purpose

The Mentoring App is aimed at:
- **Connecting Mentors and Mentees** in a structured environment  
- **Facilitating Learning** via shared resources, problem sets, and feedback loops  
- **Performing Code Reviews**: Mentees can submit code to mentors, who provide inline comments

### Key Goals

1. **Full-Stack Implementation**: Built with a robust frontend (Next.js) and backend (Node.js, Express.js) with Drizzle ORM + NeonDB (PostgreSQL)  
2. **Focused Feature Set**: Carefully selected features to deliver a practical, useful product  
3. **Clean Architecture**: Well-organized codebase with clear separation of concerns

---

## Core Features

1. **User & Role Management**  
   - Authentication (signup/login) with role differentiation: **Mentor**, **Mentee**  

2. **Mentor–Mentee Management**  
   - Mentors see a list of their mentees  
   - Mentees know their assigned mentor  

3. **Assignments & Resource Sharing**  
   - Mentors create assignments (title, description)  
   - Mentees see these assignments and can mark them completed  
   - Mentors share resources (links, documents)  

4. **Code Submission & Inline Review**  
   - Mentees upload code for review  
   - Mentors leave comments on specific lines  
   - Progress tracking for assignments  

---
### Phase 1: Project Setup & Environment

- Initialize Next.js Project with App Router  
- Set up TypeScript, Tailwind CSS, Shadcn UI  
- Configure NeonDB PostgreSQL and Drizzle ORM  
- Create initial database schema  

### Phase 2: Authentication & Roles

- Implement sign-up flow with email and password  
- Create login functionality with secure session management  
- Add role-based access control (mentor/mentee)  
- Build responsive auth forms  

### Phase 3: Mentor–Mentee Relationships

- Implement mentor-mentee relationship management  
- Create mentor dashboard with mentee list  
- Build mentee dashboard showing mentor information  
- Add mentee assignment functionality  

### Phase 4: Assignments & Resources

- Develop assignment creation interface for mentors  
- Implement assignment tracking for mentees  
- Create resource sharing functionality  
- Build progress visualization components  

### Phase 5: Code Review System

- Implement code submission for assignments  
- Create code viewer with line numbering  
- Build comment system for inline feedback  
- Develop notification system for reviews  

### Phase 6: Testing & Refinement

- Implement unit tests for core functionality  
- Perform end-to-end testing  
- Optimize performance  
- Refine UI/UX based on testing  

---

## Application Structure

```bash
root/
├─ app/
│   ├─ (auth)/                   # Authentication routes
│   ├─ (dashboard)/              # Dashboard routes
│   │   ├─ mentee/               # Mentee views
│   │   └─ mentor/               # Mentor views
│   │       ├─ page.tsx          # Schedule page
│   │       ├─ layout.tsx        # Schedule layout
│   │       ├─ assignments/      # Assignment management
│   │       ├─ mentees/          # Mentee management
│   │       ├─ resources/        # Resource sharing
│   │       └─ schedule/         # Schedule management
│   ├─ fonts/                    # Custom fonts
│   ├─ favicon.ico               # Site favicon
│   ├─ globals.css               # Global styles
│   ├─ layout.tsx                # Root layout
│   └─ page.tsx                  # Home page
├─ components/
│   ├─ auth/                     # Authentication components
│   ├─ dashboard/                # Dashboard components
│   ├─ layout/                   # Layout components
│   └─ ui/                       # UI components (Shadcn)
├─ lib/                          # Utility libraries
├─ public/                       # Static assets
│   └─ placeholder.svg           # Placeholder image
```

---

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **State Management**: Zustand
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Drizzle ORM
- **Authentication**: Custom JWT implementation
- **Styling**: Tailwind CSS with custom theme
- **Deployment**: Vercel

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
