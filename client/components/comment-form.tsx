"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createComment } from "@/lib/api"
import type { Comment } from "@/types"

interface CommentFormProps {
  submissionId: string
  onCommentAdded: (comment: Comment) => void
}

export function CommentForm({ submissionId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [lineNumber, setLineNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newComment = await createComment({
        submissionId,
        content,
        lineNumber: lineNumber ? Number.parseInt(lineNumber) : undefined,
      })

      onCommentAdded(newComment)
      setContent("")
      setLineNumber("")

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding comment",
        description: "Failed to add your comment. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Comment</Label>
        <Textarea
          id="content"
          placeholder="Enter your feedback..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lineNumber">Line Number (Optional)</Label>
        <Input
          id="lineNumber"
          type="number"
          placeholder="Enter line number"
          value={lineNumber}
          onChange={(e) => setLineNumber(e.target.value)}
          min="1"
        />
      </div>
      <Button type="submit" disabled={isLoading || !content.trim()}>
        {isLoading ? "Adding Comment..." : "Add Comment"}
      </Button>
    </form>
  )
}
