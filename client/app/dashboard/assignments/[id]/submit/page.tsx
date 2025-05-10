"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createSubmission } from "@/lib/actions/submissions"
import { getCurrentUser } from "@/lib/actions/users"

export default function SubmitAssignmentPage({ params }: { params: { id: string } }) {
  const [snippet, setSnippet] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await getCurrentUser()
      await createSubmission({
        assignment_id: params.id,
        mentee_id: user.id,
        snippet,
        completed: false
      })

      toast({
        title: "Success",
        description: "Submission created successfully"
      })
      router.push("/dashboard/submissions")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create submission"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Submit Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="snippet">Your Solution</Label>
            <Textarea
              id="snippet"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              rows={10}
              required
              placeholder="Enter your code or solution here..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Assignment"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
} 