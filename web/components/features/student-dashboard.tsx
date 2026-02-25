"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { supabase } from "@/lib/supabase"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Home,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  User,
  GraduationCap,
  FileText,
  LogOut,
  Menu,
  Bell,
  Target,
  CheckCircle,
} from "lucide-react"

interface StudentDashboardProps {
  onLogout: () => void
}

interface Lesson {
  unique_id: string
  course_name: string
  tutor_name: string
  scheduled_date: string
  duration_hours: number
  status: string
  rating?: number
}

interface TutorRequest {
  unique_id: string
  request_courses: string
  institute_name: string
  status: string
  creation_date: string
  tutor_for: string
}

interface StudentProgress {
  total_hours: number
  completed_lessons: number
  average_rating: number
  subjects: string[]
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("Student")

  // Data states
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([])
  const [progress, setProgress] = useState<StudentProgress>({
    total_hours: 0,
    completed_lessons: 0,
    average_rating: 0,
    subjects: [],
  })

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
          setUserName(user.user_metadata?.full_name || user.email.split("@")[0])
          await loadStudentData(user.email)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    loadUserAndData()
  }, [])

  const loadStudentData = async (email: string) => {
    try {
      // Load tutor requests for this student
      const requestsData = await apiService.getTutorRequests(1, 100, email)
      if (requestsData?.data) {
        setTutorRequests(requestsData.data)
      }

      // Load lessons
      const lessonsData = await apiService.getLessons(1, 100, email)
      if (lessonsData?.data) {
        setLessons(lessonsData.data)

        // Calculate progress from lessons
        const completedLessons = lessonsData.data.filter((l: any) => l.status === "completed")
        const totalHours = completedLessons.reduce((sum: number, l: any) => sum + (l.duration_hours || 1), 0)
        const avgRating = completedLessons.length > 0
          ? completedLessons.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / completedLessons.length
          : 0

        setProgress({
          total_hours: totalHours,
          completed_lessons: completedLessons.length,
          average_rating: avgRating,
          subjects: [...new Set(lessonsData.data.map((l: any) => l.course_name).filter(Boolean))],
        })
      }
    } catch (err) {
      console.error("Error loading student data:", err)
    }
  }

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "lessons", label: "My Lessons", icon: BookOpen },
    { id: "requests", label: "Tutor Requests", icon: FileText },
    { id: "progress", label: "My Progress", icon: TrendingUp },
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
          <GraduationCap className="h-8 w-8 text-[#FF0090]" />
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
          <GraduationCap className="h-6 w-6 text-[#FF0090]" />
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
            <p className="text-gray-600">Track your learning progress and manage your tutoring sessions.</p>
          </div>

          {/* Tab Content */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
                    <Clock className="h-4 w-4 text-[#FF0090]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progress.total_hours}</div>
                    <p className="text-xs text-gray-500">hours of tutoring</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Completed Lessons</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progress.completed_lessons}</div>
                    <p className="text-xs text-gray-500">lessons finished</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Active Requests</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tutorRequests.filter(r => r.status !== "completed").length}
                    </div>
                    <p className="text-xs text-gray-500">pending requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Avg Rating</CardTitle>
                    <Target className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progress.average_rating > 0 ? progress.average_rating.toFixed(1) : "N/A"}
                    </div>
                    <p className="text-xs text-gray-500">session rating</p>
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
                            <p className="text-sm text-gray-500">with {lesson.tutor_name || "Assigned Tutor"}</p>
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
                        <TableHead>Tutor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.unique_id}>
                          <TableCell className="font-medium">{lesson.course_name || "Session"}</TableCell>
                          <TableCell>{lesson.tutor_name || "N/A"}</TableCell>
                          <TableCell>
                            {lesson.scheduled_date ? new Date(lesson.scheduled_date).toLocaleDateString() : "TBD"}
                          </TableCell>
                          <TableCell>{lesson.duration_hours || 1} hr</TableCell>
                          <TableCell>
                            <Badge variant={lesson.status === "completed" ? "default" : "secondary"}>
                              {lesson.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{lesson.rating ? `${lesson.rating}/5` : "-"}</TableCell>
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

          {activeTab === "requests" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tutor Requests</CardTitle>
                  <CardDescription>Your tutoring requests and their status</CardDescription>
                </div>
                <Button className="bg-[#FF0090] hover:bg-[#E0007F]" onClick={() => window.location.href = "/request"}>
                  Request a Tutor
                </Button>
              </CardHeader>
              <CardContent>
                {tutorRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tutorRequests.map((request) => (
                        <TableRow key={request.unique_id}>
                          <TableCell className="font-medium">{request.request_courses || "Various"}</TableCell>
                          <TableCell>{request.institute_name || "N/A"}</TableCell>
                          <TableCell>{request.tutor_for || "N/A"}</TableCell>
                          <TableCell>
                            {request.creation_date ? new Date(request.creation_date).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={request.status === "completed" ? "default" : "secondary"}>
                              {request.status || "pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tutor requests yet</p>
                    <Button className="bg-[#FF0090] hover:bg-[#E0007F]" onClick={() => window.location.href = "/request"}>
                      Request Your First Tutor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Track your academic journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Hours Completed</span>
                      <span>{progress.total_hours} / 50 hours</span>
                    </div>
                    <Progress value={(progress.total_hours / 50) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Lessons Completed</span>
                      <span>{progress.completed_lessons} lessons</span>
                    </div>
                    <Progress value={(progress.completed_lessons / 20) * 100} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Subjects Studied</h4>
                    <div className="flex flex-wrap gap-2">
                      {progress.subjects.length > 0 ? (
                        progress.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary">{subject}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No subjects yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
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
                    <Badge className="mt-2">Student</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Lessons</p>
                    <p className="text-2xl font-bold">{lessons.length}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Active Requests</p>
                    <p className="text-2xl font-bold">{tutorRequests.filter(r => r.status !== "completed").length}</p>
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
