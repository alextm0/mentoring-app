# Mentoring App

This project is a **full-stack mentoring platform** designed to connect mentors and mentees, manage resources and assignments, track learning progress, and perform code reviews. It serves as both a learning project and a potential standalone product. This README includes a **simplistic MVP plan** broken into actionable sprints, with the goal of helping you **gain confidence in TypeScript, PostgreSQL, Drizzle ORM, and Next.js**

---

## Table of Contents

1. [Overview](#overview)  
2. [Core MVP Features](#core-mvp-features)  
3. [Actionable Sprints](#actionable-sprints)  
4. [Suggested Application Structure (Next.js App Router)](#suggested-application-structure-nextjs-app-router)  
5. [Data Model & Database](#data-model--database)  
6. [Frontend & UI Considerations](#frontend--ui-considerations)  
7. [Error Handling & Edge Cases](#error-handling--edge-cases)  
8. [Testing Strategy](#testing-strategy)  
9. [Beyond the MVP](#beyond-the-mvp)  
10. [Tech Stack Details](#tech-stack-details)  
11. [Tips for Reducing AI Dependence](#tips-for-reducing-ai-dependence)  
12. [License](#license)

---

## Overview

### Purpose

The Mentoring App is aimed at:
- **Connecting Mentors and Mentees** in a structured environment.  
- **Facilitating Learning** via shared resources, problem sets, and feedback loops.  
- **Performing Code Reviews**: Mentees can submit code to mentors, who provide inline comments.

### Key Goals

1. **Full-Stack Learning**: Build a robust frontend (Next.js) and backend (Node/Express or Next API routes) with Drizzle ORM + NeonDB (PostgreSQL).  
2. **Super Simplistic MVP**: Keep features minimal to deliver a working product quickly while focusing on fundamentals.  
3. **Reduced AI Dependence**: Use AI for brainstorming or syntax checks but attempt to solve logic and design challenges via your own problem-solving.

---

## Core MVP Features

1. **User & Role Management**  
   - Basic auth (signup/login) with role differentiation: **Mentor**, **Mentee** (Admin can be optional or hard-coded).  

2. **Mentor–Mentee Management**  
   - Mentors see a list of their mentees.  
   - Mentees know their assigned mentor.

3. **Assignments & Resource Sharing**  
   - Mentors create assignments (title, description).  
   - Mentees see these assignments and can mark them completed.  
   - Mentors share basic resources (links, etc.).

4. **Code Submission & Basic Inline Review**  
   - Mentees upload code (text area).  
   - Mentors leave comments on specific lines.  
   - MVP: Store line number, comment text.

> *Simplify as much as possible—resist feature creep.*

---

## Actionable Sprints

Below is a plan broken into sprints (each ~1–2 weeks or whatever suits your schedule). The *Deliverables* section explains what you should have by the end of each sprint. The *How to Practice Without AI* section in each sprint nudges you to use your own problem-solving.

### Sprint 1: Project Setup & Environment

- **Tasks**  
  1. **Initialize Next.js Project** using App Router.  
  2. Install and set up **TypeScript**, **Tailwind CSS**, **Shadcn UI**.  
  3. Configure **NeonDB** PostgreSQL and **Drizzle ORM** for schema and migrations.  
  4. Create an initial Drizzle schema file (`lib/db.ts` or `db/schema.ts`), verifying DB connection.  

- **Deliverables**  
  - A working Next.js project that starts on `localhost:3000`.  
  - Drizzle migrations that create a basic `users` table in NeonDB.  

- **How to Practice Without AI**  
  - Refer to official docs for Next.js, Drizzle, or NeonDB when stuck.  
  - Write out your `drizzle.config` or your `schema.ts` using your knowledge of SQL.  
  - Only use AI as a secondary check if you get truly stuck.

### Sprint 2: Auth & Roles

- **Tasks**  
  1. Create a simple **sign-up** flow with `email` and `password`.  
  2. Set up a **login** flow, storing a session token (or cookie) if you prefer.  
  3. Add a `role` field (MENTOR, MENTEE) to `users`.  
  4. Provide simple forms in Next.js: one for sign-up, one for login.  

- **Deliverables**  
  - Users can sign up, choose a role, and log in.  
  - You store `passwordHash` in DB, hashing with `bcrypt` or `argon2`.  
  - A minimal session or token-based auth.

- **How to Practice Without AI**  
  - Write your own hashing logic with `bcrypt`.  
  - Manually test routes (e.g., with Postman or via the browser) to ensure it works.  
  - Seek official library documentation if you’re uncertain.

### Sprint 3: Mentor–Mentee Linking

- **Tasks**  
  1. Decide whether a mentee can only have one mentor or multiple. For simplicity, **assume 1 mentor** per mentee.  
  2. In DB: store a `mentorId` in each mentee’s user row **(or)** create a pivot table `MentorMentee`.  
  3. Create a simple “Assign Mentee” page or route where a mentor can link an existing user as a mentee.  
  4. Mentor dashboard: lists all mentees. Mentee dashboard: shows mentor info.

- **Deliverables**  
  - Mentors can see the mentees assigned to them.  
  - Mentees know their mentor.  

- **How to Practice Without AI**  
  - Query the DB yourself to confirm the relationships.  
  - For UI, write the logic for “Assign Mentee” with straightforward conditionals.

### Sprint 4: Assignments & Resources

- **Tasks**  
  1. **Assignments**: Mentor can create a new assignment (title, description). Mentee sees a list of assignments.  
  2. **Assignment Status**: A mentee can mark an assignment complete or in-progress (or even “submitted”).  
  3. **Resources**: Mentor can post a link (title + URL). Mentees see a resource list.

- **Deliverables**  
  - Basic CRUD for assignments: create, read, (optionally update, delete).  
  - Resource sharing: mentors add links, mentees read them.

- **How to Practice Without AI**  
  - Sketch out endpoints or Next.js API route handlers: e.g. `POST /api/assignments` to create.  
  - Practice writing your own queries with Drizzle.  
  - Test everything manually, reading error logs to fix issues.

### Sprint 5: Code Submission & Basic Inline Review

- **Tasks**  
  1. Mentee can submit code (plain text) for an assignment.  
  2. Store submissions in DB with a reference to the assignment or `AssignmentStatus`.  
  3. Mentor sees the submitted code. Add a line numbering approach to display code.  
  4. Allow mentors to attach “comments” referencing a line number.  

- **Deliverables**  
  - A minimal code viewer that shows code with line numbers.  
  - Mentors can click a line to add a comment.  
  - Comments stored in DB, referencing line number + submission ID.

- **How to Practice Without AI**  
  - Implement a simple approach for line numbering.  
  - Write the logic to “attach” a comment to a line.  
  - Only use AI if you need help with a specific library (like a syntax highlighter).

### Sprint 6: Testing & Final Polish

- **Tasks**  
  1. Add minimal **unit tests** for your authentication, assignment creation logic, etc.  
  2. Create a short test script for manual end-to-end flow.  
  3. Review code for any big gaps in error handling or security.  

- **Deliverables**  
  - A fully running MVP that logs in users, allows assignment creation, code submission, and review.  
  - Basic tests to ensure main flows don’t break.

- **How to Practice Without AI**  
  - Write simple test files (Jest, Vitest) that use your own mental model.  
  - Resist the urge to copy/paste entire test code from AI. Instead, verify the logic yourself.

---

## Suggested Application Structure (Next.js App Router)

```bash
root/
├─ app/
│   ├─ (site)/
│   │   ├─ layout.tsx            # Site-wide layout
│   │   └─ page.tsx              # Landing / home page
│   ├─ auth/
│   │   ├─ signup/
│   │   │   └─ page.tsx          # Sign Up form
│   │   └─ login/
│   │       └─ page.tsx          # Login form
│   ├─ dashboard/
│   │   ├─ mentor/
│   │   │   └─ page.tsx          # Mentor's main view
│   │   └─ mentee/
│   │       └─ page.tsx          # Mentee's main view
│   └─ api/
│       └─ ...                   # Next.js API route handlers
├─ components/
│   ├─ auth-form/
│   │   ├─ auth-form.tsx
│   │   └─ helpers.ts
│   ├─ code-review/
│   │   ├─ code-viewer.tsx
│   │   └─ comment-thread.tsx
│   └─ ui/
│       └─ ...                   # shadcn UI wrappers / custom UI components
├─ lib/
│   ├─ db.ts                      # Drizzle config & connection
│   └─ utils.ts                   # Utility functions
├─ types/
│   └─ index.ts                   # Global TypeScript interfaces
├─ package.json
└─ tsconfig.json
