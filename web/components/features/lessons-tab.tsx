"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, BookOpen, Clock, Users, Target, CheckCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  course: string
  duration: number
  studentsEnrolled: number
  completionRate: number
  status: "published" | "draft" | "archived"
  createdDate: string
  description: string
}

const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    course: "Computer Science",
    duration: 45,
    studentsEnrolled: 25,
    completionRate: 85,
    status: "published",
    createdDate: "2024-01-15",
    description: "Basic programming concepts and fundamentals",
  },
  {
    id: "2",
    title: "Database Design Principles",
    course: "Computer Science",
    duration: 60,
    studentsEnrolled: 18,
    completionRate: 72,
    status: "published",
    createdDate: "2024-02-01",
    description: "Learn how to design efficient database structures",
  },
  {
    id: "3",
    title: "Advanced Mathematics",
    course: "Engineering",
    duration: 90,
    studentsEnrolled: 15,
    completionRate: 68,
    status: "published",
    createdDate: "2024-01-20",
    description: "Complex mathematical concepts for engineering applications",
  },
  {
    id: "4",
    title: "Business Strategy Fundamentals",
    course: "Business",
    duration: 75,
    studentsEnrolled: 30,
    completionRate: 0,
    status: "draft",
    createdDate: "2024-03-01",
    description: "Core principles of business strategy and planning",
  },
]

export function LessonsTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        const response = await apiService.getLessons(1, 100, searchTerm)
        // Handle both response formats: {data: [], total: 0} or direct array []
        const lessonsData = response.data || response || []
        const transformedLessons = lessonsData.map((lesson: any) => ({
          id: lesson.uniqueId,
          title: lesson.title || 'Untitled Lesson',
          course: lesson.courseName || 'Unknown Course',
          duration: lesson.duration || 0,
          studentsEnrolled: lesson.studentsEnrolled || 0,
          completionRate: lesson.completionRate || 0,
          status: lesson.status || 'draft',
          createdDate: lesson.creationDate || new Date().toISOString(),
          description: lesson.description || 'No description available',
        }))
        setLessons(transformedLessons)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons')
        console.error('Error fetching lessons:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [searchTerm])

  const handleCreateLesson = async (lessonData: any) => {
    try {
      await apiService.createLesson(lessonData)
      // Refresh lessons list
      const response = await apiService.getLessons(1, 100, searchTerm)
      const transformedLessons = response.data.map((lesson: any) => ({
        id: lesson.uniqueId,
        title: lesson.title || 'Untitled Lesson',
        course: lesson.courseName || 'Unknown Course',
        duration: lesson.duration || 0,
        studentsEnrolled: lesson.studentsEnrolled || 0,
        completionRate: lesson.completionRate || 0,
        status: lesson.status || 'draft',
        createdDate: lesson.creationDate || new Date().toISOString(),
        description: lesson.description || 'No description available',
      }))
      setLessons(transformedLessons)
    } catch (err) {
      console.error('Error creating lesson:', err)
      alert('Failed to create lesson. Please try again.')
    }
  }

  if (loading) {
    return <LoadingDisplay message="Loading lessons..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

const filteredLessons = lessons.filter((lesson) => {
  const matchesSearch =
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesFilter = filterStatus === "all" || lesson.status === filterStatus
  return matchesSearch && matchesFilter
})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const totalLessons = lessons.length
  const publishedLessons = lessons.filter((l) => l.status === "published").length
  const totalStudents = lessons.reduce((acc, l) => acc + l.studentsEnrolled, 0)
  const avgCompletion = lessons.length > 0 ? Math.round(lessons.reduce((acc, l) => acc + l.completionRate, 0) / totalLessons) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
          <p className="text-gray-600">Manage course content and track lesson performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedLessons}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-gray-900">{avgCompletion}%</p>
              </div>
              <Target className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-[#FF0090] border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search lessons by title, course, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#FF0090] focus:ring-[#FF0090]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={
                  filterStatus === "all"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                All
              </Button>
              <Button
                variant={filterStatus === "published" ? "default" : "outline"}
                onClick={() => setFilterStatus("published")}
                className={
                  filterStatus === "published"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                Published
              </Button>
              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                onClick={() => setFilterStatus("draft")}
                className={
                  filterStatus === "draft"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card className="border-[#FF0090] border-2">
        <CardHeader>
          <CardTitle className="text-gray-900">Lesson Library</CardTitle>
          <CardDescription className="text-gray-600">
            Manage all lessons and track their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">{lesson.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">{lesson.course}</TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}m
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {lesson.studentsEnrolled}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={lesson.completionRate} className="w-16" />
                      <span className="text-sm text-gray-600">{lesson.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lesson.status)}>{lesson.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLesson(lesson)}
                            className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-[#FF0090] border-2 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Lesson Details</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Detailed information about {selectedLesson?.title}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLesson && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedLesson.title}</h3>
                                <p className="text-gray-600">{selectedLesson.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Course</p>
                                  <p className="font-medium text-gray-900">{selectedLesson.course}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <Badge className={getStatusColor(selectedLesson.status)}>
                                    {selectedLesson.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Duration</p>
                                  <p className="font-medium text-gray-900">{selectedLesson.duration} minutes</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Created</p>
                                  <p className="font-medium text-gray-900">{selectedLesson.createdDate}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <Card className="border-[#FF0090] border-2">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-gray-600">Students Enrolled</p>
                                        <p className="text-xl font-bold text-gray-900">
                                          {selectedLesson.studentsEnrolled}
                                        </p>
                                      </div>
                                      <Users className="h-6 w-6 text-[#FF0090]" />
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="border-[#FF0090] border-2">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-gray-600">Completion Rate</p>
                                        <p className="text-xl font-bold text-gray-900">
                                          {selectedLesson.completionRate}%
                                        </p>
                                      </div>
                                      <Target className="h-6 w-6 text-[#FF0090]" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
