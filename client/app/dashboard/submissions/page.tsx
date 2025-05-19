"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { 
  Pencil, Trash, ExternalLink, CheckCircle, Clock, Filter, User, Calendar, 
  BarChart3, Search, FileCode, Award, Code, AlertCircle, CheckCheck, 
  ArrowUpRight, SlidersHorizontal, Check
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getSubmissions, getMySubmissions, deleteSubmission } from "@/lib/actions/submissions"
import { getCurrentUser, getUserById } from "@/lib/actions/users"
import type { Submission, User as UserType } from "@/types"
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
import { format, formatDistance } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Component that uses useSearchParams
function SubmissionsContent() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [mentee, setMentee] = useState<UserType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [sorting, setSorting] = useState<"latest" | "oldest" | "pending">("latest")
  const searchParams = useSearchParams()
  const menteeIdFilter = searchParams.get('menteeId')

  const loadData = async () => {
    try {
      // First get user data
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Get mentee data if filtering by mentee
      if (menteeIdFilter) {
        try {
          const menteeData = await getUserById(menteeIdFilter)
          setMentee(menteeData)
        } catch (error) {
          console.error("Failed to load mentee data:", error)
        }
      }
      
      // Then get submissions based on role
      let data;
      if (userData.role === "MENTEE") {
        data = await getMySubmissions();
      } else {
        data = await getSubmissions();
      }
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to load submissions:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load submissions. Please try again."
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
      await deleteSubmission(id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
      toast({
        title: "Success",
        description: "Submission deleted successfully"
      })
    } catch (error) {
      console.error("Failed to delete submission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete submission. Please try again."
      })
    } finally {
      setDeleteDialogOpen(false)
      setSubmissionToDelete(null)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    // Apply tab filtering
    if (currentTab === "pending" && submission.completed) return false;
    if (currentTab === "completed" && !submission.completed) return false;
    
    // Apply mentee filtering
    if (menteeIdFilter && submission.mentee_id !== menteeIdFilter) return false;
    
    // Apply search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        submission.assignment_title?.toLowerCase().includes(query) ||
        submission.mentee_id?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Apply sorting
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (sorting === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sorting === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sorting === "pending") {
      // Sort by pending status first, then by date (newest first)
      if (a.completed === b.completed) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.completed ? 1 : -1;
    }
    return 0;
  });

  // Statistics calculations
  const pendingCount = filteredSubmissions.filter(s => !s.completed).length;
  const completedCount = filteredSubmissions.filter(s => s.completed).length;
  const totalCount = filteredSubmissions.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Calculate average feedback time (simulated for now)
  const averageFeedbackDays = 2.5;

  // Calculate latest activity
  const latestSubmission = filteredSubmissions.length > 0 
    ? filteredSubmissions.reduce((latest, current) => 
      new Date(current.created_at) > new Date(latest.created_at) ? current : latest
    ) 
    : null;
  
  const latestActivity = latestSubmission 
    ? formatDistance(new Date(latestSubmission.created_at), new Date(), { addSuffix: true })
    : 'N/A';

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const isMentor = user?.role === "MENTOR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {menteeIdFilter && isMentor && mentee
              ? `${mentee.email}'s Submissions`
              : isMentor 
                ? "All Mentee Submissions" 
                : "My Submissions"}
          </h1>
          <p className="text-zinc-400 mt-1">
            {menteeIdFilter && isMentor
              ? "Review and track progress for this mentee"
              : isMentor 
                ? "Review and provide feedback on submissions from your mentees" 
                : "View and manage your assignment submissions"}
          </p>
        </div>
        
        {/* If filtering by mentee, show back button in header */}
        {menteeIdFilter && (
          <Link href="/dashboard/mentees">
            <Button variant="outline" size="sm" className="border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
              ← Back to Mentees
            </Button>
          </Link>
        )}
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Stats & Filters */}
        <div className="space-y-6">
          {/* Mentee Profile Card */}
          {menteeIdFilter && mentee && isMentor && (
            <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 border border-zinc-700 mb-3">
                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xl">
                      {mentee.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-white truncate max-w-full">{mentee.email}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Joined {format(new Date(mentee.created_at), 'PPP')}
                  </p>
                  
                  <div className="w-full mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-400">Completion</span>
                      <span className="text-white font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2 bg-zinc-800" 
                      style={{
                        "--progress-background": completionRate > 60 
                          ? "linear-gradient(90deg, rgb(52 211 153 / 0.8), rgb(16 185 129 / 0.8))"
                          : "linear-gradient(90deg, rgb(251 146 60 / 0.8), rgb(249 115 22 / 0.8))"
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">Total Submissions</p>
                    <div className="flex items-center mt-1">
                      <span className="text-2xl font-bold text-white">{totalCount}</span>
                    </div>
                  </div>
                  <div className="rounded-full p-2 bg-zinc-800">
                    <FileCode className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-zinc-800/50 p-2 flex items-center">
                    <div className="mr-2 rounded-full p-1 bg-amber-400/20">
                      <Clock className="h-3 w-3 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Pending</p>
                      <p className="text-sm font-medium text-white">{pendingCount}</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-zinc-800/50 p-2 flex items-center">
                    <div className="mr-2 rounded-full p-1 bg-emerald-400/20">
                      <CheckCheck className="h-3 w-3 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Completed</p>
                      <p className="text-sm font-medium text-white">{completedCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isMentor && (
              <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium">Last Activity</p>
                      <div className="flex items-center mt-1">
                        <span className="text-base font-medium text-white">{latestActivity}</span>
                      </div>
                    </div>
                    <div className="rounded-full p-2 bg-zinc-800">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="rounded-md bg-zinc-800/50 p-2 flex items-center">
                      <div className="mr-2 rounded-full p-1 bg-blue-400/20">
                        <Clock className="h-3 w-3 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Avg. Feedback Time</p>
                        <p className="text-sm font-medium text-white">{averageFeedbackDays} days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-0 pb-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {completionRate < 30 ? "Needs Attention" : 
                     completionRate < 70 ? "In Progress" :
                     "Excellent"}
                  </div>
                </div>
                <Progress value={completionRate} className="h-2.5 bg-zinc-800" 
                  style={{
                    "--progress-background": completionRate > 70 
                      ? "linear-gradient(90deg, rgb(52 211 153 / 0.9), rgb(16 185 129 / 0.9))"
                      : completionRate > 30
                        ? "linear-gradient(90deg, rgb(251 146 60 / 0.9), rgb(249 115 22 / 0.9))"
                        : "linear-gradient(90deg, rgb(239 68 68 / 0.9), rgb(220 38 38 / 0.9))"
                  } as React.CSSProperties}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">Filters</h3>
              
              {(currentTab !== "all" || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                  onClick={() => {
                    setCurrentTab("all");
                    setSearchQuery("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={currentTab === "all" ? "default" : "outline"}
                size="sm"
                className={currentTab === "all" 
                  ? "text-xs h-9" 
                  : "text-xs h-9 border-zinc-800 hover:border-zinc-700 bg-zinc-900"}
                onClick={() => setCurrentTab("all")}
              >
                All Submissions
              </Button>
              <Button
                variant={currentTab === "pending" ? "default" : "outline"}
                size="sm"
                className={currentTab === "pending" 
                  ? "text-xs h-9" 
                  : "text-xs h-9 border-zinc-800 hover:border-zinc-700 bg-zinc-900"}
                onClick={() => setCurrentTab("pending")}
              >
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </Button>
              <Button
                variant={currentTab === "completed" ? "default" : "outline"}
                size="sm"
                className={currentTab === "completed" 
                  ? "text-xs h-9" 
                  : "text-xs h-9 border-zinc-800 hover:border-zinc-700 bg-zinc-900"}
                onClick={() => setCurrentTab("completed")}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search submissions..."
                className="pl-9 bg-zinc-900 border-zinc-800 focus:border-zinc-700 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-300">Sort By</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-sm h-9">
                    <div className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                      {sorting === "latest" ? "Latest First" : 
                       sorting === "oldest" ? "Oldest First" : 
                       "Pending First"}
                    </div>
                    <span>▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem 
                    onClick={() => setSorting("latest")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "latest" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "latest" ? "ml-6" : ""}>Latest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSorting("oldest")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "oldest" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "oldest" ? "ml-6" : ""}>Oldest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSorting("pending")}
                    className="flex items-center cursor-pointer hover:bg-zinc-800"
                  >
                    {sorting === "pending" && <Check className="mr-2 h-4 w-4" />}
                    <span className={sorting === "pending" ? "ml-6" : ""}>Pending First</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Right Column - Submissions List */}
        <div className="lg:col-span-3">
          <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
            <CardHeader className="px-6 py-5 border-b border-zinc-800 flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {currentTab === "pending" ? "Pending Submissions" : 
                 currentTab === "completed" ? "Completed Submissions" : 
                 "All Submissions"}
              </CardTitle>
              <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                {sortedSubmissions.length} {sortedSubmissions.length === 1 ? "submission" : "submissions"}
              </Badge>
            </CardHeader>
            
            {sortedSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="rounded-full bg-zinc-800/80 p-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-zinc-300 font-medium mb-1">No submissions found</h3>
                <p className="text-zinc-500 text-center text-sm max-w-md">
                  {searchQuery 
                    ? "Try adjusting your search query or filters to find what you're looking for."
                    : currentTab !== "all"
                      ? `No ${currentTab} submissions found. Try changing your filters.`
                      : "There are no submissions yet."}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-22rem)] max-h-[800px]">
                <div className="divide-y divide-zinc-800">
                  {sortedSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">
                              {submission.assignment_title || "Assignment Submission"}
                            </h3>
                            {submission.completed ? (
                              <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-zinc-400">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(submission.created_at), 'MMM d, yyyy')}
                            </span>
                            {!menteeIdFilter && isMentor && (
                              <span className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {submission.mentee_id}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Code className="mr-1 h-3 w-3" />
                              {(submission.snippet?.length || 0) > 100 
                                ? `${(submission.snippet?.length || 0).toLocaleString()} chars` 
                                : "Short snippet"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            <Button size="sm" variant="outline" className="h-8 px-3 border-zinc-700 hover:border-zinc-600 bg-zinc-800/50">
                              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                          
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
                              {!submission.completed && isMentor && (
                                <DropdownMenuItem 
                                  className="cursor-pointer hover:bg-zinc-800 text-emerald-400 focus:bg-zinc-800 focus:text-emerald-400"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Mark Complete</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSubmissionToDelete(submission.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="cursor-pointer hover:bg-zinc-800 text-red-400 focus:bg-zinc-800 focus:text-red-400"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-md p-3 font-mono text-xs overflow-x-auto text-zinc-300 max-h-20 overflow-y-auto">
                        {(submission.snippet || "").substring(0, 400)}
                        {(submission.snippet?.length || 0) > 400 && "..."}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submissionToDelete && handleDelete(submissionToDelete)}
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

// Main page component with Suspense boundary
export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>}>
      <SubmissionsContent />
    </Suspense>
  )
}
