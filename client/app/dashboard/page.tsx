'use client';

import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import type { Assignment, Resource, Submission, User, MonitoredUser } from '@/types';
import { getCurrentUser } from '@/lib/actions/users';
import { getAssignments, getMenteeAssignments } from '@/lib/actions/assignments';
import { getResources, getMenteeResources } from '@/lib/actions/resources';
import { getSubmissions, getMySubmissions } from '@/lib/actions/submissions';
import { getActiveMonitoredUsers } from '@/lib/actions/monitoring';
import { AssignmentCard } from '@/components/dashboard/AssignmentCard';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  AlertCircle, 
  BookOpen,
  Calendar,
  FileText, 
  ShieldAlert,
  Users,
  Clock,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [monitoredUsers, setMonitoredUsers] = useState<MonitoredUser[]>([]);
  const [monitoringError, setMonitoringError] = useState<boolean>(false);
  const [monitoringErrorMessage, setMonitoringErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user first
        const userData = await getCurrentUser();
        setUser(userData);

        // Then load data based on user role
        if (userData) {
          // Determine which API calls to make based on user role
          let assignmentsPromise, resourcesPromise, submissionsPromise;
          
          if (userData.role === 'MENTOR') {
            assignmentsPromise = getAssignments(); // For mentors
            resourcesPromise = getResources(); // All resources (for mentor)
            submissionsPromise = getSubmissions(); // All submissions (for mentor)
          } else {
            assignmentsPromise = getMenteeAssignments(); // For mentees
            resourcesPromise = getMenteeResources(); // Mentee's resources
            submissionsPromise = getMySubmissions(); // Only my submissions (for mentee)
          }
          
          // Load all data in parallel
          const [assignmentsData, resourcesData, submissionsData] = await Promise.all([
            assignmentsPromise,
            resourcesPromise,
            submissionsPromise
          ]);

          setAssignments(assignmentsData);
          setResources(resourcesData);
          setSubmissions(submissionsData);
          
          // Load monitored users separately to not block the main dashboard
          if (userData.role === 'MENTOR' && userData.email === 'alextoma1704@gmail.com') {
            try {
              // Create an AbortController to time out the request if it takes too long
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
              
              const monitoredUsersData = await getActiveMonitoredUsers();
              clearTimeout(timeoutId);
              
              if (monitoredUsersData.length === 0) {
                console.warn('No monitored users found or access denied');
                setMonitoringErrorMessage('You may not have permission to view monitored users.');
                setMonitoringError(true);
              } else {
                setMonitoredUsers(monitoredUsersData);
              }
            } catch (error) {
              console.error('Failed to load monitored users:', error);
              setMonitoringErrorMessage('Error loading monitored users data.');
              setMonitoringError(true);
            }
          }
        }
      } catch (error) {
        console.error('Dashboard loading error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to view your dashboard.
            <div className="mt-4">
              <Button asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is the specific mentor with monitoring privileges
  const isMonitoringMentor = user.role === 'MENTOR' && user.email === 'alextoma1704@gmail.com';
  const isMentor = user.role === 'MENTOR';

  return (
    <div className="space-y-8">
      {/* Header with stats summary */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {user.email}</h1>
        <div className="flex items-center gap-2">
          <p className="text-zinc-400">Your {user.role.toLowerCase()} dashboard</p>
          <Badge 
            variant="outline" 
            className={`text-xs font-semibold px-2 ${isMentor 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}
          >
            {isMentor ? 'MENTOR' : 'MENTEE'}
          </Badge>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Assignments"
          value={assignments.length.toString()}
          description={isMentor ? "Total assignments created" : "Assigned to you"}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          trend=""
        />
        <DashboardCard 
          title="Resources"
          value={resources.length.toString()}
          description="Learning resources available"
          icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
          trend=""
        />
        <DashboardCard 
          title="Submissions"
          value={submissions.length.toString()}
          description={isMentor ? "From your mentees" : "You've submitted"}
          icon={<Calendar className="h-5 w-5 text-violet-500" />}
          trend=""
        />
        <DashboardCard 
          title={isMentor ? "Mentees" : "Active Days"}
          value={isMentor ? "0" : "14"}
          description={isMentor ? "Under your guidance" : "Learning streak"}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          trend=""
        />
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Assignments section */}
        <Card className="md:col-span-2 bg-zinc-900/70 backdrop-blur border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold text-white">Recent Assignments</CardTitle>
              <CardDescription className="text-zinc-400">Your most recent assignments and their status</CardDescription>
            </div>
            {isMentor ? (
              <Button variant="outline" size="sm" asChild className="border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Link href="/dashboard/assignments">View All</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Link href="/dashboard/assignments/mine">My Assignments</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="pb-2">
          {assignments.length === 0 ? (
              <EmptyState 
                title="No assignments found"
                description={isMentor ? "Create your first assignment to get started" : "Your mentor hasn't assigned anything yet"}
                action={isMentor ? {
                  label: "Create Assignment",
                  href: "/dashboard/assignments/create"
                } : undefined}
              />
            ) : (
              <div className="space-y-4">
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-4 transition-all hover:bg-zinc-800/70">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium leading-none text-white">{assignment.title}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-1">{assignment.description || 'No description provided'}</p>
                      </div>
                      <Badge variant="outline" className="bg-zinc-800/80 text-zinc-300 border-zinc-700">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Completion: 0%</span>
                        <span>0/{isMentor ? '0 submissions' : '1 required'}</span>
                      </div>
                      <Progress value={0} className="h-1.5 mt-1 bg-zinc-700" />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                        <Link href={`/dashboard/assignments/${assignment.id}`}>
                          {isMentor ? 'View Details' : 'View Assignment'}
                        </Link>
                      </Button>
                      {!isMentor && (
                        <Button variant="outline" size="sm" asChild className="border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
                          <Link href={`/dashboard/submissions/create?assignmentId=${assignment.id}`}>Submit Work</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Awaiting Review section for mentors, or my submissions for mentees */}
        <Card className="bg-zinc-900/70 backdrop-blur border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              {isMentor ? (
                <>
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>Awaiting Review</span>
                </>
              ) : (
                <>
                  <BarChart className="h-5 w-5 text-blue-500" />
                  <span>My Submissions</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isMentor
                ? "Submissions needing your feedback"
                : "Your recent submission status"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMentor ? (
              submissions.filter(s => !s.completed).length > 0 ? (
                <div className="space-y-3">
                  {submissions.filter(s => !s.completed).map((submission) => (
                    <div key={submission.id} className="flex items-center gap-2 p-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {submission.assignment_title || "Assignment Submission"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
                        <Link href={`/dashboard/submissions/${submission.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" asChild className="w-full mt-2 border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
                    <Link href="/dashboard/submissions?tab=pending">
                      View All Pending
                    </Link>
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="No pending submissions"
                  description="All submissions have been reviewed"
                />
              )
            ) : submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="flex items-center gap-2 p-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800 transition-colors">
                    <div className={`h-2 w-2 rounded-full ${submission.completed ? "bg-emerald-500" : "bg-amber-500"}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {submission.assignment_title || "Assignment Submission"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        Status: {submission.completed ? "Completed" : "Awaiting Review"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
                      <Link href={`/dashboard/submissions/${submission.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" asChild className="w-full mt-2 border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Link href="/dashboard/submissions">
                    See All My Submissions
                  </Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                title="No submissions yet"
                description="Submit your work for an assignment to get feedback"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-zinc-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold mt-1 text-white">{value}</h2>
              {trend && <span className={`text-xs ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{trend}</span>}
            </div>
            <p className="text-xs text-zinc-500 mt-1">{description}</p>
          </div>
          <div className="rounded-full p-2 bg-zinc-800/80">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: { label: string; href: string } 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-zinc-800/60 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="font-medium text-zinc-200">{title}</h3>
      <p className="text-sm text-zinc-400 mt-1 mb-4 max-w-md">{description}</p>
      {action && (
        <Button variant="outline" asChild className="border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
