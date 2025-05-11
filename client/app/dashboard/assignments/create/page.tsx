"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createAssignment } from "@/lib/actions/assignments"
import { getCurrentUser } from "@/lib/actions/users"

export default function CreateAssignmentPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required"
      })
      return
    }
    
    setIsLoading(true)

    try {
      const user = await getCurrentUser()
      
      await createAssignment({
        mentor_id: user.id,
        title,
        description: description || undefined
      })

      toast({
        title: "Success",
        description: "Assignment created successfully"
      })
      
      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Failed to create assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create assignment. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/assignments")}>
          Cancel
        </Button>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter assignment description (optional)"
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
