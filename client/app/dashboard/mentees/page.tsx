"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { getMentees } from "@/lib/actions/users";
import { getSubmissions } from "@/lib/actions/submissions";
import { getCurrentUser } from "@/lib/actions/users";
import type { User, Submission } from "@/types";
import Link from "next/link";
import { 
  Clock,
  Search,
  CheckCircle,
  Mail,
  Calendar,
  ExternalLink,
  ChevronRight,
  UserX
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MenteesPage() {
  const { toast } = useToast();
  const [mentees, setMentees] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authorized to view this page
        const userData = await getCurrentUser();
        if (userData.role !== "MENTOR") {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Only mentors can view this page."
          });
          router.push("/dashboard");
          return;
        }
        setCurrentUser(userData);

        // Load mentees and submissions in parallel
        const [menteesData, submissionsData] = await Promise.all([
          getMentees(),
          getSubmissions()
        ]);
        
        setMentees(menteesData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Failed to load mentees data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load mentees data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, router]);

  // Filter mentees based on search
  const filteredMentees = mentees.filter(mentee => {
    if (!searchQuery) return true;
    
    return mentee.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get submissions for a specific mentee
  const getMenteeSubmissions = (menteeId: string) => {
    return submissions.filter(sub => sub.mentee_id === menteeId);
  };
  
  // Calculate completion rate for a mentee
  const getCompletionRate = (menteeId: string) => {
    const menteeSubmissions = getMenteeSubmissions(menteeId);
    if (menteeSubmissions.length === 0) return 0;
    
    const completed = menteeSubmissions.filter(sub => sub.completed).length;
    return Math.round((completed / menteeSubmissions.length) * 100);
  };
  
  // Get the count of pending submissions for a mentee
  const getPendingCount = (menteeId: string) => {
    const menteeSubmissions = getMenteeSubmissions(menteeId);
    return menteeSubmissions.filter(sub => !sub.completed).length;
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return "Unknown date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentees</h1>
          <p className="text-muted-foreground">
            Manage and monitor your mentees' progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search mentees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[250px]"
          />
        </div>
      </div>

      {mentees.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <UserX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Mentees Found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              You currently don't have any mentees assigned to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentees.map((mentee) => {
            const pendingCount = getPendingCount(mentee.id);
            const completionRate = getCompletionRate(mentee.id);
            const submissionCount = getMenteeSubmissions(mentee.id).length;
            
            return (
              <Card key={mentee.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10">
                          {mentee.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{mentee.email}</CardTitle>
                        <div className="text-xs text-muted-foreground">
                          Joined {formatDate(mentee.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={pendingCount > 0 ? "bg-amber-50 text-amber-700" : ""}>
                      {pendingCount > 0 ? (
                        <Clock className="mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {pendingCount > 0 ? `${pendingCount} pending` : "Up to date"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-1" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Submissions</span>
                        <span className="text-2xl font-bold">{submissionCount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="text-2xl font-bold">
                          {getMenteeSubmissions(mentee.id).filter(s => s.completed).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`mailto:${mentee.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Link>
                  </Button>
                  <Button variant={pendingCount > 0 ? "default" : "outline"} size="sm" asChild>
                    <Link href={`/dashboard/submissions?menteeId=${mentee.id}`}>
                      {pendingCount > 0 ? "Review Submissions" : "View History"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {filteredMentees.length === 0 && mentees.length > 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No mentees match your search criteria.</p>
        </div>
      )}
    </div>
  );
} 