"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Calendar, CheckCircle, AlertCircle, XCircle, Search, Edit, Save, X } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"

interface StudentProgressData {
  uniqueId: string
  studentName: string
  studentEmail: string
  courseName: string
  bursaryName: string
  overallProgress: number
  gpa: number
  creditsCompleted: number
  totalCredits: number
  status: 'active' | 'completed' | 'inactive' | 'suspended'
  attendancePercentage: number
  assignmentsPercentage: number
  examsPercentage: number
  participationPercentage: number
  creationDate: string
  modifiedDate: string
}

interface StudentWithProgress extends StudentProgressData {
  id: string
  name: string
  email: string
  course: string
  year: number
  avatar: string
  milestones: Array<{
    id: number
    name: string
    status: string
    progress: number
    dueDate: string
  }>
  recentActivity: Array<{
    date: string
    activity: string
    type: string
  }>
  performance: {
    attendance: number
    assignments: number
    exams: number
    participation: number
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "pending":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-blue-600" />
    case "pending":
      return <AlertCircle className="h-4 w-4 text-gray-600" />
    case "overdue":
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

export function StudentProgress() {
  const [studentsData, setStudentsData] = useState<StudentWithProgress[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProgress | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingProgress, setEditingProgress] = useState<Partial<StudentWithProgress>>({})
  const [saving, setSaving] = useState(false)

  // Transform backend data to frontend format
  const transformStudentData = (progressData: StudentProgressData, recentActivities: any[] = []): StudentWithProgress => {
    // Generate milestones based on progress
    const milestones = [
      { id: 1, name: "Foundation Courses", status: progressData.overallProgress > 25 ? "completed" : "in-progress", progress: Math.min(100, progressData.overallProgress * 1.2), dueDate: "2024-01-15" },
      { id: 2, name: "Core Subjects", status: progressData.overallProgress > 50 ? "completed" : progressData.overallProgress > 25 ? "in-progress" : "pending", progress: Math.min(100, progressData.overallProgress * 1.1), dueDate: "2024-06-15" },
      { id: 3, name: "Advanced Topics", status: progressData.overallProgress > 75 ? "completed" : progressData.overallProgress > 50 ? "in-progress" : "pending", progress: Math.min(100, progressData.overallProgress * 0.9), dueDate: "2024-12-15" },
      { id: 4, name: "Final Project", status: progressData.overallProgress > 90 ? "completed" : progressData.overallProgress > 75 ? "in-progress" : "pending", progress: Math.min(100, progressData.overallProgress * 0.8), dueDate: "2025-05-15" },
    ]

    // Transform real audit data to recent activity format
    const recentActivity = recentActivities.map(activity => ({
      date: new Date(activity.createdAt).toISOString().split('T')[0],
      activity: activity.description || activity.action,
      type: getActivityType(activity.action),
    }))

    return {
      ...progressData,
      id: progressData.uniqueId,
      name: progressData.studentName,
      email: progressData.studentEmail,
      course: progressData.courseName,
      year: Math.floor(Math.random() * 4) + 1, // Mock year since it's not in backend
      avatar: "/placeholder.svg?height=40&width=40",
      milestones,
      recentActivity,
      performance: {
        attendance: progressData.attendancePercentage,
        assignments: progressData.assignmentsPercentage,
        exams: progressData.examsPercentage,
        participation: progressData.participationPercentage,
      }
    }
  }

  // Helper function to map audit actions to activity types
  const getActivityType = (action: string): string => {
    const actionMap: Record<string, string> = {
      'UPDATE_STUDENT_PROGRESS': 'progress',
      'UPDATE_STUDENT_PROGRESS_METRICS': 'progress',
      'UPDATE_PROGRESS_ON_ACTIVITY': 'activity',
      'CREATE_STUDENT_PROGRESS': 'progress',
      'BULK_UPLOAD_STUDENTS': 'upload',
      'CREATE_BURSARY_STUDENT': 'student',
      'UPDATE_BURSARY_STUDENT': 'student',
      'DELETE_BURSARY_STUDENT': 'student',
    }
    return actionMap[action] || 'general'
  }

  // Fetch student progress data with audit activities
  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch student progress data
        const response = await apiService.getStudentProgress(1, 100, searchTerm) as any
        
        // Fetch recent activities for all students
        const activitiesResponse = await apiService.getRecentActivities(undefined, 'admin', 100, 0) as any
        const allActivities = activitiesResponse.data || []
        
        // Transform students with their recent activities
        const transformedStudents = await Promise.all(
          response.data.map(async (student: any) => {
            // Get activities for this specific student
            const studentActivities = allActivities.filter((activity: any) => 
              activity.studentEmail === student.studentEmail
            ).slice(0, 5) // Limit to 5 most recent activities
            
            return transformStudentData(student, studentActivities)
          })
        )
        
        setStudentsData(transformedStudents)
        
        // Set first student as selected if none selected
        if (transformedStudents.length > 0 && !selectedStudent) {
          setSelectedStudent(transformedStudents[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student progress data')
        console.error('Error fetching student progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentProgress()
  }, [searchTerm])

  // Update selected student when students data changes
  useEffect(() => {
    if (studentsData.length > 0 && !selectedStudent) {
      setSelectedStudent(studentsData[0])
    }
  }, [studentsData, selectedStudent])

  // Handle edit mode
  const handleEditProgress = () => {
    if (selectedStudent) {
      setEditingProgress({
        overallProgress: selectedStudent.overallProgress,
        gpa: selectedStudent.gpa,
        creditsCompleted: selectedStudent.creditsCompleted,
        totalCredits: selectedStudent.totalCredits,
        performance: {
          attendance: selectedStudent.performance.attendance,
          assignments: selectedStudent.performance.assignments,
          exams: selectedStudent.performance.exams,
          participation: selectedStudent.performance.participation,
        }
      })
      setIsEditing(true)
    }
  }

  // Handle save progress updates
  const handleSaveProgress = async () => {
    if (!selectedStudent || !editingProgress) return

    try {
      setSaving(true)
      
      const updateData = {
        overallProgress: editingProgress.overallProgress,
        gpa: editingProgress.gpa,
        creditsCompleted: editingProgress.creditsCompleted,
        totalCredits: editingProgress.totalCredits,
        attendancePercentage: editingProgress.performance?.attendance,
        assignmentsPercentage: editingProgress.performance?.assignments,
        examsPercentage: editingProgress.performance?.exams,
        participationPercentage: editingProgress.performance?.participation,
      }

      await apiService.updateStudentProgress(selectedStudent.uniqueId, updateData)
      
      // Update local state
      const updatedStudent = {
        ...selectedStudent,
        ...editingProgress,
        performance: editingProgress.performance || selectedStudent.performance
      }
      
      setSelectedStudent(updatedStudent)
      setStudentsData(prev => 
        prev.map(student => 
          student.id === selectedStudent.id ? updatedStudent : student
        )
      )
      
      setIsEditing(false)
      setEditingProgress({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      console.error('Error updating progress:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingProgress({})
  }

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === "all" || student.course === courseFilter
    const matchesYear = yearFilter === "all" || student.year.toString() === yearFilter

    return matchesSearch && matchesCourse && matchesYear
  })

  const courses = [...new Set(studentsData.map((s) => s.course))]
  const years = [...new Set(studentsData.map((s) => s.year.toString()))]

  if (loading) {
    return <LoadingDisplay message="Loading student progress data..." />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Student Data</h3>
          <p className="text-gray-600">No student progress data available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Progress Tracking</h2>
          <p className="text-gray-600">Monitor individual student progress and milestones</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-pink-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-500"
                />
              </div>
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48 border-pink-200 focus:border-pink-500">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32 border-pink-200 focus:border-pink-500">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    Year {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Students</CardTitle>
              <CardDescription>{filteredStudents.length} students found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-pink-50 transition-colors ${
                      selectedStudent.id === student.id ? "bg-pink-50 border-l-4 border-l-pink-500" : ""
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-pink-100 text-pink-600">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-sm text-gray-600 truncate">{student.course}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={student.overallProgress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500">{student.overallProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Overview */}
          <Card className="border-pink-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-pink-100 text-pink-600 text-lg">
                      {selectedStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{selectedStudent.name}</CardTitle>
                    <CardDescription className="text-base">{selectedStudent.email}</CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="border-pink-200">
                        {selectedStudent.course}
                      </Badge>
                      <Badge variant="outline" className="border-pink-200">
                        Year {selectedStudent.year}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={handleEditProgress}
                      variant="outline"
                      size="sm"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Progress
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProgress}
                        disabled={saving}
                        size="sm"
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProgress.overallProgress || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          overallProgress: Number(e.target.value)
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Overall Progress (%)</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-pink-600">{selectedStudent.overallProgress}%</div>
                      <div className="text-sm text-gray-600">Overall Progress</div>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        value={editingProgress.gpa || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          gpa: Number(e.target.value)
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">GPA</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-pink-600">{selectedStudent.gpa}</div>
                      <div className="text-sm text-gray-600">GPA</div>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        value={editingProgress.creditsCompleted || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          creditsCompleted: Number(e.target.value)
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Credits Completed</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-pink-600">{selectedStudent.creditsCompleted}</div>
                      <div className="text-sm text-gray-600">Credits Completed</div>
                    </>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        value={editingProgress.totalCredits || 120}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          totalCredits: Number(e.target.value)
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Total Credits</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-pink-600">{selectedStudent.totalCredits}</div>
                      <div className="text-sm text-gray-600">Total Credits</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Academic Milestones</CardTitle>
              <CardDescription>Track progress through key academic milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedStudent.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">{getStatusIcon(milestone.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                        <Badge className={getStatusColor(milestone.status)}>{milestone.status.replace("-", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={milestone.progress} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600">{milestone.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Due: {milestone.dueDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProgress.performance?.attendance || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          performance: {
                            ...prev.performance,
                            attendance: Number(e.target.value)
                          }
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Attendance (%)</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-bold text-pink-600">{selectedStudent.performance.attendance}%</div>
                      <div className="text-sm text-gray-600">Attendance</div>
                      <Progress value={selectedStudent.performance.attendance} className="mt-2 h-2" />
                    </>
                  )}
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProgress.performance?.assignments || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          performance: {
                            ...prev.performance,
                            assignments: Number(e.target.value)
                          }
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Assignments (%)</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-bold text-pink-600">{selectedStudent.performance.assignments}%</div>
                      <div className="text-sm text-gray-600">Assignments</div>
                      <Progress value={selectedStudent.performance.assignments} className="mt-2 h-2" />
                    </>
                  )}
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProgress.performance?.exams || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          performance: {
                            ...prev.performance,
                            exams: Number(e.target.value)
                          }
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Exams (%)</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-bold text-pink-600">{selectedStudent.performance.exams}%</div>
                      <div className="text-sm text-gray-600">Exams</div>
                      <Progress value={selectedStudent.performance.exams} className="mt-2 h-2" />
                    </>
                  )}
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProgress.performance?.participation || 0}
                        onChange={(e) => setEditingProgress(prev => ({
                          ...prev,
                          performance: {
                            ...prev.performance,
                            participation: Number(e.target.value)
                          }
                        }))}
                        className="text-center text-lg font-bold"
                      />
                      <div className="text-sm text-gray-600">Participation (%)</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl font-bold text-pink-600">{selectedStudent.performance.participation}%</div>
                      <div className="text-sm text-gray-600">Participation</div>
                      <Progress value={selectedStudent.performance.participation} className="mt-2 h-2" />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              <CardDescription>Latest academic activities and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedStudent.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.activity}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {activity.date}
                        <Badge variant="outline" className="ml-2 border-pink-200">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
