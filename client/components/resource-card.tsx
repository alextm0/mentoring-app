import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Resource } from "@/types"
import { formatDate } from "@/lib/utils"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
        <CardDescription>Added on {formatDate(resource.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/resources/${resource.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Resource
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
