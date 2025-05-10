import type { Comment } from "@/types"
import { formatDate } from "@/lib/utils"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No comments yet.</div>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{comment.mentor?.name}</div>
            <div className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</div>
          </div>
          {comment.lineNumber && <div className="text-sm text-muted-foreground mb-2">Line {comment.lineNumber}</div>}
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}
