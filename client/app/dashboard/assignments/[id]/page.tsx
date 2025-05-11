"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getAssignmentById, updateAssignment, deleteAssignment } from "@/lib/actions/assignments"
import { getCurrentUser } from "@/lib/actions/users"
import type { Assignment, User } from "@/types"
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
import Link from "next/link"

export default function AssignmentDetailPage() {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const params = useParams<{ id: string }>();

  const loadData = async () => {
    try {
      // Get user first
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Then load assignment
      const data = await getAssignmentById(params.id)
      setAssignment(data)
      setTitle(data.title)
      setDescription(data.description || "")
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

  useEffect(() => {
    loadData()
  }, [params.id])

  const handleUpdate = async () => {
    if (!assignment) return

    try {
      const updatedAssignment = await updateAssignment(params.id, {
        ...assignment,
        title,
        description
      })
      
      setAssignment(updatedAssignment)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      })
    } catch (error) {
      console.error("Failed to update assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update assignment"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAssignment(params.id)
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      })
      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Failed to delete assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment"
      })
    } finally {
      setDeleteDialogOpen(false)
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

  const canEdit = user?.role === "MENTOR" && user.id === assignment.mentor_id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Assignment" : assignment.title}
        </h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/assignments")}>
          Back to Assignments
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Details" : "Assignment Details"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Created by: {assignment.mentor_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created on: {format(new Date(assignment.created_at), 'PPP')}
                </p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">
                  {assignment.description || "No description provided."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </>
          ) : (
            <>
              {canEdit && (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                </>
              )}
              {user?.role === "MENTEE" && (
                <Link href={`/dashboard/submissions/create?assignmentId=${assignment.id}`}>
                  <Button>Submit Assignment</Button>
                </Link>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment
              and all associated submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
