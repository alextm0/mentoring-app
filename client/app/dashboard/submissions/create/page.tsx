"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createSubmission } from "@/lib/actions/submissions"
import { getAssignmentById } from "@/lib/actions/assignments"
import { Assignment } from "@/types"

// Component that uses useSearchParams
function CreateSubmissionContent() {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [snippet, setSnippet] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const assignmentId = searchParams.get("assignmentId")

  useEffect(() => {
    // If no assignment ID, redirect to assignments page
    if (!assignmentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No assignment specified"
      })
      router.push("/dashboard/assignments")
      return
    }

    const loadAssignment = async () => {
      try {
        const data = await getAssignmentById(assignmentId)
        setAssignment(data)
      } catch (error) {
        console.error("Failed to load assignment:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load assignment details"
        })
        router.push("/dashboard/assignments")
      } finally {
        setIsLoading(false)
      }
    }

    loadAssignment()
  }, [assignmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignmentId || !snippet.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide your code snippet"
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createSubmission({
        assignment_id: assignmentId,
        snippet,
        completed: false
      })

      toast({
        title: "Success",
        description: "Submission created successfully"
      })
      
      // Redirect to submissions list
      router.push("/dashboard/submissions")
    } catch (error) {
      console.error("Failed to create submission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create submission"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Assignment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Submit Assignment</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/assignments")}>
          Back to Assignments
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment: {assignment.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {assignment.description || "No description provided."}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="snippet">Your Code Submission</Label>
                <Textarea
                  id="snippet"
                  placeholder="Paste your code here..."
                  value={snippet}
                  onChange={(e) => setSnippet(e.target.value)}
                  rows={12}
                  className="font-mono"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/assignments/${assignmentId}`)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Main page component with Suspense boundary
export default function CreateSubmissionPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>}>
      <CreateSubmissionContent />
    </Suspense>
  )
}