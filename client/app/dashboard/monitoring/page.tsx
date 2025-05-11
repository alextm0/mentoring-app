import { Suspense } from 'react';
import { getActiveMonitoredUsers, getAllMonitoredUsers } from '@/lib/actions/monitoring';
import { getCurrentUser } from '@/lib/actions/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from './components';

// Error component
function ErrorDisplay({ message, isAccessDenied = false }: { message: string; isAccessDenied?: boolean }) {
  return (
    <Alert variant={isAccessDenied ? "default" : "destructive"} className="my-4">
      {isAccessDenied ? <ShieldAlert className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{isAccessDenied ? "Access Denied" : "Error"}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Loading skeleton
function MonitoredUsersTableSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl animate-pulse">Loading...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-md animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component to display active monitored users
async function ActiveMonitoredUsersTable() {
  const monitoredUsers = await getActiveMonitoredUsers();
  
  if (monitoredUsers.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-xl">Active Monitored Users</CardTitle>
          <CardDescription>No active monitored users found or access denied</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Either there are no active monitored users in the system, or you don't have permission to view them.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl">Active Monitored Users</CardTitle>
        <CardDescription>
          Users currently being monitored due to suspicious activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of active monitored users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Operation Count</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitoredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_email}</TableCell>
                <TableCell>{user.reason}</TableCell>
                <TableCell>{user.operation_count}</TableCell>
                <TableCell>{user.time_period}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <ActionButton label="Review" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Component to display all monitored users
async function AllMonitoredUsersTable() {
  const monitoredUsers = await getAllMonitoredUsers();

  if (monitoredUsers.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-xl">All Monitored Users</CardTitle>
          <CardDescription>No monitored users found or access denied</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Either there are no monitored users in the system, or you don't have permission to view them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl">All Monitored Users</CardTitle>
        <CardDescription>
          All users that have been monitored (active and resolved)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of all monitored users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitoredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_email}</TableCell>
                <TableCell>{user.reason}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Active" : "Resolved"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <ActionButton 
                    label={user.is_active ? "Review" : "View Details"} 
                    disabled={!user.is_active}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Main page component
export default async function MonitoringPage() {
  try {
    // Get current user to check authorization
    const currentUser = await getCurrentUser();
    
    // Check if user is authorized (specific mentor with the allowed email)
    const isSpecificMentor = 
      currentUser.role === 'MENTOR' && 
      currentUser.email === 'alextoma1704@gmail.com';
    
    // Redirect if not authorized
    if (!isSpecificMentor) {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Monitored Users</h2>
          <ErrorDisplay 
            message="You do not have permission to access this page. Only specific mentors can view monitored users." 
            isAccessDenied={true} 
          />
          <Link href="/dashboard" className="inline-block">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="all">All Monitored</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <Suspense fallback={<MonitoredUsersTableSkeleton />}>
              <ActiveMonitoredUsersTable />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <Suspense fallback={<MonitoredUsersTableSkeleton />}>
              <AllMonitoredUsersTable />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Error in monitoring page:", error);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Monitored Users</h2>
        <ErrorDisplay message="There was an error loading the monitoring page. Please try again later or contact support if the issue persists." />
        <Link href="/dashboard" className="inline-block">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }
} 