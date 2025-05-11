"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getSubmissionById, getSubmissionWithComments, updateSubmission, deleteSubmission, markSubmissionAsComplete } from "@/lib/actions/submissions"
import { getAssignmentById } from "@/lib/actions/assignments"
import { Assignment, Submission, Comment, User } from "@/types"
import { getCurrentUser } from "@/lib/actions/users"
import { createComment } from "@/lib/actions/comments"
import { Badge } from "@/components/ui/badge"
import { formatDistance, format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, CheckCircle, Clock, MessageSquare, ChevronRight, Code, Calendar, User as UserIcon, CheckCheck, AlignLeft, Trash, Save, Pencil, SendHorizontal, CornerDownLeft } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

// Helper function to safely compare line numbers
const compareLineNumbers = (a: Comment, b: Comment): number => {
  // Check for null/undefined values first
  if ((a.line_number === null || a.line_number === undefined) && 
      (b.line_number === null || b.line_number === undefined)) {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }
  if (a.line_number === null || a.line_number === undefined) return 1;
  if (b.line_number === null || b.line_number === undefined) return -1;
  
  // Both are numbers, direct comparison is safe
  if (a.line_number === b.line_number) {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }
  return a.line_number - b.line_number;
};

export default function SubmissionDetailPage() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user info
        const userData = await getCurrentUser()
        setUserRole(userData.role)
        setUser(userData)
        
        // Load submission with comments
        const submissionData = await getSubmissionWithComments(params.id)
        setSubmission(submissionData)
        setContent(submissionData.snippet)
        if (submissionData.comments) {
          // Sort comments by line number and then by date
          const sortedComments = [...submissionData.comments].sort(compareLineNumbers);
          setComments(sortedComments)
        }
        
        // Load assignment details
        if (submissionData.assignment_id) {
          const assignmentData = await getAssignmentById(submissionData.assignment_id)
          setAssignment(assignmentData)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load submission"
        })
        router.push("/dashboard/submissions")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [params.id])

  const handleUpdate = async () => {
    if (!submission) return;
    
    try {
      const updated = await updateSubmission(params.id, {
        ...submission,
        snippet: content
      })
      
      setSubmission(updated)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Submission updated successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission"
      })
    }
  }

  const handleComplete = async () => {
    if (!submission) return;
    
    try {
      const updated = await markSubmissionAsComplete(params.id)
      setSubmission(updated)
      
      toast({
        title: "Success",
        description: "Submission marked as complete"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark submission as complete"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSubmission(params.id)
      toast({
        title: "Success",
        description: "Submission deleted"
      })
      router.push("/dashboard/submissions")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission"
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      const comment = await createComment({
        submission_id: params.id,
        mentor_id: user.id,
        line_number: selectedLine ?? undefined,
        comment: newComment
      })
      
      // Add the new comment to the list and sort
      const updatedComments = [...comments, comment].sort(compareLineNumbers);
      
      setComments(updatedComments)
      setNewComment("")
      setSelectedLine(null)
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
      
      // Set focus back to the comment box for multiple comments
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment"
      })
    }
  }

  const handleLineClick = (lineNumber: number) => {
    if (userRole !== "MENTOR") return;
    
    if (selectedLine === lineNumber) {
      setSelectedLine(null);
    } else {
      setSelectedLine(lineNumber);
      setActiveTab("comments");
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  if (!submission) return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-zinc-500">Submission not found</p>
    </div>
  )

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return "Invalid date";
    }
  };

  const canEdit = userRole === "MENTEE" && !submission.completed;
  const canMarkComplete = userRole === "MENTOR" && !submission.completed;
  const canAddComment = userRole === "MENTOR";
  
  // Group comments by line number
  const commentsByLine: Record<string, Comment[]> = {};
  comments.forEach(comment => {
    const key = comment.line_number === null ? 'general' : `line-${comment.line_number}`;
    if (!commentsByLine[key]) {
      commentsByLine[key] = [];
    }
    commentsByLine[key].push(comment);
  });
  
  // Calculate some statistics
  const totalComments = comments.length;
  const generalComments = commentsByLine['general']?.length || 0;
  const inlineComments = totalComments - generalComments;
  
  const codeLines = content.split('\n');

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="mb-2 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {assignment?.title || "Submission Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-400">
            <span className="flex items-center">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Submitted {formatDate(submission.created_at)}
            </span>
            <span className="flex items-center">
              <UserIcon className="mr-1 h-3.5 w-3.5" />
              By {submission.mentee_id}
            </span>
            {submission.completed ? (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <CheckCheck className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/20">
                <Clock className="mr-1 h-3 w-3" />
                Pending Review
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className={!isEditing ? "bg-zinc-900 border-zinc-800" : ""}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {isEditing ? "Cancel Edit" : "Edit Submission"}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-zinc-900 border-zinc-800">
                <span>Actions</span>
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
              {canMarkComplete && (
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-zinc-800 text-emerald-400 focus:bg-zinc-800 focus:text-emerald-400"
                  onClick={handleComplete}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Mark as Complete</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                onClick={() => setActiveTab(activeTab === "code" ? "comments" : "code")}
              >
                {activeTab === "code" ? (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>View Comments</span>
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    <span>View Code</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-zinc-800 text-red-400 focus:bg-zinc-800 focus:text-red-400"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Submission</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Info & Stats */}
        <div className="space-y-5">
          {/* Assignment Information Card */}
          {assignment && (
            <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <CardTitle className="text-white text-base">Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <h3 className="font-medium text-zinc-200 text-sm mb-1">{assignment.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-3 mb-3">
                  {assignment.description || "No description provided."}
                </p>
                <Button variant="outline" size="sm" className="w-full border-zinc-800 hover:bg-zinc-800 hover:text-white" asChild>
                  <a href={`/dashboard/assignments/${assignment.id}`} target="_blank" rel="noopener noreferrer">
                    View Full Assignment 
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments Statistics Card */}
          <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <CardTitle className="text-white text-base">Feedback Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-zinc-800/50 p-3 flex flex-col">
                  <span className="text-sm text-zinc-400 mb-1">Total Comments</span>
                  <div className="flex items-center">
                    <MessageSquare className="text-blue-400 h-4 w-4 mr-1.5" />
                    <span className="text-xl font-semibold text-white">{totalComments}</span>
                  </div>
                </div>
                <div className="rounded-md bg-zinc-800/50 p-3 flex flex-col">
                  <span className="text-sm text-zinc-400 mb-1">Inline Notes</span>
                  <div className="flex items-center">
                    <Code className="text-emerald-400 h-4 w-4 mr-1.5" />
                    <span className="text-xl font-semibold text-white">{inlineComments}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  onClick={() => setActiveTab("comments")}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  {totalComments > 0 ? "View All Comments" : "Add Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Code View / Comments View */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-zinc-800/50 border border-zinc-800">
              <TabsTrigger value="code" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Code className="mr-1.5 h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Comments {totalComments > 0 && `(${totalComments})`}
              </TabsTrigger>
            </TabsList>
            
            {/* Code View */}
            <TabsContent value="code" className="mt-4">
              <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur p-0">
                {isEditing ? (
                  <div className="p-4">
                    <Textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)}
                      rows={15}
                      className="font-mono text-sm bg-zinc-900 border-zinc-800 resize-none"
                    />
                    <div className="flex justify-end mt-4 gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setIsEditing(false);
                          setContent(submission.snippet);
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate}>
                        <Save className="mr-1.5 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-22rem)] max-h-[800px]">
                    <div className="relative font-mono text-sm whitespace-pre">
                      <table className="w-full border-collapse">
                        <tbody>
                          {codeLines.map((line, index) => {
                            const lineNumber = index + 1;
                            const hasComments = commentsByLine[`line-${lineNumber}`];
                            const isSelected = selectedLine === lineNumber;
                            
                            return (
                              <tr 
                                key={index}
                                className={`
                                  ${hasComments ? 'bg-blue-500/10 hover:bg-blue-500/15' : 'hover:bg-zinc-800/50'} 
                                  ${isSelected ? 'bg-blue-500/20 hover:bg-blue-500/20' : ''}
                                  ${canAddComment ? 'cursor-pointer' : ''}
                                `}
                                onClick={() => canAddComment && handleLineClick(lineNumber)}
                              >
                                <td className="select-none text-right pr-4 py-0.5 text-zinc-500 border-r border-r-zinc-800 w-12">
                                  {lineNumber}
                                </td>
                                <td className="pl-4 py-0.5 text-zinc-300 whitespace-pre">
                                  {line || ' '}
                                  {hasComments && (
                                    <span className="inline-flex items-center justify-center ml-2 h-4 w-4 rounded-full bg-blue-500/20 text-xs text-blue-400">
                                      {hasComments.length}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                )}
              </Card>
            </TabsContent>
            
            {/* Comments View */}
            <TabsContent value="comments" className="mt-4 space-y-5">
              <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
                <CardHeader className="pb-3 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">
                      {selectedLine ? `Line ${selectedLine} Comments` : "General Comments"}
                    </CardTitle>
                    {selectedLine && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedLine(null)}
                        className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
                      >
                        Show All Comments
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <ScrollArea className={totalComments > 0 ? "h-[calc(100vh-35rem)] max-h-[400px]" : "h-auto"}>
                  <CardContent className="p-0">
                    {(selectedLine 
                      ? commentsByLine[`line-${selectedLine}`] || [] 
                      : comments
                    ).length > 0 ? (
                      <div className="divide-y divide-zinc-800">
                        {(selectedLine 
                          ? commentsByLine[`line-${selectedLine}`] || [] 
                          : comments
                        ).map((comment, i) => (
                          <div key={i} className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                                  {comment.mentor_id?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-white">
                                    {comment.mentor_id}
                                  </p>
                                  <span className="mx-2 text-zinc-600">•</span>
                                  <p className="text-xs text-zinc-500">
                                    {formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })}
                                  </p>
                                  {comment.line_number && !selectedLine && (
                                    <Badge 
                                      variant="outline" 
                                      className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                      onClick={() => setSelectedLine(comment.line_number!)}
                                    >
                                      Line {comment.line_number}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-zinc-300">{comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <div className="rounded-full bg-zinc-800/80 p-3 mb-3">
                          <MessageSquare className="h-5 w-5 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-300 font-medium mb-1">No comments yet</h3>
                        <p className="text-zinc-500 text-center text-sm max-w-md">
                          {canAddComment 
                            ? selectedLine 
                              ? `Add the first comment for line ${selectedLine}` 
                              : "Add the first comment to this submission"
                            : "There are no comments on this submission yet"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
              
              {/* Comment Input */}
              {canAddComment && (
                <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="relative">
                          <Textarea
                            ref={commentInputRef}
                            placeholder={selectedLine 
                              ? `Add comment for line ${selectedLine}...` 
                              : "Add a general comment..."}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="min-h-24 resize-none bg-zinc-800 border-zinc-700 placeholder:text-zinc-500"
                          />
                          {selectedLine && (
                            <Badge className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Line {selectedLine}
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {selectedLine && (
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setSelectedLine(null)}
                                className="h-8 text-xs text-zinc-400 hover:text-white"
                              >
                                Clear line selection
                              </Button>
                            )}
                          </div>
                          <Button 
                            type="button" 
                            onClick={addComment}
                            disabled={!newComment.trim()}
                            className="gap-1"
                          >
                            <SendHorizontal className="h-4 w-4" />
                            Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission and all associated comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
