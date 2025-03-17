"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useAppStore } from "@/lib/store"
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics"
import { MenteeTable } from "@/components/dashboard/MenteeTable"
import { ScheduleSessionForm } from "@/components/dashboard/ScheduleSessionForm"
import { UpcomingSessionsList } from "@/components/dashboard/UpcomingSessionsList"

export default function MentorDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, userRole, currentUser } = useAppStore()

  // Protect the route
  useEffect(() => {
    if (!isAuthenticated || userRole !== "mentor") {
      router.push("/login")
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== "mentor") {
    return null
  }

  return (
    <div className="flex flex-col gap-6 p-6">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetrics />
      </div>

      <Tabs defaultValue="all-mentees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-mentees">All Mentees</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="all-mentees" className="space-y-4">
          <MenteeTable />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
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
      </Tabs>
    </div>
  )
}

