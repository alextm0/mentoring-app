"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from "lucide-react"
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import api from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAppStore } from "@/lib/store"
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics"
import { MenteeTable } from "@/components/dashboard/MenteeTable"
import { ScheduleSessionForm } from "@/components/dashboard/ScheduleSessionForm"
import { UpcomingSessionsList } from "@/components/dashboard/UpcomingSessionsList"
import { SessionHeatmap } from "@/components/dashboard/SessionHeatmap"

const PAGE_SIZES = [5, 10, 20, 50]

interface Assignment {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function MentorDashboard() {
  const router = useRouter()
  const { isAuthenticated, userRole, currentUser, mentees } = useAppStore()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ──────────────────────────────────────────────────────────────────────────
  // 1) Auth Guard
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // If not authenticated or not a mentor, redirect to login
    if (!isAuthenticated || userRole !== "mentor") {
      router.push("/login")
    }
  }, [isAuthenticated, userRole, router])

  // If the store hasn't loaded yet or the user isn't a mentor, show nothing (or a loading state)
  if (!isAuthenticated || userRole !== "mentor") {
    return null
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2) State for Filters & Pagination
  // ──────────────────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [progressFilter, setProgressFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")

  // ──────────────────────────────────────────────────────────────────────────
  // 3) Filtering Logic
  // ──────────────────────────────────────────────────────────────────────────
  const filteredMentees = useMemo(() => {
    return mentees.filter((mentee) => {
      // Safely handle potential missing data
      const name = mentee.name?.toLowerCase() ?? ""
      const email = mentee.email?.toLowerCase() ?? ""
      const categories = mentee.categories ?? []
      const progress = mentee.progress ?? 0

      // Get pending assignments count for this mentee
      const pendingAssignments = assignments.filter(
        a => a.menteeId === mentee.id && a.status !== "completed" && a.status !== "reviewed"
      ).length

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          name.includes(query) ||
          email.includes(query) ||
          categories.some(category => category.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== "all" && !categories.includes(categoryFilter)) {
        return false
      }

      // Progress filter
      if (progressFilter !== "all") {
        if (progressFilter === "high" && progress < 70) return false
        if (progressFilter === "medium" && (progress < 40 || progress >= 70)) return false
        if (progressFilter === "low" && progress >= 40) return false
      }

      // Assignment filter
      if (assignmentFilter !== "all") {
        if (assignmentFilter === "none" && pendingAssignments > 0) return false
        if (assignmentFilter === "pending" && pendingAssignments === 0) return false
      }

      return true
    })
  }, [mentees, assignments, searchQuery, categoryFilter, progressFilter, assignmentFilter])

  // ──────────────────────────────────────────────────────────────────────────
  // 4) Pagination Calculation
  // ──────────────────────────────────────────────────────────────────────────
  // Avoid "Page 1 of 0" by using at least 1 page if no mentees
  const totalPages = filteredMentees.length === 0
    ? 1
    : Math.ceil(filteredMentees.length / pageSize)

  // Ensure currentPage never exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentMentees = filteredMentees.slice(startIndex, endIndex)

  // ──────────────────────────────────────────────────────────────────────────
  // 5) Handlers
  // ──────────────────────────────────────────────────────────────────────────
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const handleFilterChange = {
    search: (value: string) => {
      setSearchQuery(value)
      setCurrentPage(1)
    },
    category: (value: string) => {
      setCategoryFilter(value)
      setCurrentPage(1)
    },
    progress: (value: string) => {
      setProgressFilter(value)
      setCurrentPage(1)
    },
    assignment: (value: string) => {
      setAssignmentFilter(value)
      setCurrentPage(1)
    },
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6) Render
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await api.get('/assignments')
        setAssignments(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  return (
    <ProtectedRoute roles={['MENTOR']}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Mentor Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 border rounded-lg shadow-sm"
              >
                <h2 className="text-xl font-semibold">{assignment.title}</h2>
                <p className="text-gray-600 mt-2">{assignment.description}</p>
                <div className="text-sm text-gray-500 mt-2">
                  Created: {new Date(assignment.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
