import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Settings,
  User,
  Clock,
  TrendingUp,
  LogOut,
  Check,
  XCircle,
  AlertCircle,
  Search,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchPassword, setSwitchPassword] = useState("");
  const [switchLoading, setSwitchLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
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
  const declinedRequestsList = useMemo(
    () => requests.filter((request) => normalizeRequestStatus(request.status) === "declined"),
    [requests]
  );

  useEffect(() => {
    fetchDashboardData();
    fetchRequests();
    fetchUpcomingLessons();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getStudentDashboard();
      if (response.error) {
        if (String(response.error).toLowerCase().includes("unauthorized") ||
            String(response.error).toLowerCase().includes("forbidden")) {
          navigate("/signin");
          return;
        }
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setDashboardData(response.data);
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
      const response = await apiService.getStudentRequests();
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
      if (response.error) {
        console.error("Error fetching lessons:", response.error);
        return;
      }
      
      let allLessons: any[] = [];
      if (response.data) {
        allLessons = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        allLessons = response;
      }
      
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcoming = allLessons
        .filter((lesson: any) => {
          if (!lesson.scheduledAt) return false;
          const lessonDate = new Date(lesson.scheduledAt);
          return lessonDate >= now && 
                 lessonDate <= nextWeek && 
                 (lesson.status === 'scheduled' || lesson.status === 'SCHEDULED');
        })
        .sort((a: any, b: any) => {
          return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        });
      
      setUpcomingLessons(upcoming.slice(0, 10));
    } catch (error) {
      console.error("Error fetching upcoming lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleConfirmSwitchToTutor = async () => {
    setSwitchLoading(true);
    try {
      const resp = await apiService.login(storedEmail, switchPassword);
      if (resp.error || !resp.data?.isTutor) {
        toast.error("Incorrect tutor password. Try again or return to dashboard.");
        return;
      }
      toast.success("Switched to tutor");
      navigate("/tutor-dashboard");
    } catch (e) {
      toast.error("Failed to switch role. Try again.");
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleRoleSwitchToggle = (checked: boolean) => {
    if (!hasBothRoles) {
      toast.error("Link a tutor profile to switch roles.");
      setRoleSwitchValue(false);
      return;
    }

    if (checked) {
      setSwitchOpen(true);
    }
    setRoleSwitchValue(false);
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

  const studentData = dashboardData?.student || {};
  const firstName = studentData.firstName || studentData.first_name || '';
  const lastName = studentData.lastName || studentData.last_name || '';
  const studentName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName 
    ? firstName
    : studentData.email 
    ? studentData.email.split('@')[0]
    : "Student";
  
  const stats = dashboardData?.stats || {};
  const safeNumber = (value: any, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const sidebarLinks = [
    { label: "Find Tutors", href: "/marketplace", icon: Search },
    { label: "My Requests", href: "#", icon: BookOpen },
    { label: "Upcoming Lessons", href: "#", icon: Calendar },
    { label: "My Tutors", href: "#", icon: User },
    { label: "Settings", href: "#", icon: Settings },
  ];

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
                <Link to="/marketplace">
                  <Search className="mr-2 h-4 w-4" />
                  Find Tutors
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
                <CardDescription>Access all student features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.label}
                      variant="ghost"
                      className="w-full justify-between h-auto py-2 px-3"
                      asChild={link.href !== "#"}
                    >
                      {link.href !== "#" ? (
                        <Link to={link.href}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-accent" />
                            <span>{link.label}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-accent" />
                            <span>{link.label}</span>
                          </span>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
            {hasBothRoles && (
              <Card>
                <CardHeader>
                  <CardTitle>Switch Roles</CardTitle>
                  <CardDescription>Jump to your tutor dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">Student</span>
                    <Switch checked={roleSwitchValue} onCheckedChange={handleRoleSwitchToggle} />
                    <span className="text-sm text-muted-foreground">Tutor</span>
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
                    <Badge variant="outline" className="mb-3 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Student Portal
                    </Badge>
                    <h1 className="text-3xl font-bold">Welcome back, {studentName}!</h1>
                    <p className="text-muted-foreground mt-2">
                      Track your tutoring requests, manage lessons, and connect with your tutors.
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground">Active requests</p>
                    <p className="text-3xl font-semibold">{pendingRequestsList.length + acceptedRequestsList.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {acceptedRequestsList.length} accepted
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Account Status
                  </CardTitle>
                  <CardDescription>
                    Your student account is active and ready to use.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="default" className="px-4 py-1 text-sm">
                    ACTIVE
                  </Badge>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link to="/marketplace">Find a Tutor</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <CardDescription>Awaiting tutor response</CardDescription>
                  </div>
                  <AlertCircle className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingRequestsList.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">Accepted Requests</CardTitle>
                    <CardDescription>Ready for lessons</CardDescription>
                  </div>
                  <Check className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{acceptedRequestsList.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
                    <CardDescription>Next 7 days</CardDescription>
                  </div>
                  <Calendar className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{upcomingLessons.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">My Tutors</CardTitle>
                    <CardDescription>Active tutors</CardDescription>
                  </div>
                  <User className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{acceptedRequestsList.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Pending Requests
                    </div>
                    {pendingRequestsList.length > 0 && (
                      <Badge variant="destructive">
                        {pendingRequestsList.length} pending
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Your tutoring requests awaiting tutor response</CardDescription>
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
                      <p className="text-muted-foreground">No pending requests</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Request a tutor from the marketplace to see them here
                      </p>
                      <Button variant="accent" className="mt-4" asChild>
                        <Link to="/marketplace">Find a Tutor</Link>
                      </Button>
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
                                  {request.tutor && (
                                    <p>
                                      <strong>Tutor:</strong> {request.tutor?.firstName} {request.tutor?.lastName}
                                    </p>
                                  )}
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
                                  ) : null}
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
                    <CardDescription>These tutors have accepted your request</CardDescription>
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
                        No accepted requests yet. Tutors will appear here when they accept your request.
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
                                  {request.tutor?.firstName} {request.tutor?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.course?.name || request.serviceType || "Custom tutoring"}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">Accepted</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your tutor will schedule the first lesson soon.
                            </p>
                          </div>
                        ))}
                        {acceptedRequestsList.length > 3 && (
                          <Button variant="ghost" className="w-full">
                            View all accepted requests
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {declinedRequestsList.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Declined Requests</CardTitle>
                      <CardDescription>Requests that were declined</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {declinedRequestsList.slice(0, 3).map((request) => (
                          <div
                            key={request.id}
                            className="p-3 border rounded-lg bg-background/80 flex flex-col gap-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {request.tutor?.firstName} {request.tutor?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.course?.name || request.serviceType || "Custom tutoring"}
                                </p>
                              </div>
                              <Badge variant="destructive" className="text-xs">Declined</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <Link to="/marketplace">Find Another Tutor</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                        <p className="text-sm text-muted-foreground">
                          Lessons will appear here once your tutor schedules them
                        </p>
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
                                  {lesson.tutor?.firstName} {lesson.tutor?.lastName}
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Tips to make the most of your learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Browse the marketplace to find tutors that match your learning goals.</p>
                  <p>• Request a tutor and wait for them to accept your request.</p>
                  <p>• Once accepted, your tutor will schedule your first lesson.</p>
                  <p>• Attend lessons and track your progress.</p>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="/marketplace">Browse Tutors</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Tutor Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Enter your tutor account password to continue.</p>
              <Input
                type="password"
                placeholder="••••••••"
                value={switchPassword}
                onChange={(e) => setSwitchPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSwitchOpen(false)}>Cancel</Button>
              <Button variant="accent" onClick={handleConfirmSwitchToTutor} disabled={switchLoading || !switchPassword}>
                {switchLoading ? "Verifying..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default StudentDashboard;

