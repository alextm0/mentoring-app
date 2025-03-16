"use client"

import { useState } from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MenteeTable } from "@/components/dashboard/MenteeTable"
import { useAppStore } from "@/lib/store"

export default function MentorMentees() {
  const { currentUser } = useAppStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Mentees</h1>
          <p className="text-muted-foreground">Manage and track your mentees' progress</p>
        </div>

        <Button asChild>
          <Link href="/mentor/mentees/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Mentee
          </Link>
        </Button>
      </div>

      <MenteeTable />
    </div>
  )
}
