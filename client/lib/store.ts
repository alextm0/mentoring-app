import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Assignment, Mentee, Mentor, Resource, Session, User } from "./types"

// Mock data
const mockMentees: Mentee[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 75,
    categories: ["Web Development"],
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 30,
    categories: ["Programming Fundamentals"],
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 90,
    categories: ["Open Source"],
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 90,
    categories: ["Open Source"],
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Ethan Hunt",
    email: "ethan@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 90,
    categories: ["Open Source"],
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    role: "mentee",
    mentorId: "1",
    progress: 85,
    categories: ["Web Development"],
    createdAt: new Date(),
  },
]

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Nea Caisa",
    email: "nea@example.com",
    role: "mentor",
    mentees: mockMentees,
    expertise: ["Web Development", "Programming Fundamentals", "Open Source"],
    bio: "Experienced developer with 10+ years in the industry",
    createdAt: new Date(),
  },
]

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Build a Todo App with React",
    description: "Create a simple todo application using React hooks and state management.",
    dueDate: "Mar 20, 2024",
    status: "in-progress",
    progress: 65,
    mentorId: "1",
    menteeId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Implement Binary Search Tree",
    description: "Create a binary search tree implementation with insert, delete, and search operations.",
    dueDate: "Mar 25, 2024",
    status: "not-started",
    progress: 0,
    mentorId: "1",
    menteeId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "CSS Grid Layout Challenge",
    description: "Create a responsive dashboard layout using CSS Grid.",
    dueDate: "Mar 15, 2024",
    status: "completed",
    progress: 100,
    mentorId: "1",
    menteeId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "API Integration Project",
    description: "Build a weather app that fetches data from a public API.",
    dueDate: "Mar 18, 2024",
    status: "completed",
    progress: 100,
    mentorId: "1",
    menteeId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockResources: Resource[] = [
  {
    id: "1",
    title: "React Hooks Deep Dive",
    description: "A comprehensive guide to React hooks and their use cases.",
    url: "https://example.com/react-hooks",
    type: "article",
    mentorId: "1",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Data Structures Fundamentals",
    description: "Learn about arrays, linked lists, trees, and graphs.",
    url: "https://example.com/data-structures",
    type: "video",
    mentorId: "1",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "CSS Grid Cheat Sheet",
    description: "Quick reference for CSS Grid properties and values.",
    url: "https://example.com/css-grid-cheatsheet",
    type: "pdf",
    mentorId: "1",
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "JavaScript Promises Explained",
    description: "Understanding asynchronous JavaScript with promises.",
    url: "https://example.com/js-promises",
    type: "article",
    mentorId: "1",
    createdAt: new Date(),
  },
]

const mockSessions: Session[] = [
  {
    id: "1",
    title: "Introduction to Dynamic Programming",
    description: "Learn the basics of dynamic programming and solve practice problems",
    mentorId: "1",
    menteeId: "1",
    date: new Date(),
    startTime: "16:00",
    endTime: "17:00",
    type: "Problem Solving",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Centroid Decomposition. Practice Problems",
    description: "Advanced graph algorithms and practice problems",
    mentorId: "1",
    menteeId: "2",
    date: new Date(Date.now() + 86400000), // Tomorrow
    startTime: "16:00",
    endTime: "17:30",
    type: "Problem Solving",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Combinatorics. Narayana Numbers",
    description: "Explore combinatorial mathematics and Narayana numbers",
    mentorId: "1",
    menteeId: "3",
    date: new Date(Date.now() + 86400000 * 3), // 3 days later
    startTime: "16:00",
    endTime: "18:00",
    type: "Concept Explanation",
    status: "scheduled",
  },
]

interface AppState {
  // Auth state
  currentUser: User | null
  isAuthenticated: boolean
  userRole: "admin" | "mentor" | "mentee" | null

  // Data
  mentees: Mentee[]
  mentors: Mentor[]
  assignments: Assignment[]
  resources: Resource[]
  sessions: Session[]

