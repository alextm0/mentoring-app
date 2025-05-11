"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, Home, Users, Settings, LogOut, User, BarChart, Clock, GraduationCap, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/actions/users"
import { getSubmissions } from "@/lib/actions/submissions"
import { Badge } from "@/components/ui/badge"
import { User as UserType, Submission } from "@/types"
import { LucideIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Define types for route objects
interface RouteItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active: boolean;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    pulse?: boolean;
  };
  mentorOnly?: boolean;
}

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserType | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user data and submissions in parallel
        const [userData, submissionsData] = await Promise.all([
          getCurrentUser(),
          getSubmissions().catch(() => []) // Suppress errors for submissions and return empty array
        ]);
        
        setUser(userData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const isMentor = user?.role === 'MENTOR'
  
  // Count pending submissions that need review (for mentor badge)
  const pendingSubmissions = submissions.filter(s => !s.completed).length
  
  // Routes for both user types
  const routes: RouteItem[] = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Assignments",
      icon: FileText,
      href: "/dashboard/assignments",
      active: pathname === "/dashboard/assignments" || pathname.startsWith("/dashboard/assignments/"),
      badge: {
        text: isMentor ? "Create & Manage" : "View & Submit",
        variant: "outline"
      }
    },
    {
      label: "Resources",
      icon: BookOpen,
      href: "/dashboard/resources",
      active: pathname === "/dashboard/resources" || pathname.startsWith("/dashboard/resources/"),
      badge: {
        text: isMentor ? "Create & Manage" : "Access",
        variant: "outline"
      }
    },
    {
      label: "Submissions",
      icon: BarChart,
      href: "/dashboard/submissions",
      active: pathname === "/dashboard/submissions" || pathname.startsWith("/dashboard/submissions/"),
      badge: isMentor && pendingSubmissions > 0 
        ? {
            text: "Review",
            variant: "outline",
            pulse: true
          }
        : {
            text: isMentor ? "Review" : "My Work",
            variant: "outline"
          }
    },
    {
      label: "Mentees",
      icon: Users,
      href: "/dashboard/mentees",
      active: pathname === "/dashboard/mentees" || pathname.startsWith("/dashboard/mentees/"),
      mentorOnly: true,
      badge: {
        text: "Mentor Only",
        variant: "destructive"
      }
    },
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    }
  ]

  // Filter routes based on user role
  const filteredRoutes = routes.filter(route => !route.mentorOnly || isMentor);

  async function handleLogout() {
    try {
      // Clear the auth token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // Redirect to login page
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b border-zinc-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-emerald-500" />
          <span className="text-xl text-white">MentorHub</span>
        </Link>
      </div>
      
      {/* Role badge */}
      {user && (
        <div className="px-4 py-3">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 w-full rounded-md py-2 px-2 flex justify-center items-center">
            <GraduationCap className="mr-1.5 h-4 w-4 text-white" />
            <span className="text-xs font-bold text-white tracking-wide">
              {isMentor ? "MENTOR" : "MENTEE"}
            </span>
          </div>
        </div>
      )}
      
      {/* Main navigation with ScrollArea for smooth scrolling */}
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                route.active 
                  ? "bg-zinc-800/80 text-white" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <route.icon className={cn(
                  "h-4 w-4", 
                  route.active 
                    ? "text-white" 
                    : "text-zinc-400"
                )} />
                {route.label}
              </div>
              {route.badge && (
                <Badge 
                  variant={route.badge.variant}
                  className={cn(
                    "text-[10px] whitespace-nowrap font-semibold",
                    route.badge.pulse && "animate-pulse bg-amber-500/20 text-amber-500 border-amber-500/30"
                  )}
                >
                  {route.badge.text}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      {/* Footer with user info and logout */}
      <div className="mt-auto border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8 border border-zinc-700">
            <AvatarFallback className="bg-zinc-800 text-zinc-300">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-zinc-500">Logout to switch account</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-white border-zinc-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )
  
  if (loading) {
    return (
      <>
        {/* Mobile trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 md:hidden bg-zinc-800/50 hover:bg-zinc-700"
        >
          <Menu className="h-5 w-5 text-white" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        {/* Desktop sidebar */}
        <aside className="hidden md:block h-screen w-64 fixed inset-y-0 left-0 z-30 border-r border-zinc-800 bg-zinc-900">
          <div className="flex h-16 items-center border-b border-zinc-800 px-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-800 animate-pulse" />
              <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="py-2 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded-lg mb-1.5 animate-pulse" />
            ))}
          </div>
        </aside>
      </>
    )
  }
  
  return (
    <>
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-4 left-4 z-50 md:hidden bg-zinc-800/50 hover:bg-zinc-700"
          >
            <Menu className="h-5 w-5 text-white" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-zinc-800 bg-zinc-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 fixed inset-y-0 left-0 z-30 flex-col border-r border-zinc-800 bg-zinc-900">
        <SidebarContent />
      </aside>
    </>
  )
}
