"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Search, Plus, BookOpen, User, Calendar, TrendingUp, Upload, FileSpreadsheet, UserX, UserCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { apiService } from "@/lib/api-service"
import { BulkUploadEnhanced } from "./bulk-upload-enhanced"

interface Student {
  id: string
  name: string
  email: string
  course: string
  university: string
  progress: number
  status: "active" | "inactive" | "completed" | "disabled"
  enrollmentDate: string
  rating: number
  avatar?: string
  studentDisallowed?: boolean
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    course: "Computer Science",
    university: "University of Cape Town",
    progress: 75,
    status: "active",
    enrollmentDate: "2024-01-15",
    rating: 4.5,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    course: "Engineering",
    university: "University of the Witwatersrand",
    progress: 60,
    status: "active",
    enrollmentDate: "2024-02-01",
    rating: 4.2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    course: "Medicine",
    university: "University of Stellenbosch",
    progress: 90,
    status: "active",
    enrollmentDate: "2024-01-10",
    rating: 4.8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@email.com",
    course: "Business",
    university: "University of Pretoria",
    progress: 100,
    status: "completed",
    enrollmentDate: "2023-09-15",
    rating: 4.0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

interface StudentsTabProps {
  onAddStudent?: () => void;
  refreshTrigger?: number;
}

export function StudentsTab({ onAddStudent, refreshTrigger: externalRefreshTrigger }: StudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get student progress
  const getStudentProgress = async (studentEmail: string): Promise<number> => {
    try {
      const progressResponse = await apiService.getStudentProgressByEmail(studentEmail) as any
      if (progressResponse && progressResponse.length > 0) {
        return progressResponse[0].overallProgress || 0
      }
      return 0
    } catch (err) {
      console.error('Error fetching student progress:', err)
      return 0
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await apiService.getBursaryStudents(1, 100, searchTerm) as any
        
        // Transform students with progress data
        const transformedStudents = await Promise.all(
          response.data.map(async (student: any) => ({
            id: student.uniqueId,
            name: student.studentNameAndSurname,
            email: student.studentEmail,
            course: student.course || 'Unknown Course',
            progress: await getStudentProgress(student.studentEmail),
            status: student.studentDisallowed ? 'disabled' : (student.status || 'active'),
            enrollmentDate: student.enrollmentDate || student.creationDate,
            avatar: "/placeholder.svg?height=40&width=40",
            studentDisallowed: student.studentDisallowed || false,
          }))
        )
        
        setStudents(transformedStudents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students')
        console.error('Error fetching students:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [searchTerm, refreshTrigger, externalRefreshTrigger])

  const handleBulkUploadComplete = () => {
    // Refresh the students list after bulk upload
    setRefreshTrigger(prev => prev + 1)
  }

  const handleDisableStudent = async (studentId: string) => {
    try {
      await apiService.disableBursaryStudent(studentId)
      setRefreshTrigger(prev => prev + 1) // Refresh the list
    } catch (error) {
      console.error('Error disabling student:', error)
      setError('Failed to disable student')
    }
  }

  const handleEnableStudent = async (studentId: string) => {
    try {
      await apiService.enableBursaryStudent(studentId)
      setRefreshTrigger(prev => prev + 1) // Refresh the list
    } catch (error) {
      console.error('Error enabling student:', error)
      setError('Failed to enable student')
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || student.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAddStudent = async (studentData: any) => {
    try {
      await apiService.createBursaryStudent(studentData)
      // Refresh the students list
      const response = await apiService.getBursaryStudents(1, 100, searchTerm) as any
      const transformedStudents = response.data.map((student: any) => ({
        id: student.uniqueId,
        name: student.studentNameAndSurname,
        email: student.studentEmail,
        course: student.course || 'Unknown Course',
        progress: 0,
        status: student.status || 'active',
        enrollmentDate: student.enrollmentDate || student.creationDate,
        avatar: "/placeholder.svg?height=40&width=40",
      }))
      setStudents(transformedStudents)
    } catch (err) {
      console.error('Error adding student:', err)
    }
  }

  if (loading) {
    return <LoadingDisplay message="Loading students..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "disabled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }


  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600">Manage and monitor student progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <BulkUploadEnhanced onUploadComplete={handleBulkUploadComplete} />
          <Button
            onClick={onAddStudent}
            className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090] text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 min-h-[44px] sm:min-h-[40px]"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {students.filter((s) => s.status === "active").length}
                </p>
              </div>
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Budget Used</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  R{students.length * 15000}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Avg Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Average Student Rating</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  4.2/5
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-[#FF0090] border-2">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#FF0090] focus:ring-[#FF0090] text-sm"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={`text-xs sm:text-sm px-3 py-2 ${
                  filterStatus === "all"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }`}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className={`text-xs sm:text-sm px-3 py-2 ${
                  filterStatus === "active"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }`}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
                className={`text-xs sm:text-sm px-3 py-2 ${
                  filterStatus === "completed"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }`}
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "disabled" ? "default" : "outline"}
                onClick={() => setFilterStatus("disabled")}
                className={`text-xs sm:text-sm px-3 py-2 ${
                  filterStatus === "disabled"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }`}
              >
                Disabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-[#FF0090] border-2">
        <CardHeader>
          <CardTitle className="text-gray-900">Student List</CardTitle>
          <CardDescription className="text-gray-600">
            View and manage all students in your bursary program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-sm">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-600 truncate">{student.email}</p>
                  </div>
                  <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Course:</span>
                    <span className="text-sm font-medium text-gray-900">{student.course}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Progress:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-16 h-2" />
                      <span className="text-sm text-gray-600">{student.progress}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Enrolled:</span>
                    <span className="text-sm text-gray-600">{student.enrollmentDate}</span>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                        className="w-full border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white text-sm"
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                        <DialogContent className="border-[#FF0090] border-2 max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Student Details</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Detailed information about {selectedStudent?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedStudent && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 flex-shrink-0">
                                  <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-lg">
                                    {selectedStudent.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {selectedStudent.name}
                                  </h3>
                                  <p className="text-gray-600 truncate">{selectedStudent.email}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Course</p>
                                  <p className="font-medium text-gray-900">{selectedStudent.course}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <Badge className={getStatusColor(selectedStudent.status)}>
                                    {selectedStudent.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <Progress value={selectedStudent.progress} className="flex-1" />
                                    <span className="text-sm text-gray-600">{selectedStudent.progress}%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Enrollment Date</p>
                                  <p className="font-medium text-gray-900">{selectedStudent.enrollmentDate}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                  <div className="flex gap-2">
                    {student.status === 'disabled' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnableStudent(student.id)}
                        className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white text-sm"
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Enable
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisableStudent(student.id)}
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Disable
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] text-sm font-medium text-gray-900">Student</TableHead>
                  <TableHead className="min-w-[120px] text-sm font-medium text-gray-900">Course</TableHead>
                  <TableHead className="min-w-[100px] text-sm font-medium text-gray-900">University</TableHead>
                  <TableHead className="min-w-[80px] text-sm font-medium text-gray-900">Status</TableHead>
                  <TableHead className="min-w-[100px] text-sm font-medium text-gray-900">Enrolled</TableHead>
                  <TableHead className="min-w-[120px] text-sm font-medium text-gray-900">Student Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-sm">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                          <p className="text-xs text-gray-600 truncate">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 min-w-[120px] text-sm">{student.course}</TableCell>
                    <TableCell className="text-gray-900 min-w-[100px] text-sm">{student.university}</TableCell>
                    <TableCell className="min-w-[80px]">
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 min-w-[100px] whitespace-nowrap text-sm">
                      {student.enrollmentDate}
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{student.rating}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < Math.floor(student.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                            className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white whitespace-nowrap text-sm px-3 py-2 mt-1"
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-[#FF0090] border-2 max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Student Details</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Detailed information about {selectedStudent?.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedStudent && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 flex-shrink-0">
                                  <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-lg">
                                    {selectedStudent.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {selectedStudent.name}
                                  </h3>
                                  <p className="text-gray-600 truncate">{selectedStudent.email}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Course</p>
                                  <p className="font-medium text-gray-900">{selectedStudent.course}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  <Badge className={getStatusColor(selectedStudent.status)}>
                                    {selectedStudent.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <Progress value={selectedStudent.progress} className="flex-1" />
                                    <span className="text-sm text-gray-600">{selectedStudent.progress}%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Enrollment Date</p>
                                  <p className="font-medium text-gray-900">{selectedStudent.enrollmentDate}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <div className="flex gap-2 mt-2">
                        {student.status === 'disabled' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEnableStudent(student.id)}
                            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white text-xs px-2 py-1"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Enable
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisableStudent(student.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs px-2 py-1"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Disable
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
