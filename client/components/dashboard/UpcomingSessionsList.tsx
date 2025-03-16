"use client"

import { CalendarIcon } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function UpcomingSessionsList() {
  const { sessions, currentUser, userRole, mentees } = useAppStore()

  // Filter sessions based on user role
  const filteredSessions = sessions.filter((session) => {
    if (userRole === "mentor") {
      return session.mentorId === currentUser?.id && session.status === "scheduled"
    } else {
      return session.menteeId === currentUser?.id && session.status === "scheduled"
    }
  })

  // Sort sessions by date
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
    }
  }

  // Get mentee name
  const getMenteeName = (menteeId: string) => {
    const mentee = mentees.find((m) => m.id === menteeId)
    return mentee ? mentee.name : "Unknown Mentee"
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Your scheduled mentoring sessions for the next 7 days</p>
      <div className="space-y-4">
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session) => (
            <div key={session.id} className="flex flex-col space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <h3 className="font-medium">{session.title}</h3>
                <span className="text-sm font-medium">{formatDate(new Date(session.date))}</span>
              </div>
              {userRole === "mentor" && (
                <div className="text-sm text-muted-foreground">with {getMenteeName(session.menteeId)}</div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {session.startTime} - {session.endTime}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">No upcoming sessions scheduled</div>
        )}
      </div>
    </div>
  )
}

