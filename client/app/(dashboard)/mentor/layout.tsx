import { DashboardLayout } from "@/components/layout/DashboardLayout"
import type React from "react"

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

