// User types
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "mentor" | "mentee"
  avatar?: string
  createdAt: Date
}

export interface Mentor extends User {
  role: "mentor"
  mentees: Mentee[]
  expertise: string[]
  bio?: string
}

export interface Mentee extends User {
  role: "mentee"
  mentorId: string
  progress: number
  categories: string[]
}

// Assignment types
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  status: "not-started" | "in-progress" | "completed" | "reviewed"
  progress: number
  mentorId: string
  menteeId: string
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  menteeId: string
  code: string
  language: string
  submittedAt: Date
  feedback?: AssignmentFeedback
}

export interface AssignmentFeedback {
  id: string
  submissionId: string
  mentorId: string
  comments: CodeComment[]
  overallFeedback: string
  createdAt: Date
}

export interface CodeComment {
  id: string
  lineNumber: number
  content: string
  createdAt: Date
}

// Session types
export interface Session {
  id: string
  title: string
  description?: string
  mentorId: string
  menteeId: string
  date: Date
  startTime: string
  endTime: string
  type: string
  status: "scheduled" | "completed" | "cancelled"
}

// Resource types
export interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: "article" | "video" | "pdf" | "other"
  mentorId: string
  createdAt: Date
}

