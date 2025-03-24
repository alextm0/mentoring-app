import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Assignment, Mentee, Mentor, Resource, Session, User } from "./types"

// Mock data
export const mockMentees = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "mentee" as const,
    mentorId: "1",
    status: "active",
    progress: 85,
    lastActive: new Date(2024, 2, 15),
    createdAt: new Date(2024, 0, 15),
    skills: ["React", "TypeScript", "Node.js"],
    goals: ["Full Stack Development", "System Architecture"],
    notes: "Quick learner, excellent problem-solving skills",
    categories: ["Web Development", "Full Stack"],
    assignments: [
      {
        id: "1",
        title: "Build a Full Stack Application",
        description: "Create a complete web application using React and Node.js",
        dueDate: new Date(2024, 5, 1),
        status: "in_progress",
        progress: 75,
        type: "project",
        createdAt: new Date(2024, 2, 1),
      },
      {
        id: "2",
        title: "System Design Interview Prep",
        description: "Practice system design questions and architecture patterns",
        dueDate: new Date(2024, 5, 15),
        status: "pending",
        progress: 0,
        type: "interview",
        createdAt: new Date(2024, 2, 10),
      },
    ],
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.r@example.com",
    role: "mentee" as const,
    mentorId: "1",
    status: "active",
    progress: 60,
    lastActive: new Date(2024, 2, 20),
    createdAt: new Date(2024, 0, 20),
    skills: ["Python", "Data Science", "Machine Learning"],
    goals: ["Data Engineering", "AI/ML Development"],
    notes: "Strong mathematical background, needs more practical experience",
    categories: ["Data Science", "Machine Learning"],
    assignments: [
      {
        id: "3",
        title: "Data Pipeline Project",
        description: "Build an ETL pipeline using Python and Apache Airflow",
        dueDate: new Date(2024, 5, 10),
        status: "pending",
        progress: 0,
        type: "project",
        createdAt: new Date(2024, 2, 15),
      },
    ],
  },
  {
    id: "3",
    name: "Emma Thompson",
    email: "emma.t@example.com",
    role: "mentee" as const,
    mentorId: "1",
    status: "active",
    progress: 95,
    lastActive: new Date(2024, 2, 18),
    createdAt: new Date(2024, 0, 25),
    skills: ["Java", "Spring Boot", "Microservices"],
    goals: ["Backend Development", "Cloud Architecture"],
    notes: "Excellent communication skills, team player",
    categories: ["Backend Development", "Cloud Computing"],
    assignments: [
      {
        id: "4",
        title: "Microservices Architecture",
        description: "Design and implement a microservices-based system",
        dueDate: new Date(2024, 3, 5),
        status: "completed",
        progress: 100,
        type: "project",
        createdAt: new Date(2024, 2, 1),
      },
    ],
  },
  {
    id: "21",
    name: "Alex Turner",
    email: "alex.t@example.com",
    role: "mentee" as const,
    mentorId: "1",
    status: "active",
    progress: 75,
    lastActive: new Date(2024, 2, 22),
    createdAt: new Date(2024, 0, 30),
    skills: ["JavaScript", "React", "UI/UX"],
    goals: ["Frontend Development", "User Experience"],
    notes: "Creative developer with strong design sense",
    categories: ["Frontend Development", "UI/UX"],
    assignments: [
      {
        id: "5",
        title: "Design System Implementation",
        description: "Create a reusable component library with Storybook",
        dueDate: new Date(2024, 3, 8),
        status: "pending",
        progress: 0,
        type: "project",
        createdAt: new Date(2024, 2, 20),
      },
    ],
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 45,
    categories: ["Data Structures"],
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "5",
    name: "Ethan Hunt",
    email: "ethan@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 60,
    categories: ["Algorithms"],
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 85,
    categories: ["Web Development"],
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "7",
    name: "George Miller",
    email: "george@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 40,
    categories: ["System Design"],
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "8",
    name: "Hannah Baker",
    email: "hannah@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 70,
    categories: ["Mobile Development"],
    createdAt: new Date("2024-02-25"),
  },
  {
    id: "9",
    name: "Ian Curtis",
    email: "ian@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 55,
    categories: ["Database Design"],
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "10",
    name: "Julia Chen",
    email: "julia@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 95,
    categories: ["Cloud Computing"],
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "11",
    name: "Kevin Hart",
    email: "kevin@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 25,
    categories: ["DevOps"],
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "12",
    name: "Laura Palmer",
    email: "laura@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 80,
    categories: ["Security"],
    createdAt: new Date("2024-03-12"),
  },
  {
    id: "13",
    name: "Mike Wheeler",
    email: "mike@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 50,
    categories: ["Machine Learning"],
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "14",
    name: "Nina Simone",
    email: "nina@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 65,
    categories: ["UI/UX Design"],
    createdAt: new Date("2024-03-17"),
  },
  {
    id: "15",
    name: "Oscar Martinez",
    email: "oscar@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 35,
    categories: ["Testing"],
    createdAt: new Date("2024-03-20"),
  },
  {
    id: "16",
    name: "Pam Beesly",
    email: "pam@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 88,
    categories: ["Web Development"],
    createdAt: new Date("2024-03-22"),
  },
  {
    id: "17",
    name: "Quinn Fabray",
    email: "quinn@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 42,
    categories: ["Mobile Development"],
    createdAt: new Date("2024-03-24"),
  },
  {
    id: "18",
    name: "Rachel Green",
    email: "rachel@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 73,
    categories: ["Cloud Computing"],
    createdAt: new Date("2024-03-25"),
  },
  {
    id: "19",
    name: "Sam Wilson",
    email: "sam@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 58,
    categories: ["System Design"],
    createdAt: new Date("2024-03-26"),
  },
  {
    id: "20",
    name: "Tina Cohen",
    email: "tina@example.com",
    role: "mentee" as const,
    mentorId: "1",
    progress: 92,
    categories: ["Programming Fundamentals"],
    createdAt: new Date("2024-03-27"),
  }
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
  {
    id: "5",
    title: "Data Structures Practice",
    description: "Complete practice problems on arrays and linked lists.",
    dueDate: "Mar 22, 2024",
    status: "not-started",
    progress: 0,
    mentorId: "1",
    menteeId: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "System Design Review",
    description: "Review and document system design patterns.",
    dueDate: "Mar 24, 2024",
    status: "in-progress",
    progress: 30,
    mentorId: "1",
    menteeId: "3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    title: "Frontend Testing",
    description: "Write unit tests for React components.",
    dueDate: "Mar 26, 2024",
    status: "not-started",
    progress: 0,
    mentorId: "1",
    menteeId: "4",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    title: "Backend API Design",
    description: "Design RESTful API endpoints for a new feature.",
    dueDate: "Mar 28, 2024",
    status: "in-progress",
    progress: 45,
    mentorId: "1",
    menteeId: "5",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
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
  deleteSession: (id: string) => void
}

export const useAppStore = create<AppState>()(
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

    deleteSession: (id) => {
      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id)
      }))
    },
  }),
)