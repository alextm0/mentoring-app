"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, BookOpenIcon, FileTextIcon, LinkIcon, VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"

export default function AddResourcePage() {
  const router = useRouter()
  const { isAuthenticated, userRole, currentUser, addResource } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [type, setType] = useState<"article" | "video" | "pdf" | "other">("article")

  // Protect the route
  useEffect(() => {
    if (!isAuthenticated || userRole !== "mentor") {
      alert(`isAuthenticated ${isAuthenticated} | userRole ${userRole}`)
      router.push("/login")
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== "mentor") {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Add the new resource
    addResource({
      title,
      description,
      url,
      type,
      mentorId: currentUser?.id || "",
    })

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/mentor")
    }, 1000)
  }

  return (
    <div className="container max-w-2xl py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Learning Resource</CardTitle>
          <CardDescription>Share a helpful resource with your mentees</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resource Title</Label>
              <Input
                id="title"
                placeholder="React Hooks Deep Dive"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of the resource..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/resource"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Resource Type</Label>
              <RadioGroup
                defaultValue="article"
                value={type}
                onValueChange={(value) => setType(value as any)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="article" id="article" />
                  <Label htmlFor="article" className="flex items-center">
                    <BookOpenIcon className="mr-1 h-4 w-4" />
                    Article
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center">
                    <VideoIcon className="mr-1 h-4 w-4" />
                    Video
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileTextIcon className="mr-1 h-4 w-4" />
                    PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex items-center">
                    <LinkIcon className="mr-1 h-4 w-4" />
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding Resource..." : "Add Resource"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

