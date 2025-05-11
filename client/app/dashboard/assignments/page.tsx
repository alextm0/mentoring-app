"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAssignments, getMenteeAssignments, deleteAssignment } from "@/lib/actions/assignments"
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

export default function AssignmentsPage() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)

  const loadData = async () => {
    try {
      // Get user first
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Then fetch assignments based on role
      if (userData.role === "MENTOR") {
        const data = await getAssignments()
        setAssignments(data)
      } else {
        const data = await getMenteeAssignments()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Failed to load assignments:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id)
      setAssignments(prev => prev.filter(a => a.id !== id))
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      })
    } catch (error) {
      console.error("Failed to delete assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment. Please try again."
      })
    } finally {
      setDeleteDialogOpen(false)
      setAssignmentToDelete(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            {user?.role === "MENTOR"
              ? "Create and manage assignments for your mentees"
              : "View and complete your assignments"}
          </p>
        </div>
        {user?.role === "MENTOR" && (
          <Link href="/dashboard/assignments/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </Link>
        )}
      </div>

      {assignments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col">
              <CardContent className="flex flex-col flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(assignment.created_at), 'PPP')}
                    </p>
                  </div>
                  {user?.role === "MENTOR" && (
                    <div className="flex gap-2 ml-4">
                      <Link href={`/dashboard/assignments/${assignment.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setAssignmentToDelete(assignment.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                  {assignment.description || "No description provided."}
                </p>
                <div className="mt-4">
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    <Button variant="link" className="text-sm p-0 h-auto">
                      View Details →
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
            No assignments found.{" "}
            {user?.role === "MENTOR" 
              ? "Create your first assignment!" 
              : "You don't have any assignments yet."}
          </CardContent>
        </Card>
      )}

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
              onClick={() => assignmentToDelete && handleDelete(assignmentToDelete)}
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
