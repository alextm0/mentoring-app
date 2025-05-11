"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 md:ml-64 relative">
        {/* Subtle gradient overlay at the top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none z-0" />
        
        <div className="h-full min-h-screen overflow-y-auto pt-14 md:pt-6 px-4 md:px-8 pb-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
