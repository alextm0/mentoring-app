"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import type { Submission } from "@/types"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@/types"
import { getCurrentUser } from "@/lib/actions/users"

interface SubmissionListProps {
  submissions: Submission[]
  assignmentId?: string
  onSubmissionUpdate?: (submission: Submission) => void
  viewOnly?: boolean
}

export function SubmissionList({
  submissions,
  assignmentId,
  onSubmissionUpdate,
  viewOnly = false,
}: SubmissionListProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch {
        router.push('/login')
      }
    }
    fetchUser()
  }, [getCurrentUser, router])

  if (!user) return null

  if (submissions.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No submissions found.</div>
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{assignmentId ? submission.mentee_id : submission.assignment_id}</CardTitle>
                <CardDescription>Submitted on {formatDate(submission.created_at)}</CardDescription>
              </div>
              <div
                className={`px-3 py-1 text-xs rounded-full ${
                  submission.completed
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                }`}
              >
                {submission.completed ? "Completed" : "Pending"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 font-mono">
              {submission.code.substring(0, 150)}...
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={`/dashboard/submissions/${submission.id}`}>
              <Button variant="outline">View Details</Button>
            </Link>

            {!viewOnly && user?.role === "MENTOR" && (
              <Button
                variant={submission.completed ? "destructive" : "default"}
                size="sm"
                className="gap-2"
                onClick={() => {
                  // This would be implemented with the actual toggle API call
                  if (onSubmissionUpdate) {
                    const updated = {
                      ...submission,
                      completed: !submission.completed,
                    }
                    onSubmissionUpdate(updated)
                  }
                }}
              >
                {submission.completed ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Mark as Pending
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Mark as Completed
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
