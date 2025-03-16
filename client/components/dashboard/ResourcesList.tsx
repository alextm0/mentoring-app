"use client"

import { BookOpenIcon, ExternalLinkIcon, FileTextIcon, VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export function ResourcesList() {
  const { resources } = useAppStore()

  const getIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpenIcon className="h-5 w-5" />
      case "video":
        return <VideoIcon className="h-5 w-5" />
      case "pdf":
        return <FileTextIcon className="h-5 w-5" />
      default:
        return <BookOpenIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Learning Resources</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getIcon(resource.type)}
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Added: {resource.createdAt.toLocaleDateString()}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  Open Resource
                  <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

