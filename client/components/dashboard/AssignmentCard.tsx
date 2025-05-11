import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users } from 'lucide-react'

interface AssignmentCardProps {
  title: string
  description: string
  dueDate: string
  submissions: number
  totalMentees: number
}

export function AssignmentCard({
  title,
  description,
  dueDate,
  submissions,
  totalMentees
}: AssignmentCardProps) {
  const progress = (submissions / totalMentees) * 100
  
  // Format date
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant={getDueDateVariant(dueDate)}>
            {formattedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Submission Progress</span>
            <span className="font-medium">{submissions}/{totalMentees}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          <span>Due {formattedDate}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Users className="mr-1 h-3 w-3" />
          <span>{totalMentees} mentees</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">View</Button>
      </CardFooter>
    </Card>
  )
}

function getDueDateVariant(dueDate: string): "default" | "secondary" | "destructive" {
  const now = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "destructive"
  if (diffDays < 7) return "secondary"
  return "default"
}
