"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, CalendarIcon, GraduationCap } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MenteeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { mentees, assignments, sessions } = useAppStore()
  const [activeTab, setActiveTab] = useState("overview")

  // Find the mentee
  const mentee = mentees.find((m) => m.id === params.menteeId)

  // Get mentee's assignments
  const menteeAssignments = assignments.filter((a) => a.menteeId === params.menteeId)
  const completedAssignments = menteeAssignments.filter((a) => a.status === "completed" || a.status === "reviewed")
  const pendingAssignments = menteeAssignments.filter((a) => a.status !== "completed" && a.status !== "reviewed")

  // Get mentee's sessions
  const menteeSessions = sessions.filter((s) => s.menteeId === params.menteeId)
  const upcomingSessions = menteeSessions.filter((s) => s.status === "scheduled" && new Date(s.date) > new Date())
  const pastSessions = menteeSessions.filter((s) => s.status === "completed" || new Date(s.date) < new Date())

  if (!mentee) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Mentee not found</h2>
          <p className="text-muted-foreground">The mentee you're looking for doesn't exist.</p>
          <Button variant="link" onClick={() => router.back()} className="mt-4">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Mentees
      </Button>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Mentee Profile Card */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={mentee.name} />
                <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{mentee.name}</CardTitle>
                <CardDescription>{mentee.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{mentee.progress}%</span>
              </div>
              <Progress value={mentee.progress} className="h-2" />
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {mentee.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid flex-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingAssignments.length} pending assignments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingSessions.length} upcoming sessions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your mentee's recent progress and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add recent activity timeline here */}
              <div className="text-sm text-muted-foreground">No recent activity</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Track and manage your mentee's assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menteeAssignments.length > 0 ? (
                  menteeAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">Due {assignment.dueDate}</p>
                      </div>
                      <Badge variant={assignment.status === "completed" ? "default" : "secondary"}>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No assignments yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>View past and upcoming mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menteeSessions.length > 0 ? (
                  menteeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {new Date(session.date).toLocaleDateString()} {session.startTime} - {session.endTime}
                        </div>
                      </div>
                      <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No sessions scheduled</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
