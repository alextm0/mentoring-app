"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { 
  Plus, Pencil, Trash, FileCheck, FileCode, AlertCircle, Clock, CheckCircle, 
  Filter, Search, Calendar, ArrowUpRight, SlidersHorizontal, Check, User, ChevronRight,
  Bookmark, Book, BookOpen, BarChart3, CheckCheck, GraduationCap, Loader2, 
  ListFilter, Eye, PieChart, LayoutGrid, LayoutList, BarChart
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAssignments, getMenteeAssignments, deleteAssignment } from "@/lib/actions/assignments"
import { getSubmissions, getMySubmissions } from "@/lib/actions/submissions"
import { getCurrentUser } from "@/lib/actions/users"
import type { Assignment, User, Submission } from "@/types"
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
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import useDebounce from "@/lib/hooks/useDebounce"

export default function AssignmentsPage() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFilter, setCurrentFilter] = useState<"all" | "with-submissions" | "no-submissions">("all")
  const [sorting, setSorting] = useState<"newest" | "oldest" | "most-submissions">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all")
  
  // Use debounce to prevent excessive filtering on rapid typing
  const debouncedSearch = useDebounce(searchQuery, 300)

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Get user first
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Use the appropriate function for loading assignments based on role
      const isMentor = userData.role === "MENTOR"
      
      // Parallel data fetching for better performance
      const [assignmentsData, submissionsData] = await Promise.all([
        isMentor ? getAssignments() : getMenteeAssignments(),
        isMentor ? getSubmissions() : getMySubmissions()
      ])
      
      setAssignments(assignmentsData)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Failed to load assignments:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setIsActionLoading(true)
      await deleteAssignment(id)
      setAssignments(prev => prev.filter(a => a.id !== id))
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      })
    } catch (error) {
      console.error("Failed to delete assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment. Please try again."
      })
    } finally {
      setIsActionLoading(false)
      setDeleteDialogOpen(false)
      setAssignmentToDelete(null)
    }
  }

  // Helper function to get submission status for an assignment
  const getSubmissionStatusForAssignment = (assignmentId: string) => {
    if (!submissions || submissions.length === 0) return null;
    
    const assignmentSubmissions = submissions.filter(
      sub => sub.assignment_id === assignmentId
    );
    
    const submissionCount = assignmentSubmissions.length;
    const completedCount = assignmentSubmissions.filter(sub => sub.completed).length;
    
    return {
      total: submissionCount,
      completed: completedCount,
      percentage: submissionCount > 0 ? (completedCount / submissionCount) * 100 : 0,
      hasSubmitted: assignmentSubmissions.length > 0,
      submissionsData: assignmentSubmissions,
      pendingCount: submissionCount - completedCount
    };
  };
  
  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return "Invalid date";
    }
  };

  // Apply filters based on the active tab
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      // First apply tab filter
      if (activeTab === "pending") {
        if (user?.role === "MENTOR") {
          // For mentors, show assignments with pending submissions
          const status = getSubmissionStatusForAssignment(assignment.id);
          if (!status || status.pendingCount === 0) return false;
        } else {
          // For mentees, show assignments not submitted yet
          const status = getSubmissionStatusForAssignment(assignment.id);
          if (status?.hasSubmitted) return false;
        }
      } else if (activeTab === "completed") {
        if (user?.role === "MENTOR") {
          // For mentors, show assignments with all submissions completed
          const status = getSubmissionStatusForAssignment(assignment.id);
          if (!status || status.pendingCount > 0 || status.total === 0) return false;
        } else {
          // For mentees, show only submitted assignments
          const status = getSubmissionStatusForAssignment(assignment.id);
          if (!status?.hasSubmitted) return false;
        }
      }
      
      // Then apply search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        if (!assignment.title.toLowerCase().includes(query) && 
            !(assignment.description?.toLowerCase().includes(query))) {
          return false;
        }
      }
      
      // Then apply submission filter (if different from tab)
      if (currentFilter === "with-submissions") {
        const status = getSubmissionStatusForAssignment(assignment.id);
        if (!status || status.total === 0) return false;
      } else if (currentFilter === "no-submissions") {
        const status = getSubmissionStatusForAssignment(assignment.id);
        if (status && status.total > 0) return false;
      }
      
      return true;
    });
  }, [assignments, debouncedSearch, currentFilter, user, activeTab, submissions]);

  // Memoize sorted assignments
  const sortedAssignments = useMemo(() => {
    return [...filteredAssignments].sort((a, b) => {
      if (sorting === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sorting === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sorting === "most-submissions") {
        const statusA = getSubmissionStatusForAssignment(a.id);
        const statusB = getSubmissionStatusForAssignment(b.id);
        return (statusB?.total || 0) - (statusA?.total || 0);
      }
      return 0;
    });
  }, [filteredAssignments, sorting]);

  // Memoize statistics to prevent recalculations on renders
  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const isMentor = user?.role === "MENTOR";
    
    // Assignments with at least one submission
    const assignmentsWithSubmissions = assignments.filter(
      a => {
        const status = getSubmissionStatusForAssignment(a.id);
        return status && status.total > 0;
      }
    ).length;

    // Count submissions that need review (not completed)
    const pendingReviewCount = submissions.filter(s => !s.completed).length;
    
    // Count completed submissions
    const completedCount = submissions.filter(s => s.completed).length;

    // For mentees, calculate completion rate
    const assignmentsCompletedByMentee = !isMentor && assignments.length > 0 
      ? assignments.filter(a => {
          const status = getSubmissionStatusForAssignment(a.id);
          return status?.hasSubmitted;
        }).length
      : 0;
    
    // Calculate percentage of assignments completed by mentee
    const menteeCompletionRate = !isMentor && assignments.length > 0
      ? Math.round((assignmentsCompletedByMentee / assignments.length) * 100)
      : 0;
      
    return {
      totalAssignments,
      assignmentsWithSubmissions,
      pendingReviewCount,
      completedCount,
      assignmentsCompletedByMentee,
      menteeCompletionRate
    };
  }, [assignments, submissions, user]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-zinc-400">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const isMentor = user?.role === "MENTOR";

  // Render the assignment cards based on the view mode
  const renderAssignmentItem = (assignment: Assignment) => {
    const submissionStatus = getSubmissionStatusForAssignment(assignment.id);
    
    if (viewMode === "grid") {
      return (
        <Card key={assignment.id} className="group bg-zinc-900/70 border-zinc-800 backdrop-blur hover:bg-zinc-800/50 transition-all">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-start justify-between">
              <div className="max-w-[70%]">
                <CardTitle className="text-base font-medium text-white line-clamp-1">
                  {assignment.title}
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-1">
                  <Calendar className="inline-block mr-1 h-3 w-3" />
                  {formatDate(assignment.created_at)}
                </p>
              </div>
              {!isMentor && (
                submissionStatus?.hasSubmitted ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Submitted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )
              )}
            </div>
          </CardHeader>
          <CardContent className="px-5 pt-0 pb-3">
            <p className="text-xs text-zinc-400 line-clamp-2 h-10">
              {assignment.description || "No description provided."}
            </p>
            
            {isMentor && submissionStatus && submissionStatus.total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{submissionStatus.completed}/{submissionStatus.total} complete</span>
                  <span>{Math.round(submissionStatus.percentage)}%</span>
                </div>
                <Progress 
                  value={submissionStatus.percentage} 
                  className="h-1.5 bg-zinc-800"
                  style={{
                    "--progress-background": submissionStatus.percentage > 70 
                      ? "linear-gradient(90deg, rgb(52 211 153 / 0.9), rgb(16 185 129 / 0.9))"
                      : submissionStatus.percentage > 30
                        ? "linear-gradient(90deg, rgb(251 146 60 / 0.9), rgb(249 115 22 / 0.9))"
                        : "linear-gradient(90deg, rgb(239 68 68 / 0.9), rgb(220 38 38 / 0.9))"
                  } as React.CSSProperties}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-5 pt-2 justify-between">
            {isMentor ? (
              <div className="flex gap-2">
                <Link href={`/dashboard/assignments/${assignment.id}`}>
                  <Button size="sm" variant="outline" className="h-8 px-3 border-zinc-700 hover:border-zinc-600 bg-zinc-800/50">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => {
                    setAssignmentToDelete(assignment.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Link href={submissionStatus?.hasSubmitted 
                ? `/dashboard/submissions/mine?assignmentId=${assignment.id}`
                : `/dashboard/submissions/create?assignmentId=${assignment.id}`
              }>
                <Button size="sm" variant={submissionStatus?.hasSubmitted ? "outline" : "default"} 
                  className={!submissionStatus?.hasSubmitted 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                  }
                >
                  {submissionStatus?.hasSubmitted ? (
                    <>View Submission</>
                  ) : (
                    <>Submit Work</>
                  )}
                </Button>
              </Link>
            )}
            {isMentor && submissionStatus && (
              <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                <FileCode className="mr-1 h-3 w-3" />
                {submissionStatus.total} {submissionStatus.total === 1 ? "submission" : "submissions"}
              </Badge>
            )}
          </CardFooter>
        </Card>
      );
    }
    
    // List view
    return (
      <div key={assignment.id} className="p-4 hover:bg-zinc-800/30 transition-colors border-b border-zinc-800 group">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-white">
                {assignment.title}
              </h3>
              {!isMentor && (
                submissionStatus?.hasSubmitted ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Submitted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )
              )}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-zinc-400 flex-wrap">
              <span className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDate(assignment.created_at)}
              </span>
              {isMentor && submissionStatus && (
                <span className="flex items-center">
                  <FileCode className="mr-1 h-3 w-3" />
                  {submissionStatus.total} {submissionStatus.total === 1 ? "submission" : "submissions"}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-start">
            <Link href={`/dashboard/assignments/${assignment.id}`}>
              <Button size="sm" variant="outline" className="h-8 px-3 border-zinc-700 hover:border-zinc-600 bg-zinc-800/50">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
            </Link>
            
            {isMentor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                    <span className="sr-only">Open menu</span>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                    asChild
                  >
                    <Link href={`/dashboard/assignments/${assignment.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    onClick={() => {
                      setAssignmentToDelete(assignment.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="cursor-pointer hover:bg-zinc-800 text-red-400 focus:bg-zinc-800 focus:text-red-400"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {assignment.description || "No description provided."}
        </p>
        
        {isMentor && submissionStatus && submissionStatus.total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Progress: {submissionStatus.completed}/{submissionStatus.total} complete</span>
              <span>{Math.round(submissionStatus.percentage)}%</span>
            </div>
            <Progress 
              value={submissionStatus.percentage} 
              className="h-1.5 bg-zinc-800"
              style={{
                "--progress-background": submissionStatus.percentage > 70 
                  ? "linear-gradient(90deg, rgb(52 211 153 / 0.9), rgb(16 185 129 / 0.9))"
                  : submissionStatus.percentage > 30
                    ? "linear-gradient(90deg, rgb(251 146 60 / 0.9), rgb(249 115 22 / 0.9))"
                    : "linear-gradient(90deg, rgb(239 68 68 / 0.9), rgb(220 38 38 / 0.9))"
              } as React.CSSProperties}
            />
          </div>
        )}
        
        {!isMentor && (
          <div className="mt-4 flex justify-end">
            <Link href={submissionStatus?.hasSubmitted 
              ? `/dashboard/submissions/mine?assignmentId=${assignment.id}`
              : `/dashboard/submissions/create?assignmentId=${assignment.id}`
            }>
              <Button size="sm" variant={submissionStatus?.hasSubmitted ? "outline" : "default"} 
                className={!submissionStatus?.hasSubmitted 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                }
              >
                {submissionStatus?.hasSubmitted ? (
                  <>View My Submission</>
                ) : (
                  <>Submit Work</>
                )}
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isMentor ? "Assignments" : "My Assignments"}
          </h1>
          <p className="text-zinc-400 mt-1">
            {isMentor
              ? "Create and manage learning assignments for your mentees"
              : "View and complete your assigned learning tasks"}
          </p>
        </div>
        {isMentor && (
          <Link href="/dashboard/assignments/create">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
              <Plus className="h-4 w-4" /> Create Assignment
            </Button>
          </Link>
        )}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-zinc-400 text-sm">{isMentor ? "Total Assignments" : "Total Tasks"}</p>
                <p className="text-3xl font-bold mt-1">{stats.totalAssignments}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3 h-12 w-12 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-zinc-400 text-sm">
                  {isMentor ? "With Submissions" : "Completed"}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isMentor ? stats.assignmentsWithSubmissions : stats.assignmentsCompletedByMentee}
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3 h-12 w-12 flex items-center justify-center">
                <CheckCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-zinc-400 text-sm">
                  {isMentor ? "Pending Review" : "Progress"}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isMentor ? stats.pendingReviewCount : `${stats.menteeCompletionRate}%`}
                </p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3 h-12 w-12 flex items-center justify-center">
                {isMentor ? (
                  <Clock className="h-5 w-5 text-amber-400" />
                ) : (
                  <BarChart className="h-5 w-5 text-amber-400" />
                )}
              </div>
            </div>
            {!isMentor && (
              <Progress 
                value={stats.menteeCompletionRate} 
                className="h-1.5 mt-3 bg-zinc-800"
                style={{
                  "--progress-background": stats.menteeCompletionRate > 60 
                    ? "linear-gradient(90deg, rgb(52 211 153 / 0.8), rgb(16 185 129 / 0.8))"
                    : "linear-gradient(90deg, rgb(251 146 60 / 0.8), rgb(249 115 22 / 0.8))"
                } as React.CSSProperties}
              />
            )}
          </CardContent>
        </Card>
        
        <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-zinc-400 text-sm">
                  {isMentor ? "Completed" : "Pending Tasks"}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {isMentor 
                    ? stats.completedCount 
                    : (stats.totalAssignments - stats.assignmentsCompletedByMentee)}
                </p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3 h-12 w-12 flex items-center justify-center">
                {isMentor ? (
                  <FileCheck className="h-5 w-5 text-purple-400" />
                ) : (
                  <FileCode className="h-5 w-5 text-purple-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs + Filter Controls */}
      <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "all" | "pending" | "completed")}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-auto bg-zinc-800">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                {isMentor ? "Need Review" : "To Do"}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 h-9 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span className="sr-only md:not-sr-only text-sm">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem 
                    onClick={() => setSorting("newest")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "newest" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "newest" ? "ml-6" : ""}>Newest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSorting("oldest")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "oldest" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "oldest" ? "ml-6" : ""}>Oldest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSorting("most-submissions")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "most-submissions" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "most-submissions" ? "ml-6" : ""}>Most Submissions</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="bg-zinc-800 rounded-md flex p-0.5 h-9">
                <Button 
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 rounded-sm ${viewMode === 'list' ? 'bg-zinc-700' : ''}`}
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  variant="ghost"
                  className={`h-8 px-2 rounded-sm ${viewMode === 'grid' ? 'bg-zinc-700' : ''}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        {sortedAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-zinc-800/80 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-300 font-medium mb-1">No assignments found</h3>
            <p className="text-zinc-500 text-center text-sm max-w-md">
              {searchQuery 
                ? "Try adjusting your search query or filters to find what you're looking for."
                : activeTab !== "all"
                  ? `No ${activeTab === "pending" ? "pending" : "completed"} assignments found. Try changing your view.`
                  : isMentor 
                    ? "You haven't created any assignments yet. Get started by creating your first assignment!" 
                    : "You don't have any assignments yet. Your mentor will assign tasks soon."}
            </p>
            {isMentor && activeTab === "all" && !searchQuery && (
              <Link href="/dashboard/assignments/create" className="mt-6">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" /> Create Your First Assignment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "bg-zinc-950/40 rounded-md"
            }
          >
            {sortedAssignments.map(renderAssignmentItem)}
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment and all associated submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => assignmentToDelete && handleDelete(assignmentToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
