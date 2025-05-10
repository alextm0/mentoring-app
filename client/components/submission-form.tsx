"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createSubmission } from "@/lib/api"

interface SubmissionFormProps {
  assignmentId: string
}

export function SubmissionForm({ assignmentId }: SubmissionFormProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createSubmission({ assignmentId, code })
      toast({
        title: "Submission successful",
        description: "Your solution has been submitted successfully.",
      })
      setCode("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Failed to submit your solution. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={15}
        className="font-mono"
        required
      />
      <Button type="submit" disabled={isLoading || !code.trim()}>
        {isLoading ? "Submitting..." : "Submit Solution"}
      </Button>
    </form>
  )
}
