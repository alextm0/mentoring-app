"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, Home, Users, Settings, LogOut, User, BarChart } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  
  const routes = [
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
      active: pathname === "/dashboard/assignments",
    },
    {
      label: "Resources",
      icon: BookOpen,
      href: "/dashboard/resources",
      active: pathname === "/dashboard/resources",
    },
    {
      label: "Submissions",
      icon: BarChart,
      href: "/dashboard/submissions",
      active: pathname === "/dashboard/submissions",
    },
    {
      label: "Mentees",
      icon: Users,
      href: "/dashboard/mentees",
      active: pathname === "/dashboard/mentees",
    },
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    }
  ]

  async function handleLogout() {
    try {
      // Clear the auth token cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // Redirect to login page
      window.location.href = '/auth/login'; // Ensure this is your correct login path
    } catch (err) {
      console.error('Logout failed:', err);
      // Optionally, display a user-friendly error message
    }
  }
  
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/20 text-foreground">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl">MentorHub</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                route.active 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-accent-foreground"
              )}
            >
              <route.icon className={cn("h-4 w-4", route.active ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-border p-4">
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
