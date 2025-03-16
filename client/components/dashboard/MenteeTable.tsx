"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { AlertTriangle, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { MenteeModal } from "./MenteeModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Mentee } from "@/lib/types"

export function MenteeTable() {
  const { mentees, assignments, sessions, deleteMentee } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [menteeToDelete, setMenteeToDelete] = useState<Mentee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Enhance mentees with additional data
  const enhancedMentees = mentees.map((mentee) => {
    // Find the next session for this mentee
    const nextSession = sessions.find(
      (s) => s.menteeId === mentee.id && s.status === "scheduled" && new Date(s.date) > new Date()
    )

    // Count pending assignments
    const pendingAssignments = assignments.filter(
      (a) => a.menteeId === mentee.id && a.status !== "completed" && a.status !== "reviewed"
    ).length

    // Format next session date
    const nextSessionDate = nextSession
      ? new Date(nextSession.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "No sessions"

    return {
      ...mentee,
      nextSession: nextSessionDate,
      pendingAssignments,
    }
  })

  // Filter mentees based on search query
  const filteredMentees = enhancedMentees.filter((mentee) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      mentee.name.toLowerCase().includes(query) ||
      mentee.email.toLowerCase().includes(query) ||
      mentee.categories.some(category => category.toLowerCase().includes(query))
    )
  })

  const handleEditMentee = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setIsModalOpen(true)
  }

  const handleDeleteMentee = (mentee: Mentee) => {
    setMenteeToDelete(mentee)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!menteeToDelete) return
    
    setIsSubmitting(true)
    
    deleteMentee(menteeToDelete.id)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsDeleteConfirmOpen(false)
      setMenteeToDelete(null)
    }, 500)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMentee(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search mentees by name, email or category..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Next Session</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMentees.length > 0 ? (
              filteredMentees.map((mentee) => (
                <TableRow key={mentee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={mentee.name} />
                        <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{mentee.name}</span>
                        <span className="text-xs text-muted-foreground">{mentee.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{mentee.categories[0]}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            mentee.progress >= 70 ? "bg-green-500" : mentee.progress >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${mentee.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{mentee.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{mentee.nextSession}</TableCell>
                  <TableCell>{mentee.pendingAssignments} assignments</TableCell>
                  <TableCell>{new Date(mentee.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMentee(mentee)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/mentor/mentees/${mentee.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMentee(mentee)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No mentees found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MenteeModal 
        mentee={selectedMentee}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Mentee
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {menteeToDelete?.name}? This action cannot be undone.
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
              {isSubmitting ? "Deleting..." : "Delete Mentee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

