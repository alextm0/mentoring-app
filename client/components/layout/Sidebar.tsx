"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, CalendarIcon, HomeIcon, LogOutIcon, PlusIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Sidebar() {
  const pathname = usePathname()
  const { userRole, logout } = useAppStore()

  const isMentor = userRole === "mentor"
  const basePath = isMentor ? "/mentor" : "/mentee"

  const mentorLinks = [
    { href: "/mentor", label: "Dashboard", icon: HomeIcon },
    { href: "/mentor/mentees", label: "Mentees", icon: UsersIcon },
    { href: "/mentor/assignments", label: "Assignments", icon: BookOpenIcon },
    { href: "/mentor/schedule", label: "Schedule", icon: CalendarIcon },
    { href: "/mentor/resources", label: "Resources", icon: BookOpenIcon },
  ]

  const menteeLinks = [
    { href: "/mentee", label: "Dashboard", icon: HomeIcon },
    { href: "/mentee/assignments", label: "Assignments", icon: BookOpenIcon },
    { href: "/mentee/resources", label: "Resources", icon: BookOpenIcon },
    { href: "/mentee/schedule", label: "Schedule", icon: CalendarIcon },
  ]

  const links = isMentor ? mentorLinks : menteeLinks

  return (
    <div className="hidden border-r bg-background h-screen w-64 flex-col md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href={basePath} className="flex items-center gap-2 font-semibold">
          <BookOpenIcon className="h-6 w-6" />
          <span>CodeWiki</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === link.href && "bg-muted font-medium text-primary",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

