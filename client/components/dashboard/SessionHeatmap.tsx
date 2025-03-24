"use client"

import React, {
  useMemo,
  useState,
  useEffect,
  Fragment
} from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
)

import type { Session } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CalendarIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data & Constants
// ─────────────────────────────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`
)

type SessionType = "Technical" | "Career"

interface SessionData {
  title: string
  time: string
  type: SessionType
}

interface CellTypes {
  Technical: number
  Career: number
}

const SESSION_COLORS: Record<SessionType, {
  bg: string
  light: string
  value: string // For chart colors
}> = {
  Technical: {
    bg: "bg-indigo-500",
    light: "bg-indigo-50",
    value: "#6366F1"
  },
  Career: {
    bg: "bg-emerald-500",
    light: "bg-emerald-50",
    value: "#10B981"
  },
}

// Initial mock sessions for visualization
const INITIAL_MOCK_SESSIONS: Session[] = [
  {
    id: "1",
    title: "React Fundamentals",
    mentorId: "1",
    menteeId: "1",
    date: new Date(2024, 2, 25), // Monday
    startTime: "09:00",
    endTime: "10:00",
    type: "Technical",
    status: "scheduled"
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    mentorId: "1",
    menteeId: "2",
    date: new Date(2024, 2, 25),
    startTime: "09:00",
    endTime: "10:00",
    type: "Technical",
    status: "scheduled"
  },
  {
    id: "3",
    title: "Career Planning",
    mentorId: "1",
    menteeId: "3",
    date: new Date(2024, 2, 27), // Wednesday
    startTime: "14:00",
    endTime: "15:00",
    type: "Career",
    status: "scheduled"
  },
  {
    id: "4",
    title: "System Design",
    mentorId: "1",
    menteeId: "4",
    date: new Date(2024, 2, 27),
    startTime: "14:00",
    endTime: "15:00",
    type: "Technical",
    status: "scheduled"
  },
  {
    id: "5",
    title: "Interview Prep",
    mentorId: "1",
    menteeId: "5",
    date: new Date(2024, 2, 27),
    startTime: "14:00",
    endTime: "15:00",
    type: "Career",
    status: "scheduled"
  },
  {
    id: "6",
    title: "Algorithm Practice",
    mentorId: "1",
    menteeId: "6",
    date: new Date(2024, 2, 29), // Friday
    startTime: "17:00",
    endTime: "18:00",
    type: "Technical",
    status: "scheduled"
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// SessionHeatmap Component
// ─────────────────────────────────────────────────────────────────────────────
export function SessionHeatmap() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_MOCK_SESSIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<SessionType | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomDay = Math.floor(Math.random() * 7)
      const randomHour = Math.floor(Math.random() * 24)
      const baseDate = new Date(2024, 2, 24)
      const newDate = new Date(baseDate)
      newDate.setDate(baseDate.getDate() + randomDay)

      const newSession: Session = {
        id: `${Date.now()}`,
        title: "New Mentoring Session",
        mentorId: "1",
        menteeId: `${Math.floor(Math.random() * 10) + 1}`,
        date: newDate,
        startTime: `${randomHour.toString().padStart(2, "0")}:00`,
        endTime: `${((randomHour + 1) % 24).toString().padStart(2, "0")}:00`,
        type: Math.random() > 0.5 ? "Technical" : "Career",
        status: "scheduled"
      }

      setSessions((prevSessions) => [...prevSessions, newSession])
    }, 5000) // Update every 5 seconds for better visualization

    return () => clearInterval(interval)
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // Heatmap Data Computation
  // ───────────────────────────────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const data = Array.from({ length: 7 }, () => Array(24).fill(0))
    const typeData = Array.from({ length: 7 }, () =>
      Array(24).fill(0).map(() => ({ Technical: 0, Career: 0 }))
    )

    sessions
      .filter(session => !selectedType || session.type === selectedType)
      .forEach((session) => {
        const date = new Date(session.date)
        const day = date.getDay()
        const hour = parseInt(session.startTime.split(":")[0])
        data[day][hour]++
        typeData[day][hour][session.type as SessionType]++
      })

    return { counts: data, types: typeData }
  }, [sessions, selectedType])

  const chartData = useMemo(() => {
    const dailyCounts = DAYS.map((_, dayIndex) => {
      let technicalCount = 0
      let careerCount = 0
      sessions.forEach((session) => {
        const date = new Date(session.date)
        if (date.getDay() === dayIndex) {
          if (session.type === "Technical") technicalCount++
          else careerCount++
        }
      })
      return { technicalCount, careerCount }
    })

    return {
      labels: DAYS,
      datasets: [
        {
          label: "Technical",
          data: dailyCounts.map(d => d.technicalCount),
          backgroundColor: SESSION_COLORS.Technical.value,
          borderRadius: 4,
        },
        {
          label: "Career",
          data: dailyCounts.map(d => d.careerCount),
          backgroundColor: SESSION_COLORS.Career.value,
          borderRadius: 4,
        }
      ]
    }
  }, [sessions])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 200
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Loading State
  // ───────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <Card className="w-full bg-white dark:bg-gray-900/50 border-0 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-medium">Session Activity</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {sessions.length} total sessions this week
            </p>
          </div>
          <div className="flex gap-2">
            {(["Technical", "Career"] as SessionType[]).map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={cn(
                  "h-8 px-3 transition-all",
                  selectedType === type && SESSION_COLORS[type].bg,
                  selectedType === type && "text-white",
                )}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  selectedType === type ? "bg-white" : SESSION_COLORS[type].bg
                )} />
                {type}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </Card>
  )
}
