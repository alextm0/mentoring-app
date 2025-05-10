"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getResources, getMenteeResources, deleteResource } from "@/lib/actions/resources"
import { getCurrentUser } from "@/lib/actions/users"
import type { Resource, User } from "@/types"
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

export default function ResourcesPage() {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      
      const data = userData.role === "MENTOR" 
        ? await getResources()
        : await getMenteeResources()
      
      setResources(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resources"
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
      await deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      })
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            {user?.role === "MENTOR"
              ? "Manage learning resources for your mentees"
              : "Access learning resources from your mentor"}
          </p>
        </div>
        {user?.role === "MENTOR" && (
          <Link href="/dashboard/resources/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          </Link>
        )}
      </div>

      {resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardContent className="flex flex-col flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">{resource.title}</h3>
                  {user?.role === "MENTOR" && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/resources/${resource.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setResourceToDelete(resource.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex-1">{resource.description}</p>
                <div className="mt-4">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Resource →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No resources found.{" "}
            {user?.role === "MENTOR" ? "Add your first resource!" : "Your mentor hasn't shared any resources yet."}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resourceToDelete && handleDelete(resourceToDelete)}
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
