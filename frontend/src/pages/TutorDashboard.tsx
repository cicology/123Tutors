import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  DollarSign,
  Settings,
  User,
  Users,
  Star,
  Clock,
  TrendingUp,
  X,
  LogOut,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const TutorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchPassword, setSwitchPassword] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonStudent, setLessonStudent] = useState<any>(null);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    subject: "",
    date: "",
    time: "",
    duration: "60",
    type: "online",
    notes: "",
  });
  const storedEmail = localStorage.getItem('user_email') || '';
  const [roleSwitchValue, setRoleSwitchValue] = useState(false);
  const hasBothRoles = apiService.hasBothRoles();

  const normalizeRequestStatus = (status?: string) => String(status || '').toLowerCase();
  const pendingRequestsList = useMemo(
    () => requests.filter((request) => normalizeRequestStatus(request.status) === "pending"),
    [requests]
  );
  const acceptedRequestsList = useMemo(
    () => requests.filter((request) => normalizeRequestStatus(request.status) === "accepted"),
    [requests]
  );
  const displayedStudents = useMemo(() => {
    // Students are now fetched directly from accepted requests in fetchStudents
    // So we just return the students list as-is
    return students || [];
  }, [students]);

  useEffect(() => {
    fetchDashboardData();
    fetchRequests();
    fetchUpcomingLessons();
    fetchStudents();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getTutorDashboard();
      if (response.error) {
        // If unauthorized or token missing/expired, send to sign in
        if (String(response.error).toLowerCase().includes("unauthorized") ||
            String(response.error).toLowerCase().includes("forbidden")) {
          navigate("/signin");
          return;
        }
        toast.error(response.error);
        return;
      }
      if (response.data) {
        const data: any = response.data;
        console.log("Dashboard data received:", JSON.stringify(data, null, 2));
        console.log("Tutor data:", data.tutor);
        console.log("Application status:", data.applicationStatus);
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.setToken(null);
    localStorage.removeItem('user_roles');
    localStorage.removeItem('isTutor');
    localStorage.removeItem('isStudent');
    localStorage.removeItem('tutorId');
    localStorage.removeItem('studentId');
    window.location.href = "/";
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await apiService.getTutorRequests();
      if (response.data) {
        setRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchUpcomingLessons = async () => {
    setLessonsLoading(true);
    try {
      const response = await apiService.getLessons();
      console.log("Lessons API response (full):", JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error("Error fetching lessons:", response.error);
        toast.error(`Failed to load lessons: ${response.error}`);
        return;
      }
      
      // Handle both direct array response and { data: [...] } response
      let allLessons: any[] = [];
      
      if (response.data) {
        allLessons = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        allLessons = response;
      }
      
      console.log(`Total lessons fetched: ${allLessons.length}`);
      console.log(`Lessons by studentId:`, allLessons.reduce((acc: any, lesson: any) => {
        const studentId = lesson.studentId || 'unknown';
        acc[studentId] = (acc[studentId] || 0) + 1;
        return acc;
      }, {}));
      
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Filter lessons scheduled for the next 7 days with status 'scheduled'
      const upcoming = allLessons
        .filter((lesson: any) => {
          if (!lesson.scheduledAt) {
            console.warn('Lesson missing scheduledAt:', lesson.id);
            return false;
          }
          
          const lessonDate = new Date(lesson.scheduledAt);
          const isUpcoming = lessonDate >= now && 
                             lessonDate <= nextWeek && 
                             (lesson.status === 'scheduled' || lesson.status === 'SCHEDULED');
          
          if (!isUpcoming && lessonDate >= now) {
            console.log(`Lesson filtered out:`, {
              id: lesson.id,
              studentId: lesson.studentId,
              scheduledAt: lesson.scheduledAt,
              status: lesson.status,
              isFuture: lessonDate >= now,
              isWithinWeek: lessonDate <= nextWeek,
            });
          }
          
          return isUpcoming;
        })
        .sort((a: any, b: any) => {
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        });
      
      console.log(`Upcoming lessons (next 7 days): ${upcoming.length}`);
      console.log(`Upcoming lessons by studentId:`, upcoming.reduce((acc: any, lesson: any) => {
        const studentId = lesson.studentId || 'unknown';
        acc[studentId] = (acc[studentId] || 0) + 1;
        return acc;
      }, {}));
      
      setUpcomingLessons(upcoming.slice(0, 10)); // Show up to 10 upcoming lessons instead of 5
    } catch (error) {
      console.error("Error fetching upcoming lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      // Get students from accepted requests instead of non-existent /students endpoint
      const requestsResponse = await apiService.getTutorRequests();
      
      if (requestsResponse.error) {
        console.error("Error fetching requests:", requestsResponse.error);
        setStudents([]);
        setStudentsLoading(false);
        return;
      }
      
      let allRequests: any[] = [];
      if (requestsResponse.data) {
        allRequests = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
      } else if (Array.isArray(requestsResponse)) {
        allRequests = requestsResponse;
      }
      
      // Filter to only accepted requests and extract unique students
      const acceptedRequests = allRequests.filter((request: any) => 
        normalizeRequestStatus(request.status) === "accepted"
      );
      
      // Extract unique students from accepted requests
      const studentMap = new Map<string, any>();
      acceptedRequests.forEach((request: any) => {
        if (request.student && request.student.id) {
          const studentId = request.student.id;
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              ...request.student,
              latestRequestId: request.id,
              courseName: request.course?.name,
              requestCreatedAt: request.createdAt,
            });
          }
        }
      });
      
      const studentsList = Array.from(studentMap.values());
      console.log("Students from accepted requests:", studentsList);
      console.log("Number of students found:", studentsList.length);
      
      // Fetch lessons for each student to get their schedules
      const lessonsResponse = await apiService.getLessons();
      let allLessons: any[] = [];
      
      if (lessonsResponse && !lessonsResponse.error) {
        if (Array.isArray(lessonsResponse)) {
          allLessons = lessonsResponse;
        } else if (lessonsResponse.data) {
          allLessons = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
        }
      }
      
      console.log("All lessons:", allLessons);
      
      // Attach lessons to each student
      const studentsWithLessons = studentsList.map((student: any) => {
        const studentLessons = allLessons.filter((lesson: any) => 
          lesson.studentId === student.id && lesson.status === 'scheduled'
        ).sort((a: any, b: any) => 
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
        
        return {
          ...student,
          lessons: studentLessons,
          upcomingLessons: studentLessons.filter((lesson: any) => 
            new Date(lesson.scheduledAt) >= new Date()
          ).slice(0, 3), // Show next 3 upcoming lessons
        };
      });
      
      console.log("Students with lessons:", studentsWithLessons);
      setStudents(studentsWithLessons);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(true);
    try {
      const response = await apiService.acceptRequest(requestId);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Request accepted! Schedule the first lesson when you're ready.");
      fetchRequests();
      fetchStudents(); // Refresh students list
      fetchUpcomingLessons(); // Refresh upcoming lessons
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequest(true);
    try {
      const response = await apiService.declineRequest(requestId);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Request declined");
      fetchRequests();
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("Failed to decline request");
    } finally {
      setProcessingRequest(false);
    }
  };


  const openLessonModal = (student: any) => {
    setLessonStudent(student);
    setLessonForm({
      subject: "",
      date: "",
      time: "",
      duration: "60",
      type: "online",
      notes: "",
    });
    setLessonModalOpen(true);
  };

  const openLessonFromRequest = (request: any) => {
    if (!request?.student) {
      toast.error("Student information missing for this request");
      return;
    }
    openLessonModal({
      ...request.student,
      latestRequestId: request.id,
      lessons: request.student.lessons || [],
    });
  };

  const handleScheduleLesson = async () => {
    if (!lessonStudent) return;
    if (!lessonForm.subject.trim()) {
      toast.error("Please enter a subject for the lesson");
      return;
    }
    if (!lessonForm.date || !lessonForm.time) {
      toast.error("Please select a date and time");
      return;
    }
    const scheduledAt = new Date(`${lessonForm.date}T${lessonForm.time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      toast.error("Invalid date or time");
      return;
    }

    setLessonSubmitting(true);
    try {
      const payload: any = {
        studentId: lessonStudent.id,
        subject: lessonForm.subject.trim(),
        scheduledAt,
        duration: Number(lessonForm.duration) || 60,
        type: lessonForm.type,
        notes: lessonForm.notes?.trim() || undefined,
      };

      if (lessonStudent.latestRequestId) {
        payload.requestId = lessonStudent.latestRequestId;
      }

      const response = await apiService.createLesson(payload);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Lesson scheduled successfully");
      setLessonModalOpen(false);
      setLessonStudent(null);
      fetchUpcomingLessons();
      fetchStudents();
    } catch (error) {
      console.error("Error scheduling lesson:", error);
      toast.error("Failed to schedule lesson");
    } finally {
      setLessonSubmitting(false);
    }
  };

  const handleConfirmSwitchToStudent = async () => {
    setSwitchLoading(true);
    try {
      const resp = await apiService.login(storedEmail, switchPassword);
      if (resp.error || !resp.data?.isStudent) {
        toast.error("Incorrect student password. Try again or return to dashboard.");
        return;
      }
      toast.success("Switched to student");
      navigate("/student-dashboard");
    } catch (e) {
      toast.error("Failed to switch role. Try again.");
    } finally {
      setSwitchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
        </div>
      </div>
    );
  }

  const tutorData = dashboardData?.tutor || {};
  console.log("Tutor data for name extraction:", tutorData);
  
  // Get tutor name - check multiple possible field names
  const firstName = tutorData.firstName || tutorData.first_name || '';
  const lastName = tutorData.lastName || tutorData.last_name || '';
  const tutorName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName 
    ? firstName
    : tutorData.email 
    ? tutorData.email.split('@')[0]
    : "Tutor";
  
  // Check if tutor is an ambassador
  const isAmbassador = tutorData.isAmbassador || false;
  
  console.log("Extracted tutor name:", tutorName, "from firstName:", firstName, "lastName:", lastName);
  
  // Application status should reflect tutor's actual status - normalize to lowercase for comparison
  const rawStatus = dashboardData?.applicationStatus || "pending";
  const applicationStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : String(rawStatus).toLowerCase();
  console.log("Application status:", applicationStatus, "raw:", rawStatus);
  const stats = dashboardData?.stats || {};
  const safeNumber = (value: any, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };
  const ratingValue = safeNumber(stats.rating);
  const monthEarningsValue = safeNumber(stats.thisMonthEarnings);
  const sidebarLinks = [
    { label: "My Courses", href: "/tutor-courses", icon: BookOpen },
    { label: "My Students", href: "/tutor-students", icon: Users },
    { label: "Lessons", href: "/tutor-lessons", icon: Calendar },
    { label: "Reviews", href: "/tutor-reviews", icon: Star },
    { label: "Analytics", href: "/tutor-analytics", icon: TrendingUp },
    { label: "Payments", href: "/tutor-payments", icon: DollarSign },
    { label: "Accepted Requests", href: "/tutor-accepted-requests", icon: Check },
  ];


  const earnings = {
    thisMonth: 0,
    lastMonth: 0,
    totalEarnings: 0,
    pendingPayments: 0
  };

  const handleRoleSwitchToggle = (checked: boolean) => {
    if (!hasBothRoles) {
      toast.error("Link a student profile to switch roles.");
      setRoleSwitchValue(false);
      return;
    }

    if (checked) {
      setSwitchOpen(true);
    }
    setRoleSwitchValue(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-gradient">123tutors</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tutor-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Access all tutor features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.label}
                      variant="ghost"
                      className="w-full justify-between h-auto py-2 px-3"
                      asChild
                    >
                      <Link to={link.href}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-accent" />
                          <span>{link.label}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
            {hasBothRoles && (
              <Card>
                <CardHeader>
                  <CardTitle>Switch Roles</CardTitle>
                  <CardDescription>Jump to your student dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">Tutor</span>
                    <Switch checked={roleSwitchValue} onCheckedChange={handleRoleSwitchToggle} />
                    <span className="text-sm text-muted-foreground">Student</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
          <div className="flex-1 space-y-8">
        {/* Welcome Section */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2 border-border/50 bg-gradient-to-r from-primary/10 via-background to-background">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3"><span className="text-gradient">Tutor Dashboard</span></h1>
                <h2 className="text-3xl font-bold">Welcome back, {tutorName}!</h2>
                <p className="text-muted-foreground mt-2">
                  Manage your students, schedule lessons, and track your progress.
                </p>
                {isAmbassador && (
                  <p className="text-xs text-amber-600 font-medium mt-3 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Ambassador perks unlocked
                  </p>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground">This month</p>
                <p className="text-3xl font-semibold">R{monthEarningsValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.thisMonthSessions || 0} sessions scheduled
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${applicationStatus === "approved" ? "border-green-200 bg-green-50" : applicationStatus === "pending" ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Application status
              </CardTitle>
              <CardDescription>
                {applicationStatus === "approved"
                  ? "Your profile is discoverable to students."
                  : applicationStatus === "pending"
                  ? "Hang tight while we review your application."
                  : "Please contact support for your next steps."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge
                variant={
                  applicationStatus === "approved"
                    ? "default"
                    : applicationStatus === "pending"
                    ? "secondary"
                    : "destructive"
                }
                className="px-4 py-1 text-sm"
              >
                {applicationStatus.toUpperCase()}
              </Badge>
              {applicationStatus !== "approved" && (
                <Button variant="outline" asChild size="sm">
                  <Link to="/tutor-settings">Update profile</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <CardDescription>Students you're working with</CardDescription>
              </div>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CardDescription>Total earnings</CardDescription>
              </div>
              <DollarSign className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R{monthEarningsValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <CardDescription>Published offerings</CardDescription>
              </div>
              <BookOpen className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <CardDescription>Based on student reviews</CardDescription>
              </div>
              <Star className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ratingValue.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Pending Tutor Requests
                </div>
                {pendingRequestsList.length > 0 && (
                  <Badge variant="destructive">
                    {pendingRequestsList.length} pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Review incoming tutoring requests, then accept, decline, or refer.</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : pendingRequestsList.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No pending course requests</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Students will appear here when they request your courses
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequestsList.map((request) => {
                      let scheduleData: any = null;
                      try {
                        scheduleData = request.preferredSchedule ? JSON.parse(request.preferredSchedule) : null;
                      } catch (error) {
                        console.warn("Invalid preferredSchedule JSON", error);
                      }
                      const preferredSlots = scheduleData?.preferredSlots || scheduleData?.slots || null;

                      return (
                        <div
                          key={request.id}
                          className="p-4 border rounded-lg bg-accent/5 border-accent/20 transition-colors hover:bg-accent/10"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-lg">
                                  {request.course?.name || request.serviceType || "Tutor Request"}
                                </h4>
                                <Badge variant="outline">Pending</Badge>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                  <strong>Student:</strong> {request.student?.firstName} {request.student?.lastName}
                                  {request.student?.email && <> ({request.student.email})</>}
                                </p>
                                {request.lessonCount && (
                                  <p>
                                    <strong>Requested Pack:</strong> {request.lessonCount} ×{" "}
                                    {request.lessonDuration || 60} mins
                                  </p>
                                )}
                                {request.totalPrice && (
                                  <p>
                                    <strong>Estimated total:</strong> R{Number(request.totalPrice).toFixed(2)}
                                  </p>
                                )}
                                {preferredSlots && Array.isArray(preferredSlots) && preferredSlots.length > 0 ? (
                                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                    <p className="font-medium text-foreground">Preferred slots:</p>
                                    <ul className="list-disc list-inside">
                                      {preferredSlots.map((slot: any, index: number) => (
                                        <li key={`${request.id}-slot-${index}`}>
                                          {slot.day}: {slot.start} - {slot.end}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  scheduleData && (
                                    <>
                                      {scheduleData.days && scheduleData.days.length > 0 && (
                                        <p>
                                          <strong>Preferred Days:</strong> {scheduleData.days.join(", ")}
                                        </p>
                                      )}
                                      {scheduleData.times && scheduleData.times.length > 0 && (
                                        <p>
                                          <strong>Preferred Times:</strong> {scheduleData.times.join(", ")}
                                        </p>
                                      )}
                                      {scheduleData.duration && (
                                        <p>
                                          <strong>Duration:</strong> {scheduleData.duration} minutes
                                        </p>
                                      )}
                                      {scheduleData.lessonType && (
                                        <p>
                                          <strong>Lesson Type:</strong>{" "}
                                          {scheduleData.lessonType === "in_person" ? "In Person" : "Online"}
                                        </p>
                                      )}
                                    </>
                                  )
                                )}
                                {request.message && (
                                  <p className="mt-2 italic">
                                    <strong>Message:</strong> {request.message}
                                  </p>
                                )}
                                <p className="text-xs mt-2">
                                  Requested on {new Date(request.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(request.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={processingRequest}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeclineRequest(request.id)}
                              disabled={processingRequest}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Requests</CardTitle>
                <CardDescription>These students are waiting for you to schedule lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : acceptedRequestsList.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">
                    No accepted requests yet. Accept a request to see it here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedRequestsList.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="p-3 border rounded-lg bg-background/80 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {request.student?.firstName} {request.student?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.course?.name || request.serviceType || "Custom tutoring"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Accepted</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tip: schedule the first lesson to get the relationship going.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="accent"
                            size="sm"
                            className="flex-1"
                            onClick={() => openLessonFromRequest(request)}
                          >
                            Schedule
                          </Button>
                        </div>
                      </div>
                    ))}
                    {acceptedRequestsList.length > 3 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link to="/tutor-accepted-requests">View all accepted requests</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Health</CardTitle>
                <CardDescription>Keep your profile in the spotlight</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Add at least three active courses to appear in more searches.</p>
                <p>• Keep your availability updated weekly.</p>
                <p>• Ask recent students for reviews to boost your rating.</p>
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link to="/tutor-settings">Update Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled tutoring sessions for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessonsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : upcomingLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/tutor-lessons">View All Lessons</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {upcomingLessons.map((lesson) => {
                      const lessonDate = new Date(lesson.scheduledAt);
                      const formattedDate = lessonDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      const formattedTime = lessonDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      
                      return (
                        <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {lesson.student?.firstName} {lesson.student?.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {lesson.subject} {lesson.course && `• ${lesson.course.name}`}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formattedDate} at {formattedTime}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration} min
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={lesson.type === "online" ? "default" : "secondary"}>
                              {lesson.type === "online" ? "Online" : "In Person"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/tutor-lessons">View All Lessons</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Students */}
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
              <CardDescription>Students you're currently working with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : displayedStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No students yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Students will appear here once you accept their tutoring request.
                    </p>
                  </div>
                ) : (
                  displayedStudents.map((student) => {
                    const scheduledLessonsCount = student.lessons?.filter((lesson: any) => lesson.status === 'scheduled').length || 0;
                    return (
                      <div key={student.id} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {student.firstName || student.first_name || ''} {student.lastName || student.last_name || ''}
                              {(!student.firstName && !student.first_name && !student.lastName && !student.last_name) && 
                                (student.name || 'Student')}
                            </h4>
                            {student.email && (
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {scheduledLessonsCount === 0
                                ? "Awaiting first lesson"
                                : `${scheduledLessonsCount} scheduled lesson${scheduledLessonsCount !== 1 ? 's' : ''}`}
                            </p>
                            {student.courseName && (
                              <p className="text-xs text-muted-foreground">
                                Course: {student.courseName}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() =>
                                student.latestRequestId
                                  ? openLessonFromRequest({ id: student.latestRequestId, student })
                                  : openLessonModal(student)
                              }
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule lesson
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

          </div>
        </div>

        <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Student Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Enter your student account password to continue.</p>
              <input
                type="password"
                className="w-full border rounded-md px-3 py-2"
                placeholder="••••••••"
                value={switchPassword}
                onChange={(e) => setSwitchPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSwitchOpen(false)}>Cancel</Button>
              <Button variant="accent" onClick={handleConfirmSwitchToStudent} disabled={switchLoading || !switchPassword}>
                {switchLoading ? "Verifying..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule a lesson</DialogTitle>
              {lessonStudent && (
                <p className="text-sm text-muted-foreground">
                  {lessonStudent.firstName || lessonStudent.first_name || ""}{" "}
                  {lessonStudent.lastName || lessonStudent.last_name || ""}
                </p>
              )}
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-subject">Subject or focus</Label>
                <Input
                  id="lesson-subject"
                  placeholder="e.g. Grade 11 Trigonometry"
                  value={lessonForm.subject}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-date">Date</Label>
                  <Input
                    id="lesson-date"
                    type="date"
                    value={lessonForm.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setLessonForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-time">Time</Label>
                  <Input
                    id="lesson-time"
                    type="time"
                    value={lessonForm.time}
                    onChange={(e) => setLessonForm((prev) => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    min={30}
                    step={15}
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm((prev) => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-type">Lesson type</Label>
                  <Select
                    value={lessonForm.type}
                    onValueChange={(value) => setLessonForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="lesson-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in_person">In person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-notes">Notes (optional)</Label>
                <Textarea
                  id="lesson-notes"
                  placeholder="Add meeting link, location, prep work, etc."
                  rows={3}
                  value={lessonForm.notes}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLessonModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleScheduleLesson} disabled={lessonSubmitting}>
                {lessonSubmitting ? "Scheduling..." : "Schedule lesson"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TutorDashboard; 