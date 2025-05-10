"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getResource, updateResource, deleteResource } from "@/lib/actions/resources"
import type { Resource } from "@/types"

export default function ResourceDetailPage() {
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const params = useParams<{ id: string }>();

  useEffect(() => {
    const loadResource = async () => {
      try {
        const data = await getResource(params.id)
        setResource(data)
        setTitle(data.title)
        setDescription(data.description)
        setUrl(data.url)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resource"
        })
        router.push("/dashboard/resources")
      } finally {
        setIsLoading(false)
      }
    }
    loadResource()
  }, [params.id])

  const handleUpdate = async () => {
    try {
      const updated = await updateResource(params.id, {
        ...resource,
        title,
        description,
        url
      })
      setResource(updated)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Resource updated"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update resource"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteResource(params.id)
      toast({
        title: "Success",
        description: "Resource deleted"
      })
      router.push("/dashboard/resources")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      })
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!resource) return <div>Resource not found</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Resource" : resource.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>{resource.description}</p>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View Resource
            </a>
          </div>
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
