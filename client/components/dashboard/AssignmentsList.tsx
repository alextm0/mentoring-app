"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircleIcon, ClockIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/lib/store"

export function AssignmentsList() {
  const [filter, setFilter] = useState<string>("all")
  const { assignments, currentUser } = useAppStore()

  // Filter assignments for the current mentee
  const menteeAssignments = assignments.filter((assignment) => assignment.menteeId === currentUser?.id)

  const filteredAssignments = menteeAssignments.filter((assignment) => {
    if (filter === "all") return true
    if (filter === "pending") return assignment.status !== "completed" && assignment.status !== "reviewed"
    if (filter === "completed") return assignment.status === "completed" || assignment.status === "reviewed"
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Assignments</h2>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {assignment.status === "completed" || assignment.status === "reviewed" ? (
                  <Badge variant="default" className="bg-green-500">
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    {assignment.status === "in-progress" ? "In Progress" : "Not Started"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ClockIcon className="h-4 w-4" />
                <span>Due: {assignment.dueDate}</span>
              </div>
              <Progress value={assignment.progress} className="h-2" />
            </CardContent>
            <CardFooter>
              {assignment.status !== "completed" && assignment.status !== "reviewed" ? (
                <Button asChild className="w-full">
                  <Link href={`/mentee/assignments/${assignment.id}`}>
                    {assignment.status === "not-started" ? "Start Assignment" : "Continue Working"}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/mentee/assignments/${assignment.id}`}>
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    View Feedback
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

