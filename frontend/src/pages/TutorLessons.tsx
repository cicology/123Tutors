import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, ArrowLeft, Grid3x3, List } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameMonth, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TutorLessons = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [processingCompletion, setProcessingCompletion] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({
    studentId: "",
    subject: "",
    time: "",
    duration: "60",
    type: "online",
    notes: "",
    hourlyRate: "",
    totalAmount: "",
  });
  const [schedulingLesson, setSchedulingLesson] = useState(false);

  useEffect(() => {
    fetchLessons();
    fetchStudents();
  }, []);

  const handleMarkComplete = async (lessonId: string) => {
    setProcessingCompletion(lessonId);
    try {
      const response = await apiService.updateLesson(lessonId, { status: "completed" });
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Lesson marked complete. Student will be notified.");
      fetchLessons();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Failed to mark lesson complete");
    } finally {
      setProcessingCompletion(null);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await apiService.getLessons();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setLessons(response.data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
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
        request.status === "accepted" || request.status === "ACCEPTED"
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
            });
          }
        }
      });
      
      const studentsList = Array.from(studentMap.values());
      setStudents(studentsList);
      
      if (studentsList.length > 0) {
        setScheduleForm(prev => ({
          ...prev,
          studentId: prev.studentId || studentsList[0].id,
        }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleScheduleLesson = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!scheduleForm.studentId) {
      toast.error("Select a student");
      return;
    }
    if (!scheduleForm.subject.trim()) {
      toast.error("Enter a subject");
      return;
    }
    if (!scheduleForm.time) {
      toast.error("Select a time");
      return;
    }

    const scheduledDate = format(selectedDate, "yyyy-MM-dd");
    const scheduledAt = `${scheduledDate}T${scheduleForm.time}`;

    setSchedulingLesson(true);
    try {
      const payload: any = {
        studentId: scheduleForm.studentId,
        subject: scheduleForm.subject.trim(),
        scheduledAt,
        duration: Number(scheduleForm.duration) || 60,
        type: scheduleForm.type,
        notes: scheduleForm.notes?.trim() || undefined,
      };

      if (scheduleForm.hourlyRate) {
        payload.hourlyRate = Number(scheduleForm.hourlyRate);
      }
      if (scheduleForm.totalAmount) {
        payload.totalAmount = Number(scheduleForm.totalAmount);
      }

      const response = await apiService.createLesson(payload);
      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Lesson scheduled. The student has been notified.");
      setScheduleForm((prev) => ({
        ...prev,
        subject: "",
        time: "",
        duration: "60",
        notes: "",
        hourlyRate: "",
        totalAmount: "",
      }));
      fetchLessons();
    } catch (error) {
      console.error("Error scheduling lesson:", error);
      toast.error("Failed to schedule lesson");
    } finally {
      setSchedulingLesson(false);
    }
  };

  const handleStatusChange = async (lessonId: string, status: string) => {
    try {
      const response = await apiService.updateLesson(lessonId, { status });
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Lesson updated successfully");
      fetchLessons();
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("Failed to update lesson");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const upcomingLessons = lessons.filter(
    (lesson) => lesson.status === "scheduled" && new Date(lesson.scheduledAt) > new Date()
  );
  const pastLessons = lessons.filter(
    (lesson) => lesson.status !== "scheduled" || new Date(lesson.scheduledAt) <= new Date()
  );

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
                <Link to="/tutor-dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scheduled Lessons</h1>
            <p className="text-muted-foreground">View and manage your tutoring sessions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-64 mb-4" />
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "calendar" ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isSameDay(selectedDate, new Date()) 
                      ? "Today's Lessons" 
                      : `Lessons for ${format(selectedDate, "MMMM dd, yyyy")}`}
                  </CardTitle>
                  <CardDescription>
                    {lessons.filter(lesson => {
                      const lessonDate = new Date(lesson.scheduledAt);
                      return isSameDay(lessonDate, selectedDate);
                    }).length === 0 
                      ? "Click on a date in the calendar to view lessons"
                      : `${lessons.filter(lesson => {
                          const lessonDate = new Date(lesson.scheduledAt);
                          return isSameDay(lessonDate, selectedDate);
                        }).length} lesson(s) scheduled`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lessons
                      .filter(lesson => {
                        const lessonDate = new Date(lesson.scheduledAt);
                        return isSameDay(lessonDate, selectedDate);
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.scheduledAt);
                        const dateB = new Date(b.scheduledAt);
                        return dateA.getTime() - dateB.getTime();
                      })
                      .map((lesson) => {
                        const lessonDate = new Date(lesson.scheduledAt);
                        const isCompleted = lesson.status === 'completed';

                        return (
                          <Card key={lesson.id} className="border-l-4 border-l-accent">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold">
                                      {lesson.student?.firstName} {lesson.student?.lastName}
                                    </h3>
                                    {getStatusBadge(lesson.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {lesson.subject} {lesson.course && `• ${lesson.course.name}`}
                                  </p>
                                  {lesson.request && (
                                    <div className="mb-2 p-2 bg-muted/50 rounded-md text-xs">
                                      <p className="font-medium mb-1">Booking Details:</p>
                                      {lesson.request.lessonCount && (
                                        <p className="text-muted-foreground">
                                          {lesson.request.lessonCount} lesson{lesson.request.lessonCount !== 1 ? 's' : ''} • {lesson.request.lessonDuration || lesson.duration} min each
                                        </p>
                                      )}
                                      {lesson.request.totalPrice && (
                                        <p className="text-muted-foreground">
                                          Total: R{Number(lesson.request.totalPrice).toFixed(2)}
                                        </p>
                                      )}
                                      {lesson.request.preferredSchedule && (
                                        <p className="text-muted-foreground mt-1">
                                          Preferred: {(() => {
                                            try {
                                              const schedule = JSON.parse(lesson.request.preferredSchedule);
                                              if (Array.isArray(schedule.preferredSlots)) {
                                                return schedule.preferredSlots.map((slot: any) => 
                                                  `${slot.day} ${slot.start}-${slot.end}`
                                                ).join(', ');
                                              }
                                            } catch (e) {
                                              return lesson.request.preferredSchedule;
                                            }
                                          })()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {format(lessonDate, "HH:mm")} ({lesson.duration} min)
                                    </div>
                                    <Badge variant="outline">{lesson.type}</Badge>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {isSessionStarted && (
                                    <div className="text-sm font-mono font-semibold text-primary">
                                      {timerDisplay}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Completion */}
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                {!isCompleted ? (
                                  <Button
                                    size="sm"
                                    variant="accent"
                                    className="w-full"
                                    onClick={() => handleMarkComplete(lesson.id)}
                                    disabled={processingCompletion === lesson.id}
                                  >
                                    {processingCompletion === lesson.id ? "Marking..." : "Mark complete"}
                                  </Button>
                                ) : (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 w-full justify-center py-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Session Completed
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    {lessons.filter(lesson => {
                      const lessonDate = new Date(lesson.scheduledAt);
                      return isSameDay(lessonDate, selectedDate);
                    }).length === 0 && (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No lessons scheduled for {format(selectedDate, "MMMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Click on another date in the calendar to view lessons
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      hasLessons: lessons.map(lesson => new Date(lesson.scheduledAt))
                    }}
                    modifiersClassNames={{
                      hasLessons: "bg-accent/20 font-semibold text-accent-foreground"
                    }}
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full bg-accent/20"></div>
                      <span>Has lessons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule a lesson</CardTitle>
                  <CardDescription>Select a date on the calendar, then add the details below</CardDescription>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : students.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No students available yet. Accept a tutor request to start scheduling lessons.
                    </p>
                  ) : (
                    <form className="space-y-4" onSubmit={handleScheduleLesson}>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student</Label>
                        <select
                          id="studentId"
                          className="w-full border rounded-md px-3 py-2"
                          value={scheduleForm.studentId}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, studentId: e.target.value }))}
                        >
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.firstName || student.first_name || "Student"} {student.lastName || student.last_name || ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Algebra coaching"
                          value={scheduleForm.subject}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={scheduleForm.time}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="15"
                            step="15"
                            value={scheduleForm.duration}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly rate (optional)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="R per hour"
                            value={scheduleForm.hourlyRate}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="totalAmount">Total amount (optional)</Label>
                          <Input
                            id="totalAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="R per session"
                            value={scheduleForm.totalAmount}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          rows={3}
                          placeholder="Share any context for the student"
                          value={scheduleForm.notes}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Scheduled for <span className="font-medium">{format(selectedDate, "MMMM dd, yyyy")}</span>
                      </p>

                      <Button type="submit" className="w-full" disabled={schedulingLesson}>
                        {schedulingLesson ? "Scheduling..." : "Schedule lesson"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Upcoming Lessons */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>
              {upcomingLessons.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming lessons</h3>
                    <p className="text-sm text-muted-foreground">
                      Scheduled lessons will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingLessons.map((lesson) => {
                    const isCompleted = lesson.status === 'completed';
                    return (
                      <Card key={lesson.id} className="flex flex-col h-full">
                        <CardContent className="pt-6 flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold">
                                  {lesson.student?.firstName} {lesson.student?.lastName}
                                </h3>
                                {getStatusBadge(lesson.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {lesson.subject} {lesson.course && `• ${lesson.course.name}`}
                              </p>
                              {lesson.request && (
                                <div className="mb-2 p-2 bg-muted/50 rounded-md text-xs">
                                  <p className="font-medium mb-1">Booking Details:</p>
                                  {lesson.request.lessonCount && (
                                    <p className="text-muted-foreground">
                                      {lesson.request.lessonCount} lesson{lesson.request.lessonCount !== 1 ? 's' : ''} • {lesson.request.lessonDuration || lesson.duration} min each
                                    </p>
                                  )}
                                  {lesson.request.totalPrice && (
                                    <p className="text-muted-foreground">
                                      Total: R{Number(lesson.request.totalPrice).toFixed(2)}
                                    </p>
                                  )}
                                  {lesson.request.preferredSchedule && (
                                    <p className="text-muted-foreground mt-1">
                                      Preferred: {(() => {
                                        try {
                                          const schedule = JSON.parse(lesson.request.preferredSchedule);
                                          if (Array.isArray(schedule.preferredSlots)) {
                                            return schedule.preferredSlots.map((slot: any) => 
                                              `${slot.day} ${slot.start}-${slot.end}`
                                            ).join(', ');
                                          }
                                        } catch (e) {
                                          return lesson.request.preferredSchedule;
                                        }
                                      })()}
                                    </p>
                                  )}
                                </div>
                              )}
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4" />
                                  {format(new Date(lesson.scheduledAt), "MMM dd, yyyy")}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(lesson.scheduledAt), "HH:mm")} • {lesson.duration} min
                                </div>
                                <Badge variant="outline" className="w-fit">{lesson.type}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Completion */}
                          <div className="flex gap-2 mt-auto pt-3 border-t">
                            {!isCompleted ? (
                              <Button
                                size="sm"
                                variant="accent"
                                className="flex-1"
                                onClick={() => handleMarkComplete(lesson.id)}
                                disabled={processingCompletion === lesson.id}
                              >
                                {processingCompletion === lesson.id ? "Marking..." : "Mark complete"}
                              </Button>
                            ) : (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 w-full justify-center py-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Session Completed
                                {lesson.actualDuration && (
                                  <span className="ml-2">
                                    ({Math.floor(lesson.actualDuration / 60)}h {lesson.actualDuration % 60}m)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Lessons */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Past Lessons</h2>
              {pastLessons.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No past lessons yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastLessons.map((lesson) => (
                    <Card key={lesson.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {lesson.student?.firstName} {lesson.student?.lastName}
                              </h3>
                              {getStatusBadge(lesson.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {lesson.subject}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {format(new Date(lesson.scheduledAt), "MMM dd, yyyy")}
                              </div>
                              {lesson.completedAt && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  Completed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TutorLessons;

