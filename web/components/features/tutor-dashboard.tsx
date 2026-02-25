"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { supabase } from "@/lib/supabase"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Home,
  BookOpen,
  Users,
  DollarSign,
  Clock,
  Calendar,
  User,
  Star,
  FileText,
  LogOut,
  Menu,
  Bell,
  CheckCircle,
  Briefcase,
} from "lucide-react"

interface TutorDashboardProps {
  onLogout: () => void
}

interface Lesson {
  unique_id: string
  course_name: string
  student_name: string
  scheduled_date: string
  duration_hours: number
  status: string
  hourly_rate: number
}

interface JobNotification {
  unique_id: string
  request_id: string
  course_name: string
  student_name: string
  status: string
  creation_date: string
}

interface TutorStats {
  total_earnings: number
  total_hours: number
  active_students: number
  average_rating: number
  completed_lessons: number
  pending_jobs: number
}

export function TutorDashboard({ onLogout }: TutorDashboardProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("Tutor")

  // Data states
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [jobNotifications, setJobNotifications] = useState<JobNotification[]>([])
  const [stats, setStats] = useState<TutorStats>({
    total_earnings: 0,
    total_hours: 0,
    active_students: 0,
    average_rating: 0,
    completed_lessons: 0,
    pending_jobs: 0,
  })

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
          setUserName(user.user_metadata?.full_name || user.email.split("@")[0])
          await loadTutorData(user.email)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    loadUserAndData()
  }, [])

  const loadTutorData = async (email: string) => {
    try {
      // Load lessons assigned to this tutor
      const lessonsData = await apiService.getLessons(1, 100)
      if (lessonsData?.data) {
        // Filter for this tutor's lessons (assuming tutor_email field)
        const tutorLessons = lessonsData.data.filter((l: any) =>
          l.tutor_email === email || l.tutor_name?.toLowerCase().includes(email.split("@")[0].toLowerCase())
        )
        setLessons(tutorLessons)

        // Calculate stats
        const completed = tutorLessons.filter((l: any) => l.status === "completed")
        const totalHours = completed.reduce((sum: number, l: any) => sum + (l.duration_hours || 1), 0)
        const totalEarnings = completed.reduce((sum: number, l: any) => sum + ((l.hourly_rate || 150) * (l.duration_hours || 1)), 0)
        const uniqueStudents = [...new Set(tutorLessons.map((l: any) => l.student_email))].length

        setStats({
          total_earnings: totalEarnings,
          total_hours: totalHours,
          active_students: uniqueStudents,
          average_rating: 4.8, // Placeholder
          completed_lessons: completed.length,
          pending_jobs: 0,
        })
      }

      // Load job notifications for this tutor
      try {
        const notificationsData = await apiService.getTutorJobNotifications(1, 100)
        if (notificationsData?.data) {
          const tutorNotifications = notificationsData.data.filter((n: any) =>
            n.tutor_email === email
          )
          setJobNotifications(tutorNotifications)
          setStats(prev => ({ ...prev, pending_jobs: tutorNotifications.filter((n: any) => n.status === "pending").length }))
        }
      } catch (err) {
        console.log("Job notifications not available:", err)
      }
    } catch (err) {
      console.error("Error loading tutor data:", err)
    }
  }

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "lessons", label: "My Lessons", icon: BookOpen },
    { id: "students", label: "My Students", icon: Users },
    { id: "jobs", label: "Job Requests", icon: Briefcase },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
  ]

  if (isLoading) {
    return <LoadingDisplay message="Loading your dashboard..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white shadow-sm lg:flex">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <BookOpen className="h-8 w-8 text-[#FF0090]" />
          <span className="text-lg font-bold text-gray-900">123Tutors</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#FF0090]/10 text-[#FF0090]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
              {tab.id === "jobs" && stats.pending_jobs > 0 && (
                <Badge className="ml-auto bg-[#FF0090]">{stats.pending_jobs}</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#FF0090]" />
          <span className="font-bold">123Tutors</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-16 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    activeTab === tab.id ? "bg-[#FF0090]/10 text-[#FF0090]" : "text-gray-600"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
            <p className="text-gray-600">Manage your tutoring sessions and track your earnings.</p>
          </div>

          {/* Tab Content */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{stats.total_earnings.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">lifetime earnings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Hours Taught</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_hours}</div>
                    <p className="text-xs text-gray-500">total hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
                    <Users className="h-4 w-4 text-[#FF0090]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active_students}</div>
                    <p className="text-xs text-gray-500">current students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</div>
                    <p className="text-xs text-gray-500">average rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Lessons</CardTitle>
                  <CardDescription>Your scheduled tutoring sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {lessons.filter(l => l.status !== "completed").length > 0 ? (
                    <div className="space-y-4">
                      {lessons.filter(l => l.status !== "completed").slice(0, 5).map((lesson) => (
                        <div key={lesson.unique_id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{lesson.course_name || "Tutoring Session"}</p>
                            <p className="text-sm text-gray-500">with {lesson.student_name || "Student"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {lesson.scheduled_date ? new Date(lesson.scheduled_date).toLocaleDateString() : "TBD"}
                            </p>
                            <Badge variant={lesson.status === "confirmed" ? "default" : "secondary"}>
                              {lesson.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No upcoming lessons scheduled</p>
                  )}
                </CardContent>
              </Card>

              {/* Pending Job Requests */}
              {stats.pending_jobs > 0 && (
                <Card className="border-[#FF0090]/20 bg-[#FF0090]/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-[#FF0090]" />
                      New Job Requests
                    </CardTitle>
                    <CardDescription>You have {stats.pending_jobs} pending tutoring request(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setActiveTab("jobs")} className="bg-[#FF0090] hover:bg-[#E0007F]">
                      View Requests
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "lessons" && (
            <Card>
              <CardHeader>
                <CardTitle>My Lessons</CardTitle>
                <CardDescription>All your tutoring sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.unique_id}>
                          <TableCell className="font-medium">{lesson.course_name || "Session"}</TableCell>
                          <TableCell>{lesson.student_name || "N/A"}</TableCell>
                          <TableCell>
                            {lesson.scheduled_date ? new Date(lesson.scheduled_date).toLocaleDateString() : "TBD"}
                          </TableCell>
                          <TableCell>{lesson.duration_hours || 1} hr</TableCell>
                          <TableCell>R{lesson.hourly_rate || 150}/hr</TableCell>
                          <TableCell>
                            <Badge variant={lesson.status === "completed" ? "default" : "secondary"}>
                              {lesson.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">No lessons yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "students" && (
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students you are currently tutoring</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.active_students > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...new Set(lessons.map(l => l.student_name))].filter(Boolean).map((studentName, idx) => {
                      const studentLessons = lessons.filter(l => l.student_name === studentName)
                      return (
                        <div key={idx} className="rounded-lg border p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#FF0090]/10 text-[#FF0090]">
                                {(studentName as string).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{studentName}</p>
                              <p className="text-sm text-gray-500">{studentLessons.length} lesson(s)</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {[...new Set(studentLessons.map(l => l.course_name))].filter(Boolean).slice(0, 2).map((course, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{course}</Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No students yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "jobs" && (
            <Card>
              <CardHeader>
                <CardTitle>Job Requests</CardTitle>
                <CardDescription>Tutoring opportunities matching your profile</CardDescription>
              </CardHeader>
              <CardContent>
                {jobNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {jobNotifications.map((job) => (
                      <div key={job.unique_id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{job.course_name || "Tutoring Request"}</p>
                          <p className="text-sm text-gray-500">Student: {job.student_name || "N/A"}</p>
                          <p className="text-xs text-gray-400">
                            {job.creation_date ? new Date(job.creation_date).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {job.status === "pending" ? (
                            <>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">Accept</Button>
                              <Button size="sm" variant="outline">Decline</Button>
                            </>
                          ) : (
                            <Badge variant={job.status === "accepted" ? "default" : "secondary"}>
                              {job.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No job requests at the moment</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">R{stats.total_earnings.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">Completed Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.completed_lessons}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">Avg. per Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      R{stats.completed_lessons > 0 ? Math.round(stats.total_earnings / stats.completed_lessons) : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                  <CardDescription>Your completed sessions and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  {lessons.filter(l => l.status === "completed").length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessons.filter(l => l.status === "completed").map((lesson) => (
                          <TableRow key={lesson.unique_id}>
                            <TableCell>
                              {lesson.scheduled_date ? new Date(lesson.scheduled_date).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>{lesson.course_name || "Session"}</TableCell>
                            <TableCell>{lesson.student_name || "N/A"}</TableCell>
                            <TableCell>{lesson.duration_hours || 1}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              R{((lesson.hourly_rate || 150) * (lesson.duration_hours || 1)).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No earnings yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your tutor account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-[#FF0090] text-white text-2xl">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userName}</h3>
                    <p className="text-gray-500">{userEmail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>Tutor</Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm">{stats.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-bold">{lessons.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Hours Taught</p>
                    <p className="text-2xl font-bold">{stats.total_hours}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Active Students</p>
                    <p className="text-2xl font-bold">{stats.active_students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
