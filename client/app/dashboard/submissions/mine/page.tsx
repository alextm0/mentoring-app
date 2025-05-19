"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getMySubmissions, getMenteeSubmissionForAssignment, deleteSubmission } from "@/lib/actions/submissions"
import { getCurrentUser } from "@/lib/actions/users"
import type { Submission, User } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

// Component that uses useSearchParams
function MySubmissionsContent() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const assignmentId = searchParams.get('assignmentId')

  const loadData = async () => {
    try {
      // First get user data
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Then get submissions based on whether we're filtering by assignment
      let data;
      if (assignmentId) {
        // If looking for a specific assignment's submission
        const submission = await getMenteeSubmissionForAssignment(assignmentId)
        data = submission ? [submission] : []
      } else {
        // Get all submissions
        data = await getMySubmissions()
      }
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to load submissions:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submissions. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [assignmentId])

  const handleDelete = async (id: string) => {
    try {
      await deleteSubmission(id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
      toast({
        title: "Success",
        description: "Submission deleted successfully"
      })
    } catch (error) {
      console.error("Failed to delete submission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission. Please try again."
      })
    } finally {
      setDeleteDialogOpen(false)
      setSubmissionToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground">
            View and manage your assignment submissions
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/assignments">
            View All Assignments
          </Link>
        </Button>
      </div>

      {submissions.length > 0 ? (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {submission.assignment_title || "Assignment Submission"}
                      </h3>
                      <Badge variant={submission.completed ? "default" : "outline"}>
                        {submission.completed ? "Completed by Mentor" : "Awaiting Review"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted on {format(new Date(submission.created_at), 'PPP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/submissions/${submission.id}`}>
                      <Button variant="ghost" size="icon" title="View Submission">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/assignments/${submission.assignment_id}`}>
                      <Button variant="ghost" size="icon" title="View Assignment">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      title="Delete Submission"
                      onClick={() => {
                        setSubmissionToDelete(submission.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 bg-muted p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {submission.snippet.substring(0, 150)}
                    {submission.snippet.length > 150 ? "..." : ""}
                  </pre>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/submissions/${submission.id}`}>
                    <Button variant={submission.completed ? "outline" : "default"}>
                      {submission.completed ? "View Feedback" : "Edit Submission"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            {assignmentId ? (
              <div className="space-y-4">
                <p>No submissions found for this assignment.</p>
                <Button asChild>
                  <Link href={`/dashboard/submissions/create?assignmentId=${assignmentId}`}>
                    Create Submission
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p>You haven't submitted any assignments yet.</p>
                <Button asChild>
                  <Link href="/dashboard/assignments">
                    Browse Assignments
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the submission
              and all associated comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submissionToDelete && handleDelete(submissionToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Main page component with Suspense boundary
export default function MySubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>}>
      <MySubmissionsContent />
    </Suspense>
  )
}