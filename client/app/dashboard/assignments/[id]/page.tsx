"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getAssignmentById, updateAssignment, deleteAssignment } from "@/lib/actions/assignments"
import type { Assignment } from "@/types"
import { format } from "date-fns"

export default function AssignmentDetailPage() {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const params = useParams<{ id: string }>();

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const data = await getAssignmentById(params.id)
        setAssignment(data)
        setTitle(data.title)
        setDescription(data.description || "")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load assignment"
        })
        router.push("/dashboard/assignments")
      } finally {
        setIsLoading(false)
      }
    }
    loadAssignment()
  }, [params.id])

  const handleUpdate = async () => {
    try {
      if (!assignment) return

      const updated = await updateAssignment(params.id, {
        ...assignment,
        title,
        description,
      })
      setAssignment(updated)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      })
    } catch (error) {
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment"
      })
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
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignment.description}
                </p>
              </div>

              <div>
                <Label>Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  PENDING
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
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
