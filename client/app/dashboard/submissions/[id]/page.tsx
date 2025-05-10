"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getSubmissionById, updateSubmission, deleteSubmission } from "@/lib/actions/submissions"
import type { Submission } from "@/types"
import { getCurrentUser } from "@/lib/actions/users"
import { createComment } from "@/lib/actions/comments"

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        const data = await getSubmissionById(params.id)
        setSubmission(data)
        setContent(data.content)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load submission"
        })
        router.push("/dashboard/submissions")
      } finally {
        setIsLoading(false)
      }
    }
    loadSubmission()
  }, [params.id])

  const handleUpdate = async () => {
    try {
      const updated = await updateSubmission(params.id, {
        ...submission,
        content
      })
      setSubmission(updated)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Submission updated"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSubmission(params.id)
      toast({
        title: "Success",
        description: "Submission deleted"
      })
      router.push("/dashboard/submissions")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission"
      })
    }
  }

  const addComment = async () => {
    try {
      const user = await getCurrentUser()
      const comment = await createComment({
        submission_id: params.id,
        mentor_id: user.id,
        line_number: selectedLine,
        comment: newComment
      })
      
      setComments([...comments, comment])
      setNewComment("")
      setSelectedLine(null)
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment"
      })
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!submission) return <div>Submission not found</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Submission" : "Submission Details"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div>
            <Label>Content</Label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{submission.content}</div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
