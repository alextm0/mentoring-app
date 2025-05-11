'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast"
import type { Assignment, Resource, Submission, User } from '@/types';
import { getCurrentUser } from '@/lib/actions/users';
import { getAssignments, getMenteeAssignments } from '@/lib/actions/assignments';
import { getResources, getMenteeResources } from '@/lib/actions/resources';
import { getMenteeSubmissions, getSubmissions } from '@/lib/actions/submissions';
import { AssignmentCard } from '@/components/dashboard/AssignmentCard';

export default function DashboardPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user first
        const userData = await getCurrentUser();
        setUser(userData);

        // Then load data based on user role
        if (userData) {
          const [assignmentsData, resourcesData, submissionsData] = await Promise.all([
            userData.role === 'MENTOR' ? getAssignments() : getMenteeAssignments(),
            userData.role === 'MENTOR' ? getResources() : getMenteeResources(),
            userData.role === 'MENTOR' ? getSubmissions() : getMenteeSubmissions()
          ]);

          setAssignments(assignmentsData);
          setResources(resourcesData);
          setSubmissions(submissionsData);
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
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.email}</h1>
        <p className="text-muted-foreground">Your {user.role.toLowerCase()} dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Assignments">
          {assignments.length === 0 ? (
            <Empty>No assignments found</Empty>
          ) : (
            <ul className="space-y-4">
              {assignments.map((a) => (
                <AssignmentCard
                  key={a.id}
                  title={a.title}
                  description={a.description || ''}
                  dueDate={a.created_at}
                  submissions={0}
                  totalMentees={0}
                />
              ))}
            </ul>
          )}
        </Card>

        <Card title="Resources">
          {resources.length === 0 ? (
            <Empty>No resources found</Empty>
          ) : (
            <ul className="space-y-4 text-black">
              {resources.map((r) => (
                <li key={r.id} className="border-b pb-4">
                  <h3 className="font-medium">{r.title}</h3>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Resource
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- tiny UI primitives ---------- */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  );
}

function Card({
  title,
  children,
  fullWidth = false,
}: {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const className = `bg-white p-6 rounded-lg shadow ${
    fullWidth ? 'md:col-span-2' : ''
  }`;
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-500">{children}</p>;
}
