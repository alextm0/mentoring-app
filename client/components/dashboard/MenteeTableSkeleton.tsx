"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MenteeTableSkeleton() {
  return (
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <TableRow key={i}>
                {Array(7)
                  .fill(0)
                  .map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