  // Actions
  login: (email: string, password: string) => void
  logout: () => void
  addMentee: (mentee: Omit<Mentee, "id" | "createdAt">) => void
  updateMentee: (id: string, menteeData: Partial<Omit<Mentee, "id" | "createdAt">>) => void
  deleteMentee: (id: string) => void
  addAssignment: (assignment: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => void
  updateAssignmentStatus: (id: string, status: Assignment["status"], progress: number) => void
  addResource: (resource: Omit<Resource, "id" | "createdAt">) => void
  addSession: (session: Omit<Session, "id">) => void
  updateSession: (id: string, session: Partial<Session>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      userRole: null,
      mentees: mockMentees,
      mentors: mockMentors,
      assignments: mockAssignments,
      resources: mockResources,
      sessions: mockSessions,

      // Actions
      login: (email, password) => {
        // For demo purposes, we'll just check if the email exists in our mock data
        const mentor = mockMentors.find((m) => m.email === email)
        if (mentor) {
          set({
            currentUser: mentor,
            isAuthenticated: true,
            userRole: "mentor",
          })
          return
        }

        const mentee = mockMentees.find((m) => m.email === email)
        if (mentee) {
          set({
            currentUser: mentee,
            isAuthenticated: true,
            userRole: "mentee",
          })
          return
        }

        // If we get here, no user was found
        alert("Invalid credentials")
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          userRole: null,
        })
      },

      addMentee: (mentee) => {
        const newMentee: Mentee = {
          ...mentee,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
        }

        set((state) => ({
          mentees: [...state.mentees, newMentee],
          // Also update the mentor's mentees list if the current user is a mentor
          mentors: state.mentors.map((mentor) =>
            mentor.id === mentee.mentorId ? { ...mentor, mentees: [...mentor.mentees, newMentee] } : mentor,
          ),
        }))
      },

      updateMentee: (id, menteeData) => {
        set((state) => {
          // Update in mentees array
          const updatedMentees = state.mentees.map((mentee) =>
            mentee.id === id ? { ...mentee, ...menteeData } : mentee
          )
          
          // Update in mentor's mentees list if needed
          const updatedMentors = state.mentors.map((mentor) => {
            const menteeIndex = mentor.mentees.findIndex((m) => m.id === id)
            if (menteeIndex >= 0) {
              const updatedMenteesList = [...mentor.mentees]
              updatedMenteesList[menteeIndex] = {
                ...updatedMenteesList[menteeIndex],
                ...menteeData,
              }
              return { ...mentor, mentees: updatedMenteesList }
            }
            return mentor
          })
          
          return {
            mentees: updatedMentees,
            mentors: updatedMentors,
          }
        })
      },
      
      deleteMentee: (id) => {
        set((state) => {
          // Remove from mentees array
          const filteredMentees = state.mentees.filter((mentee) => mentee.id !== id)
          
          // Remove from mentor's mentees list
          const updatedMentors = state.mentors.map((mentor) => ({
            ...mentor,
            mentees: mentor.mentees.filter((mentee) => mentee.id !== id),
          }))
          
          return {
            mentees: filteredMentees,
            mentors: updatedMentors,
          }
        })
      },

      addAssignment: (assignment) => {
        const newAssignment: Assignment = {
          ...assignment,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          assignments: [...state.assignments, newAssignment],
        }))
      },

      updateAssignmentStatus: (id, status, progress) => {
        set((state) => ({
          assignments: state.assignments.map((assignment) =>
            assignment.id === id ? { ...assignment, status, progress, updatedAt: new Date() } : assignment,
          ),
        }))
      },

      addResource: (resource) => {
        const newResource: Resource = {
          ...resource,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
        }

        set((state) => ({
          resources: [...state.resources, newResource],
        }))
      },

      addSession: (session) => {
        const newSession: Session = {
          ...session,
          id: Math.random().toString(36).substring(2, 9),
        }

        set((state) => ({
          sessions: [...state.sessions, newSession],
        }))
      },

      updateSession: (id, sessionUpdate) => {
        set((state) => ({
          sessions: state.sessions.map((session) => (session.id === id ? { ...session, ...sessionUpdate } : session)),
        }))
      },
    }),
    {
      name: "mentoring-app-storage",
    },
  ),
)