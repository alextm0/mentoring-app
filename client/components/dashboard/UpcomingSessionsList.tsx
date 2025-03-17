"use client"

import { useState } from "react"
import { AlertTriangle, CalendarIcon } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function UpcomingSessionsList() {
  const { sessions, currentUser, userRole, mentees, deleteSession } = useAppStore()
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!sessionToDelete) return
    
    setIsSubmitting(true)
    deleteSession(sessionToDelete)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsDeleteConfirmOpen(false)
      setSessionToDelete(null)
    }, 1000)
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
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {session.startTime} - {session.endTime}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteSession(session.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No upcoming sessions scheduled
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Session
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

