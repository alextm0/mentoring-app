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
