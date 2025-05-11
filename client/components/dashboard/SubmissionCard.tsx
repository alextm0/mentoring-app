import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

interface SubmissionCardProps {
  menteeName: string
  assignmentTitle: string
  submittedAt: string
  completed: boolean
  snippet: string
}

export function SubmissionCard({
  menteeName,
  assignmentTitle,
  submittedAt,
  completed,
  snippet
}: SubmissionCardProps) {
  // Format date
  const formattedDate = new Date(submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/avatars/${menteeName.replace(/\s+/g, '').toLowerCase()}.png`} />
              <AvatarFallback>{getInitials(menteeName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{menteeName}</CardTitle>
              <p className="text-sm text-muted-foreground">{assignmentTitle}</p>
            </div>
          </div>
          <Badge variant={completed ? "default" : "secondary"}>
            {completed ? (
              <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
            ) : (
              <><XCircle className="mr-1 h-3 w-3" /> Pending</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="mr-1 h-3 w-3" />
          <span>Submitted on {formattedDate}</span>
        </div>
        <div className="mt-2 rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-50">
          <pre className="overflow-x-auto">{snippet}</pre>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          {completed ? "View Feedback" : "Add Feedback"}
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          View Full Submission
        </Button>
      </CardFooter>
    </Card>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
}
