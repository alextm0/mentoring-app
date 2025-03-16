"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mentee } from "@/lib/types"

interface MenteeModalProps {
  mentee: Mentee | null
  isOpen: boolean
  onClose: () => void
}

export function MenteeModal({ mentee, isOpen, onClose }: MenteeModalProps) {
  const { updateMentee } = useAppStore()
  const [name, setName] = useState(mentee?.name || "")
  const [email, setEmail] = useState(mentee?.email || "")
  const [category, setCategory] = useState(mentee?.categories[0] || "")
  const [progress, setProgress] = useState(mentee?.progress.toString() || "0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when mentee changes
  useEffect(() => {
    if (mentee) {
      setName(mentee.name)
      setEmail(mentee.email)
      setCategory(mentee.categories[0] || "")
      setProgress(mentee.progress.toString())
    }
  }, [mentee])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentee) return
    
    setIsSubmitting(true)
    
    updateMentee(mentee.id, {
      name,
      email,
      categories: [category],
      progress: parseInt(progress, 10),
    })
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      onClose()
    }, 500)
  }
  
  if (!mentee) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Mentee</DialogTitle>
          <DialogDescription>
            Make changes to the mentee's information here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Programming Fundamentals">Programming Fundamentals</SelectItem>
                  <SelectItem value="Open Source">Open Source</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                Progress
              </Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 