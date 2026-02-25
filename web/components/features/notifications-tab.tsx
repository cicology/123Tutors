"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CreditCard, BookOpen, UserPlus, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"

interface Notification {
  id: string
  type: "invoice" | "lesson" | "request"
  title: string
  description: string
  timestamp: Date
  status: "pending" | "completed"
  priority: "high" | "medium" | "low"
}

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // Fetch invoices, lessons, and tutor requests to build notifications
      const [invoices, lessons, tutorRequests] = await Promise.all([
        apiService.getInvoices().catch(() => ({ data: [], total: 0 })),
        apiService.getLessons().catch(() => ({ data: [], total: 0 })),
        apiService.getTutorRequests().catch(() => ({ data: [], total: 0 })),
      ])

      // Transform data into notification format
      const invoiceNotifications: Notification[] = invoices.data
        .filter((inv: any) => !inv.status || inv.status !== "paid")
        .map((inv: any) => ({
          id: `invoice-${inv.uniqueId}`,
          type: "invoice" as const,
          title: "Invoice Due",
          description: `Invoice ${inv.uniqueId} is pending payment`,
          timestamp: new Date(inv.invoiceDate || inv.creationDate),
          status: (inv.status === "paid" ? "completed" : "pending") as const,
          priority: "high" as const,
        }))

      const lessonNotifications: Notification[] = lessons.data
        .filter((lesson: any) => !lesson.reviewed || lesson.status === "pending")
        .map((lesson: any) => ({
          id: `lesson-${lesson.uniqueId}`,
          type: "lesson" as const,
          title: "Lesson Review Needed",
          description: `Lesson ${lesson.title || lesson.uniqueId} needs review`,
          timestamp: new Date(lesson.lessonDate || lesson.creationDate),
          status: (lesson.reviewed ? "completed" : "pending") as const,
          priority: "medium" as const,
        }))

      const requestNotifications: Notification[] = tutorRequests.data
        .filter((req: any) => req.status === "pending")
        .map((req: any) => ({
          id: `request-${req.uniqueId}`,
          type: "request" as const,
          title: "Tutor Request Pending",
          description: `Tutor request ${req.uniqueId} is awaiting approval`,
          timestamp: new Date(req.creationDate),
          status: "pending" as const,
          priority: (req.status === "urgent" ? "high" : "medium") as const,
        }))

      // Combine and sort by timestamp
      const allNotifications = [
        ...invoiceNotifications,
        ...lessonNotifications,
        ...requestNotifications,
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      setNotifications(allNotifications)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case "pending":
        return notifications.filter((n) => n.status === "pending")
      case "completed":
        return notifications.filter((n) => n.status === "completed")
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-gray-500"
    
    switch (type) {
      case "invoice":
        return <CreditCard className={`h-5 w-5 ${iconClass}`} />
      case "lesson":
        return <BookOpen className={`h-5 w-5 ${iconClass}`} />
      case "request":
        return <UserPlus className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  if (loading) {
    return <LoadingDisplay message="Loading notifications..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchNotifications} />
  }

  const filteredNotifications = getFilteredNotifications()

  return (
    <div className="space-y-6 p-4 xs:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 text-sm mt-1">Stay updated on important activities</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {notifications.filter((n) => n.status === "pending").length} Pending
        </Badge>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("all")}
          className={`border-b-2 rounded-b-none ${
            filter === "all" ? "border-[#FF0090] text-[#FF0090]" : "border-transparent"
          }`}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("pending")}
          className={`border-b-2 rounded-b-none ${
            filter === "pending" ? "border-[#FF0090] text-[#FF0090]" : "border-transparent"
          }`}
        >
          Pending ({notifications.filter((n) => n.status === "pending").length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("completed")}
          className={`border-b-2 rounded-b-none ${
            filter === "completed" ? "border-[#FF0090] text-[#FF0090]" : "border-transparent"
          }`}
        >
          Completed ({notifications.filter((n) => n.status === "completed").length})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-sm text-gray-600 text-center">
              {filter === "all"
                ? "You're all caught up!"
                : `No ${filter} notifications at the moment.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                notification.status === "pending" ? "border-l-4 border-l-[#FF0090]" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={notification.status === "pending" ? "default" : "secondary"}
                          className={notification.status === "pending" ? "bg-[#FF0090]" : ""}
                        >
                          {notification.status}
                        </Badge>
                        {notification.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={fetchNotifications} variant="outline" size="sm">
          Refresh Notifications
        </Button>
      </div>
    </div>
  )
}
