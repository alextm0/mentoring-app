"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, LogOut } from "lucide-react"
import { useAppStore } from "@/lib/store"

const navigation = [
  {
    name: "Dashboard",
    href: "/mentor",
    icon: "LayoutDashboard",
  },
  {
    name: "Schedule",
    href: "/mentor/schedule",
    icon: "Calendar",
  },
  {
    name: "Mentees",
    href: "/mentor/mentees",
    icon: "Users",
  },
  {
    name: "Assignments",
    href: "/mentor/assignments",
    icon: "ClipboardList",
  },
  {
    name: "Resources",
    href: "/mentor/resources",
    icon: "BookOpen",
  },
  {
    name: "Settings",
    href: "/mentor/settings",
    icon: "Settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAuthenticated, userRole, currentUser, logout } = useAppStore()

  // If not authenticated or not a mentor, don't show the sidebar
  if (!isAuthenticated || userRole !== "mentor") {
    return null
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4">
              <span className="font-semibold">Mentor Portal</span>
            </div>
            <ScrollArea className="flex-1">
              <nav className="space-y-1 p-2">
                {navigation.map((item) => {
                  const Icon = require("lucide-react")[item.icon]
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {currentUser?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-[240px] md:flex-col md:fixed md:inset-y-0 md:border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">Mentor Portal</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {navigation.map((item) => {
              const Icon = require("lucide-react")[item.icon]
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">
                {currentUser?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

