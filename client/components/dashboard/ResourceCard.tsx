import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, FileText } from 'lucide-react'

interface ResourceCardProps {
  title: string
  url: string
  createdAt: string
  assignmentTitle?: string
}

export function ResourceCard({
  title,
  url,
  createdAt,
  assignmentTitle
}: ResourceCardProps) {
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="mr-1 h-3 w-3" />
          <span>Added on {formattedDate}</span>
        </div>
        {assignmentTitle && (
          <Badge variant="outline" className="mt-1">
            <FileText className="mr-1 h-3 w-3" />
            {assignmentTitle}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          Visit Resource
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}
