"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Assignment } from "@/types"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@/types"
import { getCurrentUser } from "@/lib/actions/users"

interface AssignmentCardProps {
  assignment: Assignment
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch {
        router.push('/login')
      }
    }
    fetchUser()
  }, [getCurrentUser, router])

  if (!user) return null

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
        <CardDescription>Created on {formatDate(assignment.created_at)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>
      </CardContent>
      <CardFooter>
        {user.role === 'MENTEE' && (
          <Link href={`/dashboard/submissions/${assignment.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Submission
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
