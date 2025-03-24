import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-[240px] min-h-screen">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  )
} 