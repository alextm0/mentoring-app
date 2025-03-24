"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { AlertTriangle, MoreHorizontal, Pencil, Search, SlidersHorizontal, Trash2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Mentee } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MenteeTableProps {
  mentees: Mentee[]
  filters: {
    searchQuery: string
    categoryFilter: string
    progressFilter: string
    assignmentFilter: string
  }
  onFilterChange: {
    search: (value: string) => void
    category: (value: string) => void
    progress: (value: string) => void
    assignment: (value: string) => void
  }
}

export function MenteeTable({ mentees, filters, onFilterChange }: MenteeTableProps) {
  const { assignments, sessions, deleteMentee } = useAppStore()

  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [menteeToDelete, setMenteeToDelete] = useState<Mentee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get unique categories from all mentees
  const uniqueCategories = Array.from(new Set(mentees?.flatMap(m => m.categories)))

  // Enhance mentees with additional data
  const enhancedMentees = mentees.map((mentee) => {
    const nextSession = sessions.find(
      (s) => s.menteeId === mentee.id && s.status === "scheduled" && new Date(s.date) > new Date()
    )

    const pendingAssignments = assignments.filter(
      (a) => a.menteeId === mentee.id && a.status !== "completed" && a.status !== "reviewed"
    ).length

    const nextSessionDate = nextSession
      ? new Date(nextSession.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "No sessions"

    return {
      ...mentee,
      nextSession: nextSessionDate,
      pendingAssignments,
    }
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
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search mentees by name, email or category..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange.search(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filters.categoryFilter} onValueChange={onFilterChange.category}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.progressFilter} onValueChange={onFilterChange.progress}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress</SelectItem>
              <SelectItem value="high">High (≥70%)</SelectItem>
              <SelectItem value="medium">Medium (40-69%)</SelectItem>
              <SelectItem value="low">Low (0-40%)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.assignmentFilter} onValueChange={onFilterChange.assignment}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="none">No Pending</SelectItem>
              <SelectItem value="pending">Has Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {(filters.categoryFilter !== "all" || filters.progressFilter !== "all" || filters.assignmentFilter !== "all") && (
        <div className="flex flex-wrap gap-2">
          {filters.categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.categoryFilter}
              <button 
                onClick={() => onFilterChange.category("all")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.progressFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Progress: {filters.progressFilter}
              <button 
                onClick={() => onFilterChange.progress("all")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.assignmentFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Assignments: {filters.assignmentFilter}
              <button 
                onClick={() => onFilterChange.assignment("all")}
                className="ml-1 rounded-full hover:bg-muted"
              >
                ×
              </button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onFilterChange.category("all")
              onFilterChange.progress("all")
              onFilterChange.assignment("all")
            }}
          >
            Clear all
          </Button>
        </div>
      )}

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
            {enhancedMentees.length > 0 ? (
              enhancedMentees.map((mentee) => (
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{mentee.categories[0]}</Badge>
                      {mentee.categories.length > 1 && (
                        <Badge variant="secondary" className="text-xs">+{mentee.categories.length - 1}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={mentee.progress} 
                        className={cn(
                          "w-[100px]",
                          mentee.progress >= 80 ? "bg-green-100" : 
                          mentee.progress >= 60 ? "bg-yellow-100" : 
                          "bg-red-100"
                        )} 
                      />
                      <Badge 
                        variant={mentee.progress >= 80 ? "secondary" : 
                          mentee.progress >= 60 ? "outline" : 
                          "destructive"}
                        className="text-xs"
                      >
                        {mentee.progress}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {mentee.nextSession === "No sessions" ? (
                        <Badge variant="secondary" className="text-xs">No sessions</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {mentee.nextSession}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {mentee.pendingAssignments > 0 ? (
                        <div className="group relative">
                          <Badge 
                            variant={mentee.pendingAssignments > 1 ? "destructive" : "outline"} 
                            className={cn(
                              "cursor-pointer transition-all hover:scale-105",
                              mentee.pendingAssignments > 1 
                                ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900" 
                                : "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-400 dark:hover:bg-orange-900"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                mentee.pendingAssignments > 1 
                                  ? "bg-red-500 dark:bg-red-400" 
                                  : "bg-orange-500 dark:bg-orange-400"
                              )} />
                              {mentee.pendingAssignments} pending
                            </div>
                          </Badge>
                          <div className="absolute -top-2 left-1/2 z-50 mt-8 hidden min-w-[200px] -translate-x-1/2 transform rounded-md bg-white p-3 shadow-lg group-hover:block dark:bg-gray-800">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Pending Assignments
                            </div>
                            <div className="mt-2 space-y-1.5">
                              {assignments
                                .filter(a => a.menteeId === mentee.id && (a.status === "not-started" || a.status === "in-progress"))
                                .map(assignment => (
                                <div key={assignment.id} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {assignment.title}
                                  <span className="ml-1 text-xs text-gray-400">
                                    (Due: {new Date(assignment.dueDate).toLocaleDateString()})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="cursor-default bg-gray-50 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                            All caught up
                          </div>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(mentee.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
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
                  No mentees found matching filters
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

