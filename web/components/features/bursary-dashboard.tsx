"use client"

import { useState, useEffect, useRef } from "react"
import { apiService } from "@/lib/api-service"
import { useBursary } from "@/lib/contexts/bursary-context"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Home,
  Users,
  FileText,
  User,
  Search,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  BookOpen,
  Menu,
  CreditCard,
  LogOut,
  Target,
  BarChart3,
  Bell,
  Camera,
} from "lucide-react"
import { DashboardAnalytics } from "./dashboard-analytics"
import { CourseAnalytics } from "./course-analytics"
import { StudentProgress } from "./student-progress"
import { BursaryLogoProfile } from "./bursary-logo-profile"
import { StudentsTab } from "./students-tab"
import { LessonsTab } from "./lessons-tab"
import { InvoicesTab } from "./invoices-tab"
import { BulkUploadEnhanced } from "./bulk-upload-enhanced"
import { NotificationsTab } from "./notifications-tab"

interface BursaryDashboardProps {
  onLogout: () => void
  initialTab?: string
}

export function BursaryDashboard({ onLogout, initialTab = "home" }: BursaryDashboardProps) {
  const { currentBursary, isLoading: bursaryLoading, userProfile, isBursaryAdmin, refreshUserProfile } = useBursary()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Initialize API service with current bursary
  useEffect(() => {
    if (currentBursary) {
      apiService.setCurrentBursary(currentBursary)
      console.log('API service initialized with bursary:', currentBursary)
    }
  }, [currentBursary])

  // Update student form when currentBursary changes
  useEffect(() => {
    if (currentBursary) {
      setAddStudentForm(prev => ({
        ...prev,
        bursary: currentBursary
      }))
    }
  }, [currentBursary])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock data for now - replace with actual API calls
        const mockNotifications = {
          invoicesDue: 3,
          lessonsReviewed: 7,
          studentRequests: 12,
        }
        setNotifications(mockNotifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    if (currentBursary) {
      fetchNotifications()
    }
  }, [currentBursary])

  // Debug logging for tab changes
  const handleTabChange = (tab: string) => {
    console.log('Tab changing from', activeTab, 'to', tab)
    setActiveTab(tab)
  }

  // Debug current active tab and bursary
  console.log('Current activeTab:', activeTab)
  console.log('Current bursary:', currentBursary)
  console.log('User profile:', userProfile)

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userProfile?.email) return

    try {
      const result = await apiService.uploadProfileImage(userProfile.email, file)
      console.log('Profile image updated:', result.imageUrl)
      await refreshUserProfile()
    } catch (error) {
      console.error('Error uploading profile image:', error)
    }
  }
  const [showTutorRequestDialog, setShowTutorRequestDialog] = useState(false)
  const [showStudentsDialog, setShowStudentsDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState({
    invoicesDue: 0,
    lessonsReviewed: 0,
    studentRequests: 0,
  })
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState({ show: false, type: "", message: "" })
  const [studentsRefreshTrigger, setStudentsRefreshTrigger] = useState(0)
  const [addStudentForm, setAddStudentForm] = useState({
    bursary: currentBursary || "NSFAS",
    studentEmail: "",
    studentNameAndSurname: "",
    year: "",
    university: "",
    course: "",
    studentIdNumber: "",
    phoneNumber: "",
    address: "",
    enrollmentDate: "",
    status: "active",
  })
  const [showCreateLessonDialog, setShowCreateLessonDialog] = useState(false)
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false)

  const handleCourseAnalytics = (course: any) => {
    console.log('handleCourseAnalytics called with course:', course)
    setSelectedCourse(course)
    setActiveTab("course-analytics")
    setIsMobileMenuOpen(false)
  }

  const handleViewStudents = () => {
    setActiveTab("students")
    setIsMobileMenuOpen(false)
  }

  const handleViewLessons = () => {
    setActiveTab("lessons")
    setIsMobileMenuOpen(false)
  }

  const handleViewInvoices = () => {
    setActiveTab("invoices")
    setIsMobileMenuOpen(false)
  }

  const handleViewAnalytics = () => {
    setActiveTab("analytics")
    setIsMobileMenuOpen(false)
  }

  const handleAddCourse = () => {
    setShowAddCourseDialog(true)
  }

  const handleAddStudent = async () => {
    try {
      // Prepare the student data
      const studentData = {
        bursary: addStudentForm.bursary,
        studentEmail: addStudentForm.studentEmail,
        studentNameAndSurname: addStudentForm.studentNameAndSurname,
        year: addStudentForm.year ? parseInt(addStudentForm.year) : undefined,
        university: addStudentForm.university || undefined,
        course: addStudentForm.course || undefined,
        studentIdNumber: addStudentForm.studentIdNumber || undefined,
        phoneNumber: addStudentForm.phoneNumber || undefined,
        address: addStudentForm.address || undefined,
        enrollmentDate: addStudentForm.enrollmentDate || undefined,
        status: addStudentForm.status,
      }

      // Submit the student to the backend
      console.log('Submitting student data:', studentData)
      const result = await apiService.createBursaryStudent(studentData)
      console.log('Student creation result:', result)
      
      // Close the dialog and reset the form
      setShowAddStudentDialog(false)
      setAddStudentForm({
        bursary: currentBursary || "NSFAS",
        studentEmail: "",
        studentNameAndSurname: "",
        year: "",
        university: "",
        course: "",
        studentIdNumber: "",
        phoneNumber: "",
        address: "",
        enrollmentDate: "",
        status: "active",
      })
      
      console.log('Form reset with bursary:', currentBursary || "NSFAS")

      // Show success message
      setShowSuccessAnimation({
        show: true,
        type: "approve",
        message: `Student ${addStudentForm.studentNameAndSurname} added successfully!`,
      })

      // Hide success animation after 3 seconds
      setTimeout(() => {
        setShowSuccessAnimation({ show: false, type: "", message: "" })
      }, 3000)
      
      // Refresh the students list
      setStudentsRefreshTrigger(prev => prev + 1)
      
      } catch (err: any) {
        console.error('Error adding student:', err)
        alert(`Failed to add student: ${err.message}`)
      }
  }

  const handleCreateLesson = () => {
    setShowCreateLessonDialog(true)
  }

  const handleCreateInvoice = () => {
    setShowCreateInvoiceDialog(true)
  }

  // Show loading state while bursary is being initialized
  if (bursaryLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0090] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing bursary data...</p>
        </div>
      </div>
    )
  }

  // Check if user is authorized to access bursary dashboard
  if (!isBursaryAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the bursary dashboard. Only bursary administrators can view this content.
            </p>
            {userProfile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Your Role:</strong> {userProfile.userType}
                </p>
                {userProfile.bursaryName && (
                  <p className="text-sm text-gray-600">
                    <strong>Assigned Bursary:</strong> {userProfile.bursaryName}
                  </p>
                )}
              </div>
            )}
            <Button onClick={onLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-1 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <img
              src={"/images/123tutors-logo.png"}
              alt="123tutors"
              className="h-4 w-4 rounded-full object-cover border border-[#FF0090]"
            />
            <span className="text-xs font-medium text-gray-600">Bursary Portal</span>
            {currentBursary && (
              <Badge variant="secondary" className="text-xs ml-0.5">
                {currentBursary}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {/* Mobile Notifications Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationsDialog(true)}
                className="p-0.5 min-h-[28px] min-w-[28px] hover:bg-[#FF0090]/10"
                title="Notifications"
              >
                <Bell className="h-3 w-3 text-[#FF0090]" />
                {(notifications.invoicesDue + notifications.lessonsReviewed + notifications.studentRequests) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FF0090] text-white text-xs rounded-full h-3 w-3 flex items-center justify-center font-medium">
                    {notifications.invoicesDue + notifications.lessonsReviewed + notifications.studentRequests}
                  </span>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="p-0.5 min-h-[28px] min-w-[28px]"
              title="Sign Out"
            >
              <LogOut className="h-3 w-3 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-0.5 min-h-[28px] min-w-[28px] hover:bg-gray-100"
              title="Menu"
            >
              <Menu className="h-3 w-3 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Notifications Bell */}
      <div className="hidden lg:block fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotificationsDialog(true)}
            className="p-2 lg:p-3 xl:p-4 min-h-[44px] min-w-[44px] lg:min-h-[48px] lg:min-w-[48px] xl:min-h-[52px] xl:min-w-[52px] bg-white border border-[#FF0090] shadow-lg hover:bg-[#FF0090]/10"
            title="Notifications"
          >
            <Bell className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-[#FF0090]" />
            {(notifications.invoicesDue + notifications.lessonsReviewed + notifications.studentRequests) > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF0090] text-white text-xs rounded-full h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 flex items-center justify-center font-medium">
                {notifications.invoicesDue + notifications.lessonsReviewed + notifications.studentRequests}
              </span>
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-72 xs:w-80 sm:w-96 bg-white border-r border-gray-200 shadow-md z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-56 xl:w-60 2xl:w-64`}
      >
        <div className="p-3 xs:p-4 sm:p-6 lg:p-3 xl:p-4 2xl:p-6">
          <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6 lg:mb-4 xl:mb-6 2xl:mb-8">
            <img
              src={"/images/123tutors-logo.png"}
              alt="123tutors"
              className="h-10 w-10 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-14 2xl:w-14 rounded-full object-cover border-2 border-[#FF0090]"
            />
            <div className="flex flex-col">
              <span className="text-sm xs:text-base lg:text-sm xl:text-base 2xl:text-lg font-medium text-gray-900">Bursary Portal</span>
              {currentBursary && (
                <Badge variant="secondary" className="text-xs w-fit mt-1">
                  {currentBursary}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 space-y-1 xs:space-y-2 sm:space-y-3 lg:space-y-1 xl:space-y-2 2xl:space-y-3 pb-24">
          <Button
            variant={activeTab === "home" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "home" ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("home")
              setIsMobileMenuOpen(false)
            }}
          >
            <Home className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "requests" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "requests"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("requests")
              setIsMobileMenuOpen(false)
            }}
          >
            <FileText className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Requests
          </Button>
          <Button
            variant={activeTab === "students" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "students"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("students")
              setIsMobileMenuOpen(false)
            }}
          >
            <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Students
          </Button>
          <Button
            variant={activeTab === "progress" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "progress"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("progress")
              setIsMobileMenuOpen(false)
            }}
          >
            <Target className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Progress Tracking
          </Button>
          <Button
            variant={activeTab === "courses" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "courses"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("courses")
              setIsMobileMenuOpen(false)
            }}
          >
            <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            My Courses
          </Button>
          <Button
            variant={activeTab === "lessons" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "lessons"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("lessons")
              setIsMobileMenuOpen(false)
            }}
          >
            <Calendar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            My Lessons
          </Button>
          <Button
            variant={activeTab === "invoices" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "invoices"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("invoices")
              setIsMobileMenuOpen(false)
            }}
          >
            <CreditCard className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Invoices
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "profile"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              console.log('Profile tab clicked')
              setActiveTab("profile")
              setIsMobileMenuOpen(false)
            }}
          >
            <User className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Profile
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "analytics"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("analytics")
              setIsMobileMenuOpen(false)
            }}
          >
            <BarChart3 className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "notifications" ? "default" : "ghost"}
            className={`w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] ${
              activeTab === "notifications"
                ? "bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("notifications")
              setIsMobileMenuOpen(false)
            }}
          >
            <Bell className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base py-2 xs:py-3 sm:py-4 lg:py-2 xl:py-3 2xl:py-4 px-3 xs:px-4 sm:px-6 lg:px-3 xl:px-4 2xl:px-6 min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] lg:min-h-[44px] xl:min-h-[48px] 2xl:min-h-[52px] text-gray-700 hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              onLogout()
              setIsMobileMenuOpen(false)
            }}
          >
            <LogOut className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 mr-2 xs:mr-3 sm:mr-4 lg:mr-2 xl:mr-3 2xl:mr-4" />
            Sign Out
          </Button>
        </nav>

        <div className="absolute bottom-3 xs:bottom-4 left-3 xs:left-4 right-3 xs:right-4 lg:bottom-3 xl:bottom-4 2xl:bottom-6">
          <div className="flex items-center gap-2 xs:gap-3 lg:gap-2 xl:gap-3 2xl:gap-4 p-2 xs:p-3 sm:p-4 lg:p-3 xl:p-4 2xl:p-5 bg-[#FF0090] rounded-lg">
            <div className="relative">
              <Avatar className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-14 2xl:w-14">
                <AvatarImage src={userProfile?.profileImageUrl || "/images/123tutors-logo.png"} />
                <AvatarFallback className="bg-white text-[#FF0090] text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base">
                  {userProfile?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-pink-600 hover:bg-pink-700 flex items-center justify-center transition-colors"
                type="button"
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base font-medium truncate text-white">
                {userProfile?.email?.split('@')[0] || 'afonso'}
              </p>
              <p className="text-xs xs:text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base text-gray-300 truncate">
                {userProfile?.userType === 'bursary_admin' ? 'Bursary Admin' : 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper with extra margin to prevent sidebar overlap */}
      <div className="pt-14 xs:pt-16 lg:pt-0 lg:ml-[22rem] xl:ml-[23rem] 2xl:ml-[24rem]">
        <div className="px-2 xs:px-3 sm:px-4 md:px-6 py-3 xs:py-4 sm:py-6 lg:p-6 xl:p-8 2xl:p-12">
          <div className="max-w-[1200px] mx-auto">
        {activeTab === "home" && <BursaryHomeTab onTabChange={handleTabChange} />}
        {activeTab === "requests" && <RequestsTab />}
        {activeTab === "students" && <StudentsTab onAddStudent={() => setShowAddStudentDialog(true)} refreshTrigger={studentsRefreshTrigger} />}
        {activeTab === "courses" && (
          <CoursesTab
            onCourseAnalytics={handleCourseAnalytics}
            onViewStudents={handleViewStudents}
            onAddCourse={handleAddCourse}
          />
        )}
        {activeTab === "lessons" && <LessonsTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "profile" && (
          <div>
            <BursaryLogoProfile />
          </div>
        )}
        {activeTab === "bulk-upload" && <StudentsTab onAddStudent={() => setShowAddStudentDialog(true)} refreshTrigger={studentsRefreshTrigger} />}
        {activeTab === "analytics" && <DashboardAnalytics />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "progress" && <StudentProgress />}
         {activeTab === "course-analytics" && (
           <CourseAnalytics course={selectedCourse} onBack={() => setActiveTab("courses")} />
         )}
          </div>
        </div>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-2xl border-[#FF0090] max-h-[90vh] overflow-y-auto border-2 w-[95vw] xs:w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Course</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new course for your bursary program
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  placeholder="e.g., Advanced Mathematics"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input id="courseCode" placeholder="e.g., MATH301" className="border-[#FF0090] focus:ring-[#FF0090]" />
              </div>
            </div>
            <div>
              <Label htmlFor="courseDescription">Description</Label>
              <textarea
                id="courseDescription"
                placeholder="Course description and objectives..."
                className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090] min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="Dr. Sarah Johnson"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <select className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090]">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={() => setShowAddCourseDialog(false)}
                className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090] w-full sm:w-auto"
              >
                Create Course
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddCourseDialog(false)}
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="max-w-2xl border-[#FF0090] max-h-[90vh] overflow-y-auto border-2 w-[95vw] xs:w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Student</DialogTitle>
            <DialogDescription className="text-gray-600">
              Register a new student in the bursary program
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Full Name *</Label>
                <Input 
                  id="studentName" 
                  placeholder="John Doe" 
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.studentNameAndSurname}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, studentNameAndSurname: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Email *</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="john@example.com"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.studentEmail}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, studentEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentCourse">Course</Label>
                <Input
                  id="studentCourse"
                  placeholder="Computer Science"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.course}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, course: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="year">Year of Study</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="1"
                  min="1"
                  max="10"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.year}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, year: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="University of Cape Town"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.university}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, university: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="studentIdNumber">Student ID</Label>
                <Input
                  id="studentIdNumber"
                  placeholder="12345678"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.studentIdNumber}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, studentIdNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+27 82 123 4567"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.phoneNumber}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input 
                  id="enrollmentDate" 
                  type="date" 
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                  value={addStudentForm.enrollmentDate}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, enrollmentDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Cape Town, 8001"
                className="border-[#FF0090] focus:ring-[#FF0090]"
                value={addStudentForm.address}
                onChange={(e) => setAddStudentForm({ ...addStudentForm, address: e.target.value })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={handleAddStudent}
                className="flex-1 bg-[#FF0090] text-white hover:bg-[#FF0090]/90 w-full sm:w-auto"
                disabled={!addStudentForm.studentEmail || !addStudentForm.studentNameAndSurname}
              >
                Add Student
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddStudentDialog(false)}
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={showCreateLessonDialog} onOpenChange={setShowCreateLessonDialog}>
        <DialogContent className="max-w-2xl border-[#FF0090] max-h-[90vh] overflow-y-auto border-2 w-[95vw] xs:w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create New Lesson</DialogTitle>
            <DialogDescription className="text-gray-600">Add a new lesson to your course curriculum</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input
                id="lessonTitle"
                placeholder="Introduction to Programming"
                className="border-[#FF0090] focus:ring-[#FF0090]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lessonCourse">Course</Label>
                <select className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090]">
                  <option value="">Select Course</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="medicine">Medicine</option>
                </select>
              </div>
              <div>
                <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  placeholder="45"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lessonDescription">Description</Label>
              <textarea
                id="lessonDescription"
                placeholder="Lesson objectives and content overview..."
                className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090] min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowCreateLessonDialog(false)}
                className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090]"
              >
                Create Lesson
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateLessonDialog(false)}
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoiceDialog} onOpenChange={setShowCreateInvoiceDialog}>
        <DialogContent className="max-w-2xl border-[#FF0090] max-h-[90vh] overflow-y-auto border-2 w-[95vw] xs:w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create New Invoice</DialogTitle>
            <DialogDescription className="text-gray-600">Generate an invoice for student fees</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceStudent">Student</Label>
                <select className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090]">
                  <option value="">Select Student</option>
                  <option value="sarah-johnson">Sarah Johnson</option>
                  <option value="michael-chen">Michael Chen</option>
                  <option value="emily-davis">Emily Davis</option>
                </select>
              </div>
              <div>
                <Label htmlFor="invoiceAmount">Amount (ZAR)</Label>
                <Input
                  id="invoiceAmount"
                  type="number"
                  placeholder="5000"
                  className="border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceDueDate">Due Date</Label>
                <Input id="invoiceDueDate" type="date" className="border-[#FF0090] focus:ring-[#FF0090]" />
              </div>
              <div>
                <Label htmlFor="invoiceCourse">Course</Label>
                <select className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090]">
                  <option value="">Select Course</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="medicine">Medicine</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="invoiceNotes">Notes (Optional)</Label>
              <textarea
                id="invoiceNotes"
                placeholder="Additional notes or payment instructions..."
                className="w-full p-2 border border-[#FF0090] rounded-md focus:ring-[#FF0090] min-h-[60px]"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowCreateInvoiceDialog(false)}
                className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090]"
              >
                Create Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateInvoiceDialog(false)}
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Animation */}
      {showSuccessAnimation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                showSuccessAnimation.type === "approve" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {showSuccessAnimation.type === "approve" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showSuccessAnimation.type === "approve" ? "Student Added Successfully!" : "Error!"}
            </h3>
            <p className="text-gray-600">{showSuccessAnimation.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CoursesTab({
  onCourseAnalytics,
  onViewStudents,
  onAddCourse,
}: {
  onCourseAnalytics: (course: any) => void
  onViewStudents: () => void
  onAddCourse: () => void
}): JSX.Element {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response: any = await apiService.getCourses(1, 100, '')
        setCourses(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses')
        console.error('Error fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleAddCourse = async (courseData: any) => {
    try {
      await apiService.createCourse(courseData)
      // Refresh courses list
      const response: any = await apiService.getCourses(1, 100, '')
      setCourses(response.data)
    } catch (err) {
      console.error('Error adding course:', err)
      alert('Failed to add course. Please try again.')
    }
  }

  if (loading) {
    return <LoadingDisplay message="Loading courses..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

  const courseStudents: any = {
    1: [
      { name: "Sarah Johnson", university: "UCT", hoursUsed: "24", budgetUsed: "R16,800", performance: "Excellent" },
      { name: "Michael Chen", university: "Stellenbosch", hoursUsed: "18", budgetUsed: "R12,600", performance: "Good" },
      { name: "Emily Davis", university: "Wits", hoursUsed: "30", budgetUsed: "R21,000", performance: "Excellent" },
    ],
    2: [
      { name: "James Wilson", university: "UJ", hoursUsed: "15", budgetUsed: "R10,500", performance: "Good" },
      { name: "Lisa Park", university: "UCT", hoursUsed: "22", budgetUsed: "R15,400", performance: "Excellent" },
    ],
    3: [
      { name: "David Kim", university: "Stellenbosch", hoursUsed: "28", budgetUsed: "R19,600", performance: "Good" },
      { name: "Rachel Adams", university: "Wits", hoursUsed: "32", budgetUsed: "R22,400", performance: "Excellent" },
    ],
  }

  const handleViewStudents = (course: any) => {
    setSelectedCourse(course)
    setIsStudentDialogOpen(true)
  }

  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-xs xs:text-xs sm:text-sm lg:text-base text-gray-600">Manage courses offered by the bursary program</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10 w-full xs:w-48 sm:w-64 border-[#FF0090] focus:border-[#FF0090] focus:ring-[#FF0090] text-xs xs:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
        {courses.map((course) => (
          <Card key={course.uniqueId} className="bg-white border-[#FF0090] border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-2 xs:p-3 sm:p-4 lg:p-6">
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {/* Header section with course name and level badge */}
                <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1.5 xs:gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 truncate">{course.moduleName || 'Unknown Course'}</h3>
                    <p className="text-xs text-gray-600">{course.moduleCode || 'N/A'}</p>
                  </div>
                  <Badge
                    variant={
                      course.moduleLevel === "Advanced"
                        ? "destructive"
                        : course.moduleLevel === "Intermediate"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs self-start xs:self-auto"
                  >
                    {course.moduleLevel || 'Unknown'}
                  </Badge>
                </div>

                {/* Main content section */}
                <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4 lg:gap-6">
                  {/* Left section - Course description and instructor */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1 xs:mb-2">{course.moduleDescription || 'No description available'}</p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Instructor:</span> {course.moduleInstructor || 'TBA'}
                    </p>
                  </div>

                  {/* Middle section - Stats */}
                  <div className="flex items-center justify-between xs:justify-center gap-2 xs:gap-3 sm:gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-[#FF0090] rounded-lg mb-1">
                        <Users className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-xs xs:text-sm sm:text-lg font-semibold text-gray-900">-</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-[#FF0090] rounded-lg mb-1">
                        <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-xs xs:text-sm sm:text-lg font-semibold text-gray-900">R{course.moduleBudget?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-600">Budget</p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700 mb-1">Credits</p>
                      <div className="space-y-1">
                        <p className="text-xs xs:text-sm sm:text-lg font-semibold text-gray-900">{course.moduleCredits || 0}</p>
                        <p className="text-xs text-gray-600">Total Credits</p>
                      </div>
                    </div>
                  </div>

                  {/* Right section - Action buttons */}
                  <div className="flex flex-row xs:flex-col gap-1.5 xs:gap-2 min-w-[100px] xs:min-w-[120px] sm:min-w-[140px]">
                    <Button
                      size="sm"
                      onClick={() => handleViewStudents(course)}
                      className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090] whitespace-nowrap text-xs px-2 py-1 flex-1 xs:flex-none"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">View Students</span>
                      <span className="xs:hidden">View St</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCourseAnalytics(course)}
                      className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white whitespace-nowrap text-xs px-2 py-1 flex-1 xs:flex-none"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Course Analytics</span>
                      <span className="xs:hidden">Course A</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Students Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] xs:w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">{(selectedCourse as any)?.moduleName || 'Course'} - Students</DialogTitle>
            <DialogDescription className="text-xs xs:text-sm">
              Students enrolled in {(selectedCourse as any)?.moduleCode || 'Course'} with their progress and budget usage
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && courseStudents[(selectedCourse as any).uniqueId as keyof typeof courseStudents] && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 border-2 border-[#FF0090] rounded-lg bg-white">
                <div className="text-center">
                  <p className="text-base xs:text-lg sm:text-2xl font-bold text-[#FF0090]">-</p>
                  <p className="text-xs text-gray-600">Total Students</p>
                </div>
                <div className="text-center">
                  <p className="text-base xs:text-lg sm:text-2xl font-bold text-[#FF0090]">-</p>
                  <p className="text-xs text-gray-600">Budget Used</p>
                </div>
                <div className="text-center">
                  <p className="text-base xs:text-lg sm:text-2xl font-bold text-[#FF0090]">-</p>
                  <p className="text-xs text-gray-600">Budget Usage</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium text-gray-900">Student</TableHead>
                      <TableHead className="text-xs font-medium text-gray-900">University</TableHead>
                      <TableHead className="text-xs font-medium text-gray-900">Hours Used</TableHead>
                      <TableHead className="text-xs font-medium text-gray-900">Budget Used</TableHead>
                      <TableHead className="text-xs font-medium text-gray-900">Performance</TableHead>
                      <TableHead className="text-xs font-medium text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {courseStudents[(selectedCourse as any).uniqueId as keyof typeof courseStudents].map((student: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
                          <Avatar className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8">
                            <AvatarImage
                              src={`/diverse-students-studying.jpg?height=32&width=32&query=student${index}`}
                            />
                            <AvatarFallback className="text-xs">
                              {student.name
                                .split(" ")
                                .map((n: any) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-xs">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{student.university}</TableCell>
                      <TableCell className="text-xs">{student.hoursUsed}</TableCell>
                      <TableCell className="font-medium text-xs">{student.budgetUsed}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.performance === "Excellent"
                              ? "default"
                              : student.performance === "Good"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {student.performance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" className="bg-[#FF0090] text-white hover:bg-[#FF0090]/90 text-xs px-2 py-1">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BursaryHomeTab({ onTabChange }: { onTabChange: (tab: string) => void }): JSX.Element {
  const { currentBursary, userProfile, isBursaryAdmin } = useBursary()
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)

  // Fetch recent activities from audit logs
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoadingActivities(true)
        const userRole = isBursaryAdmin ? 'admin' : 'user'
        const response = await apiService.getRecentActivities(currentBursary || undefined, userRole, 5, 0) as any
        setRecentActivities(response.data || [])
      } catch (error) {
        console.error('Error fetching recent activities:', error)
        setRecentActivities([])
      } finally {
        setLoadingActivities(false)
      }
    }

    if (currentBursary) {
      fetchRecentActivities()
    }
  }, [currentBursary, userProfile])

  // Helper function to format time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date()
    const activityDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to format activity description
  const formatActivityDescription = (activity: any): string => {
    const action = activity.action
    const studentName = activity.studentName || 'Student'
    
    switch (action) {
      case 'UPDATE_STUDENT_PROGRESS':
        return `${studentName} updated progress`
      case 'UPDATE_STUDENT_PROGRESS_METRICS':
        return `${studentName} updated progress metrics`
      case 'UPDATE_PROGRESS_ON_ACTIVITY':
        return `${studentName} completed activity`
      case 'CREATE_STUDENT_PROGRESS':
        return `${studentName} progress created`
      case 'BULK_UPLOAD_STUDENTS':
        return 'Bulk student upload completed'
      case 'CREATE_BURSARY_STUDENT':
        return `${studentName} added to bursary`
      case 'UPDATE_BURSARY_STUDENT':
        return `${studentName} profile updated`
      case 'DELETE_BURSARY_STUDENT':
        return `${studentName} removed from bursary`
      default:
        return activity.description || activity.action
    }
  }
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data: any = await apiService.getComprehensiveDashboardStats()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <LoadingDisplay message="Loading dashboard..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }
  return (
    <div className="space-y-4 xs:space-y-6 sm:space-y-8 lg:space-y-8 xl:space-y-10 2xl:space-y-12">
      <div className="flex flex-col gap-4 xs:gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:gap-10 2xl:gap-12">
        <div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900">Bursary Dashboard</h1>
          <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Welcome back, Jane. Here's your bursary overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 lg:gap-8 xl:gap-10 2xl:gap-12">
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardContent className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl xs:text-3xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#FF0090]">{dashboardData?.students?.active || 0}</p>
                <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Active Students</p>
              </div>
              <Users className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-16 2xl:w-16 text-[#FF0090] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardContent className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl xs:text-3xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#FF0090]">R{dashboardData?.budget?.totalBudget?.toLocaleString() || 0}</p>
                <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Total Budget</p>
              </div>
              <DollarSign className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-16 2xl:w-16 text-[#FF0090] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardContent className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl xs:text-3xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#FF0090]">R{dashboardData?.budget?.budgetUsed?.toLocaleString() || 0}</p>
                <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Budget Used</p>
              </div>
              <TrendingUp className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-16 2xl:w-16 text-[#FF0090] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardContent className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl xs:text-3xl sm:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#FF0090]">{dashboardData?.budget?.budgetUtilization?.toFixed(1) || 0}%</p>
                <p className="text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl text-gray-600 mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Budget Usage</p>
              </div>
              <Clock className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-16 2xl:w-16 text-[#FF0090] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-8 xl:gap-10 2xl:gap-12">
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <CardTitle className="text-[#FF0090] text-lg xs:text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl">Recent Activity</CardTitle>
            <CardDescription className="text-sm xs:text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Latest student interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 xs:gap-3">
                    <div className="h-6 w-6 xs:h-8 xs:w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.uniqueId || index} className="flex items-center gap-2 xs:gap-3">
                    <Avatar className="h-6 w-6 xs:h-8 xs:w-8">
                      <AvatarFallback className="bg-[#FF0090] text-white text-xs">
                        {getUserInitials(activity.studentName || activity.userEmail || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs xs:text-sm font-medium text-gray-900 truncate">
                        {formatActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Activity will appear here as students interact with the system</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="p-4 xs:p-6 sm:p-8 lg:p-8 xl:p-10 2xl:p-12">
            <CardTitle className="text-[#FF0090] text-lg xs:text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl">Quick Actions</CardTitle>
            <CardDescription className="text-sm xs:text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl mt-2 lg:mt-3 xl:mt-4 2xl:mt-6">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
              <BulkUploadEnhanced />
              <Button
                variant="outline"
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white text-xs py-1.5 xs:py-2 bg-transparent"
                onClick={() => {
                  console.log('New Request button clicked!')
                  onTabChange("requests")
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                New Request
              </Button>
              <Button
                variant="outline"
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white text-xs py-1.5 xs:py-2 bg-transparent"
                onClick={() => {
                  console.log('Export Data button clicked!')
                  // TODO: Implement export functionality
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Export Data
              </Button>
              <Button
                variant="outline"
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white text-xs py-1.5 xs:py-2 bg-transparent"
                onClick={() => {
                  console.log('View Analytics button clicked!')
                  onTabChange("analytics")
                }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RequestsTab(): JSX.Element {
  const { currentBursary } = useBursary()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState({ open: false, type: "", requestId: "" })
  const [viewDetailsModal, setViewDetailsModal] = useState({ open: false, request: null })
  const [showSuccessAnimation, setShowSuccessAnimation] = useState({ show: false, type: "", message: "" })
  const [filterModal, setFilterModal] = useState({ open: false })
  const [filters, setFilters] = useState({ urgency: "all", subject: "all", university: "all" })
  const [filteredRequests, setFilteredRequests] = useState(requests)

  const [tutorRequestForm, setTutorRequestForm] = useState({
    studentEmail: "",
    studentFirstName: "",
    studentLastName: "",
    bursaryName: currentBursary || "NSFAS",
    hoursListText: "",
    extraTutoringRequirements: "",
    tutoringStartPeriod: "",
  })

  // Update tutor request form when currentBursary changes
  useEffect(() => {
    if (currentBursary) {
      setTutorRequestForm(prev => ({
        ...prev,
        bursaryName: currentBursary
      }))
    }
  }, [currentBursary])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const response: any = await apiService.getTutorRequests(1, 100, '')
        setRequests(response.data)
        setFilteredRequests(response.data) // Initialize filtered requests
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch requests')
        console.error('Error fetching requests:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  // Sync filtered requests when requests change
  useEffect(() => {
    setFilteredRequests(requests)
  }, [requests])

  const availableStudents = [
    "Aaron Smith",
    "Emma Wilson",
    "James Brown",
    "Sarah Johnson",
    "Michael Chen",
    "Lisa Park",
    "David Kim",
    "Rachel Adams",
  ]

  const applyFilters = () => {
    let filtered = requests

    if (filters.urgency !== "all") {
      filtered = filtered.filter((req) => req.urgency === filters.urgency)
    }

    if (filters.subject !== "all") {
      filtered = filtered.filter((req) => req.subject === filters.subject)
    }

    if (filters.university !== "all") {
      filtered = filtered.filter((req) => req.university === filters.university)
    }

    setFilteredRequests(filtered)
    setFilterModal({ open: false })
  }

  const clearFilters = () => {
    setFilters({ urgency: "all", subject: "all", university: "all" })
    setFilteredRequests(requests)
    setFilterModal({ open: false })
  }

  if (loading) {
    return <LoadingDisplay message="Loading requests..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Request ID",
        "Student Name",
        "Student Email",
        "Hours Requested",
        "Tutors Notified",
        "Total Amount",
        "Status",
        "Created Date",
      ],
      ...filteredRequests.map((req) => [
        req.uniqueId,
        `${req.studentFirstName} ${req.studentLastName}`,
        req.studentEmail,
        req.hoursListText || 'N/A',
        req.tutorsNotifiedNum || '0',
        req.totalAmount || '0',
        req.paid ? 'Paid' : 'Pending',
        new Date(req.creationDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bursary-requests-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleTutorRequestSubmit = async () => {
    try {
      console.log("Submitting tutor request:", tutorRequestForm)
      
      // Prepare the request data
      const requestData = {
        studentEmail: tutorRequestForm.studentEmail,
        studentFirstName: tutorRequestForm.studentFirstName,
        studentLastName: tutorRequestForm.studentLastName,
        bursaryName: tutorRequestForm.bursaryName,
        hoursListText: tutorRequestForm.hoursListText,
        extraTutoringRequirements: tutorRequestForm.extraTutoringRequirements,
        tutoringStartPeriod: tutorRequestForm.tutoringStartPeriod,
        paid: false,
      }

      // Submit the request to the backend
      await apiService.createTutorRequest(requestData)
      
      // Close the dialog and reset the form
      setIsRequestDialogOpen(false)
      setTutorRequestForm({
        studentEmail: "",
        studentFirstName: "",
        studentLastName: "",
        bursaryName: currentBursary || "NSFAS",
        hoursListText: "",
        extraTutoringRequirements: "",
        tutoringStartPeriod: "",
      })

      // Refresh the requests list
      const response: any = await apiService.getTutorRequests(1, 100, '')
      console.log("Refreshed requests response:", response)
      setRequests(response.data)
      
      // Also update filtered requests
      setFilteredRequests(response.data)
      
      // Show success message
      setShowSuccessAnimation({
        show: true,
        type: "approve",
        message: `Tutor request submitted successfully for ${tutorRequestForm.studentFirstName} ${tutorRequestForm.studentLastName}!`,
      })

      // Hide success animation after 3 seconds
      setTimeout(() => {
        setShowSuccessAnimation({ show: false, type: "", message: "" })
      }, 3000)
      
      console.log("Tutor request submitted successfully!")
    } catch (err) {
      console.error('Error submitting tutor request:', err)
      alert('Failed to submit tutor request. Please try again.')
    }
  }

  const handleApproveReject = (type: any, requestId: any) => {
    setConfirmationModal({ open: true, type, requestId })
  }

  const confirmAction = async () => {
    const { type, requestId } = confirmationModal
    console.log('Looking for request with uniqueId:', requestId)
    console.log('Available requests:', requests.map(r => ({ uniqueId: r.uniqueId, studentFirstName: r.studentFirstName })))
    const request = requests.find((r) => r.uniqueId === requestId)
    console.log('Found request:', request)

    try {
      setConfirmationModal({ open: false, type: "", requestId: "" })
      
      // Call the real API
      if (type === "approve") {
        await apiService.approveTutorRequest(requestId)
      } else if (type === "reject") {
        await apiService.rejectTutorRequest(requestId)
      }

      // Show success animation
      const studentName = request ? `${request.studentFirstName} ${request.studentLastName}` : 'the request';
      setShowSuccessAnimation({
        show: true,
        type,
        message: `Request ${type === "approve" ? "approved" : "rejected"} successfully for ${studentName}!`,
      })

      // Refresh the requests list
      const response: any = await apiService.getTutorRequests(1, 100, '')
      setRequests(response.data)
      setFilteredRequests(response.data)

      // Hide success animation after 3 seconds
      setTimeout(() => {
        setShowSuccessAnimation({ show: false, type: "", message: "" })
      }, 3000)
    } catch (error) {
      console.error(`Error ${type}ing request:`, error)
      setError(`Failed to ${type} request. Please try again.`)
      
      // Show error message
      setShowSuccessAnimation({
        show: true,
        type: "error",
        message: `Failed to ${type} request. Please try again.`,
      })

      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowSuccessAnimation({ show: false, type: "", message: "" })
      }, 3000)
    }
  }

  const handleViewDetails = (request: any) => {
    setViewDetailsModal({ open: true, request })
  }

  return (
    <div className="space-y-6">
      {showSuccessAnimation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                showSuccessAnimation.type === "approve" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {showSuccessAnimation.type === "approve" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showSuccessAnimation.type === "approve" ? "Request Approved!" : "Request Rejected!"}
            </h3>
            <p className="text-gray-600">{showSuccessAnimation.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">New Requests</h1>
          <p className="text-xs xs:text-sm text-gray-600">Review and approve student tutoring requests</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2">
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF0090] text-white hover:bg-[#FF0090]/90 text-xs xs:text-sm py-2 px-3">
                <Plus className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">Request Tutor for Student</span>
                <span className="xs:hidden">Request Tutor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-[95vw] xs:w-[90vw] sm:w-full max-h-[90vh] overflow-y-auto border-[#FF0090]">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Request Tutor for Student</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Submit a tutoring request on behalf of a student
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName" className="text-gray-700">
                    Student First Name
                  </Label>
                  <Input
                    id="studentFirstName"
                    placeholder="Enter student's first name"
                    value={tutorRequestForm.studentFirstName}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, studentFirstName: e.target.value })}
                    className="border-2 border-[#FF0090] focus:ring-[#FF0090]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentLastName" className="text-gray-700">
                    Student Last Name
                  </Label>
                  <Input
                    id="studentLastName"
                    placeholder="Enter student's last name"
                    value={tutorRequestForm.studentLastName}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, studentLastName: e.target.value })}
                    className="border-2 border-[#FF0090] focus:ring-[#FF0090]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentEmail" className="text-gray-700">
                    Student Email
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="Enter student's email address"
                    value={tutorRequestForm.studentEmail}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, studentEmail: e.target.value })}
                    className="border-2 border-[#FF0090] focus:ring-[#FF0090]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursListText" className="text-gray-700">
                    Hours Requested
                  </Label>
                  <Input
                    id="hoursListText"
                    placeholder="e.g., 10 hours per week"
                    value={tutorRequestForm.hoursListText}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, hoursListText: e.target.value })}
                    className="border-2 border-[#FF0090] focus:ring-[#FF0090]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoringStartPeriod" className="text-gray-700">
                    Tutoring Start Period
                  </Label>
                  <Input
                    id="tutoringStartPeriod"
                    type="date"
                    value={tutorRequestForm.tutoringStartPeriod}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, tutoringStartPeriod: e.target.value })}
                    className="border-2 border-[#FF0090] focus:ring-[#FF0090]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extraTutoringRequirements" className="text-gray-700">
                    Extra Tutoring Requirements
                  </Label>
                  <textarea
                    id="extraTutoringRequirements"
                    placeholder="Any special requirements or notes..."
                    value={tutorRequestForm.extraTutoringRequirements}
                    onChange={(e) => setTutorRequestForm({ ...tutorRequestForm, extraTutoringRequirements: e.target.value })}
                    className="w-full p-2 border-2 border-[#FF0090] rounded-md focus:ring-2 focus:ring-[#FF0090] focus:border-transparent min-h-[60px] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleTutorRequestSubmit}
                    className="flex-1 bg-[#FF0090] text-white hover:bg-[#FF0090]/90"
                    disabled={
                      !tutorRequestForm.studentEmail || !tutorRequestForm.studentFirstName || !tutorRequestForm.studentLastName
                    }
                  >
                    Submit Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsRequestDialogOpen(false)}
                    className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={filterModal.open} onOpenChange={(open) => setFilterModal({ open })}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent text-xs xs:text-sm py-2 px-3"
              >
                <Filter className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] xs:w-[90vw] sm:w-full border-[#FF0090]">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Filter Requests</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Filter requests by urgency, subject, or university
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Urgency Level</Label>
                  <select
                    className="w-full p-2 border-2 border-[#FF0090] rounded-md focus:ring-2 focus:ring-[#FF0090] focus:border-transparent"
                    value={filters.urgency}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Subject</Label>
                  <select
                    className="w-full p-2 border-2 border-[#FF0090] rounded-md focus:ring-2 focus:ring-[#FF0090] focus:border-transparent"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  >
                    <option value="all">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">University</Label>
                  <select
                    className="w-full p-2 border-2 border-[#FF0090] rounded-md focus:ring-2 focus:ring-[#FF0090] focus:border-transparent"
                    value={filters.university}
                    onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                  >
                    <option value="all">All Universities</option>
                    <option value="UCT">UCT</option>
                    <option value="Stellenbosch">Stellenbosch</option>
                    <option value="Wits">Wits</option>
                    <option value="UJ">UJ</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={applyFilters} className="flex-1 bg-[#FF0090] text-white hover:bg-[#FF0090]/90">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent text-xs xs:text-sm py-2 px-3"
            onClick={handleExport}
          >
            <Download className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 xs:gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.uniqueId} className="bg-white border-2 border-[#FF0090] hover:shadow-lg transition-shadow">
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 xs:gap-4 mb-3 xs:mb-4">
                <div className="flex items-center gap-3 xs:gap-4">
                  <Avatar className="h-10 w-10 xs:h-12 xs:w-12 border-2 border-[#FF0090]">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?key=tasua&height=48&width=48&query=${request.studentFirstName}`}
                    />
                    <AvatarFallback className="bg-[#FF0090] text-white text-xs xs:text-sm">
                      {request.studentFirstName
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base xs:text-lg font-semibold text-gray-900">{request.studentFirstName} {request.studentLastName}</h3>
                    <p className="text-xs xs:text-sm text-gray-600">{request.studentEmail}</p>
                    <p className="text-xs text-gray-500">Request ID: {request.uniqueId}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    request.notInterested ? "destructive" : request.paid ? "default" : "secondary"
                  }
                  className={
                    request.notInterested 
                      ? "bg-red-500 text-white" 
                      : request.paid 
                        ? "bg-green-500 text-white" 
                        : "bg-yellow-500 text-white"
                  }
                >
                  {request.notInterested ? "Rejected" : request.paid ? "Approved" : "Pending"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-4 mb-3 xs:mb-4">
                <div className="text-center p-2 xs:p-3 bg-white border-[#FF0090] border-2 rounded-lg shadow-lg">
                  <Clock className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 text-[#FF0090]" />
                  <p className="text-sm xs:text-lg font-semibold text-[#FF0090]">{request.hoursListText || 'N/A'}</p>
                  <p className="text-xs text-gray-600">Hours Requested</p>
                </div>
                <div className="text-center p-2 xs:p-3 bg-white border-[#FF0090] border-2 rounded-lg shadow-lg">
                  <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 text-[#FF0090]" />
                  <p className="text-sm xs:text-lg font-semibold text-[#FF0090]">{request.tutorsNotifiedNum || '0'}</p>
                  <p className="text-xs text-gray-600">Tutors Notified</p>
                </div>
                <div className="text-center p-2 xs:p-3 bg-white border-[#FF0090] border-2 rounded-lg shadow-lg">
                  <DollarSign className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 text-[#FF0090]" />
                  <p className="text-sm xs:text-lg font-semibold text-[#FF0090]">R{request.totalAmount || '0'}</p>
                  <p className="text-xs text-gray-600">Total Amount</p>
                </div>
                <div className="text-center p-2 xs:p-3 bg-white border-[#FF0090] border-2 rounded-lg shadow-lg">
                  <Calendar className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 text-[#FF0090]" />
                  <p className="text-sm xs:text-lg font-semibold text-[#FF0090]">{new Date(request.creationDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600">Created Date</p>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row gap-2">
                <Button
                  size="sm"
                  className="bg-[#FF0090] text-white hover:bg-[#FF0090]/90 text-xs py-2 px-3"
                  onClick={() => handleApproveReject("approve", request.uniqueId)}
                >
                  <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Approve Request</span>
                  <span className="xs:hidden">Approve</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-xs py-2 px-3"
                  onClick={() => handleApproveReject("reject", request.uniqueId)}
                >
                  <XCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <span className="hidden xs:inline">Reject Request</span>
                  <span className="xs:hidden">Reject</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent text-xs py-2 px-3"
                  onClick={() => handleViewDetails(request)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={confirmationModal.open}
        onOpenChange={(open) => setConfirmationModal({ ...confirmationModal, open })}
      >
        <DialogContent className="max-w-md w-[95vw] xs:w-[90vw] sm:w-full border-[#FF0090]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {confirmationModal.type === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to {confirmationModal.type} this tutoring request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={confirmAction}
              className={
                confirmationModal.type === "approve"
                  ? "flex-1 bg-[#FF0090] text-white hover:bg-[#FF0090]/90"
                  : "flex-1 bg-red-500 text-white hover:bg-red-600"
              }
            >
              Yes, {confirmationModal.type === "approve" ? "Approve" : "Reject"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmationModal({ open: false, type: "", requestId: "" })}
              className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDetailsModal.open} onOpenChange={(open) => setViewDetailsModal({ ...viewDetailsModal, open })}>
        <DialogContent className="max-w-2xl w-[95vw] xs:w-[90vw] sm:w-full border-[#FF0090] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Request Details</DialogTitle>
            <DialogDescription className="text-gray-600">Complete information for tutoring request</DialogDescription>
          </DialogHeader>
          {viewDetailsModal.request && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16 border-2 border-[#FF0090]">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.jpg?height=64&width=64&query=${(viewDetailsModal.request as any)?.studentFirstName}`}
                    />
                    <AvatarFallback className="bg-[#FF0090] text-white text-lg">
                      {(viewDetailsModal.request as any)?.studentFirstName
                        ?.split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{(viewDetailsModal.request as any)?.studentFirstName} {(viewDetailsModal.request as any)?.studentLastName}</h3>
                  <p className="text-gray-600">{(viewDetailsModal.request as any)?.studentEmail}</p>
                  <p className="text-sm text-gray-500">Request ID: {(viewDetailsModal.request as any)?.uniqueId}</p>
                </div>
                <Badge
                  variant={
                    (viewDetailsModal.request as any)?.notInterested ? "destructive" : (viewDetailsModal.request as any)?.paid ? "default" : "secondary"
                  }
                  className={
                    (viewDetailsModal.request as any)?.notInterested 
                      ? "bg-red-500 text-white" 
                      : (viewDetailsModal.request as any)?.paid 
                        ? "bg-green-500 text-white" 
                        : "bg-yellow-500 text-white"
                  }
                >
                  {(viewDetailsModal.request as any)?.notInterested ? "Rejected" : (viewDetailsModal.request as any)?.paid ? "Approved" : "Pending"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Hours Requested</Label>
                  <p className="text-gray-900">{(viewDetailsModal.request as any)?.hoursListText || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Request Date</Label>
                  <p className="text-gray-900">{(viewDetailsModal.request as any)?.creationDate ? new Date((viewDetailsModal.request as any).creationDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Tutors Notified</Label>
                  <p className="text-gray-900">{(viewDetailsModal.request as any)?.tutorsNotifiedNum || '0'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Total Amount</Label>
                  <p className="text-gray-900">R{(viewDetailsModal.request as any)?.totalAmount || '0'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Payment Status</Label>
                  <p className="text-gray-900">{(viewDetailsModal.request as any)?.notInterested ? 'Rejected' : (viewDetailsModal.request as any)?.paid ? 'Approved' : 'Pending'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">Bursary</Label>
                  <p className="text-gray-900">{(viewDetailsModal.request as any)?.bursaryName || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Additional Information</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    Student requires additional tutoring support. Current
                    academic performance indicates need for focused assistance to improve understanding and achieve
                    academic goals. Previous tutoring sessions have shown positive progress.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setViewDetailsModal({ open: false, request: null })
                    handleApproveReject("approve", (viewDetailsModal.request as any)?.uniqueId || "")
                  }}
                  className="bg-[#FF0090] text-white hover:bg-[#FF0090]/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => {
                    setViewDetailsModal({ open: false, request: null })
                    handleApproveReject("reject", (viewDetailsModal.request as any)?.uniqueId || "")
                  }}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewDetailsModal({ open: false, request: null })}
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
