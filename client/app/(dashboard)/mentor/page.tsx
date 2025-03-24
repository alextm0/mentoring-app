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

export default function MentorDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, userRole, currentUser, mentees, assignments } = useAppStore()

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
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/mentor/schedule">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Session
            </Link>
          </Button>

          <Button asChild>
            <Link href="/mentor/mentees/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Mentee
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetrics />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-mentees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-mentees">All Mentees</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* All Mentees Tab */}
        <TabsContent value="all-mentees" className="space-y-4">
          {/* Pagination & Page Size Controls */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredMentees.length > 0 ? (
                <>
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredMentees.length)} of{" "}
                  {filteredMentees.length} mentees
                </>
              ) : (
                <>No mentees found</>
              )}
            </p>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[80px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mentee Table */}
          {filteredMentees.length > 0 ? (
            <MenteeTable
              mentees={currentMentees}
              filters={{
                searchQuery,
                categoryFilter,
                progressFilter,
                assignmentFilter
              }}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Mentees</CardTitle>
                <CardDescription>
                  Try adjusting your filters or adding a new mentee.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Activity Heatmap</CardTitle>
              <CardDescription>
                View session distribution across days and times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionHeatmap />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingSessionsList />
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/mentor/schedule">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    See calendar
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule New Session</CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleSessionForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab (Not implemented in your snippet) */}
        <TabsContent value="recent-activity" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recent activity functionality goes here...
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
