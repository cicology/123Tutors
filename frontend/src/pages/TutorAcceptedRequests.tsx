import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, ArrowLeft, User, BookOpen, LogOut, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TutorAcceptedRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showSetLessonModal, setShowSetLessonModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [lessonDate, setLessonDate] = useState("");
  const [lessonTime, setLessonTime] = useState("");
  const [lessonDuration, setLessonDuration] = useState("60");
  const [lessonType, setLessonType] = useState("online");
  const [settingLesson, setSettingLesson] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTutorRequests();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load accepted requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSetLesson = async () => {
    if (!selectedRequest || !lessonDate || !lessonTime) {
      toast.error("Please select a date and time for the lesson");
      return;
    }

    setSettingLesson(true);
    try {
      // Combine date and time into ISO string
      const scheduledAt = new Date(`${lessonDate}T${lessonTime}`);
      
      // Validate the date is in the future
      if (scheduledAt <= new Date()) {
        toast.error("Please select a future date and time");
        setSettingLesson(false);
        return;
      }

      const response = await apiService.createLesson({
        studentId: selectedRequest.studentId,
        courseId: selectedRequest.courseId,
        subject: selectedRequest.course?.subject || selectedRequest.course?.name || "Lesson",
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(lessonDuration),
        type: lessonType,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Lesson set successfully");
      setShowSetLessonModal(false);
      setSelectedRequest(null);
      setLessonDate("");
      setLessonTime("");
      setLessonDuration("60");
      setLessonType("online");
    } catch (error) {
      console.error("Error setting lesson:", error);
      toast.error("Failed to set lesson");
    } finally {
      setSettingLesson(false);
    }
  };

  const openSetLessonModal = (request: any) => {
    setSelectedRequest(request);
    setShowSetLessonModal(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setLessonDate(tomorrow.toISOString().split('T')[0]);
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

  const acceptedRequests = requests.filter(r => r.status === 'accepted');

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
                  Dashboard
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Check className="h-8 w-8 text-green-600" />
            Accepted Requests
          </h1>
          <p className="text-muted-foreground">
            Set additional lessons for accepted course requests. Lessons are automatically generated when requests are accepted.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : acceptedRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Check className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Accepted Requests</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any accepted course requests yet.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/tutor-dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedRequests.map((request) => (
              <Card key={request.id} className="border-2 border-green-200 hover:border-green-300 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-accent" />
                        <CardTitle className="text-base line-clamp-2">
                          {request.course?.name || 'Course Request'}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3" />
                        {request.student?.firstName} {request.student?.lastName}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-600 ml-2 shrink-0">
                      Accepted
                    </Badge>
                  </div>
                  {request.student?.email && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {request.student.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted on {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="accent"
                    size="default"
                    onClick={() => openSetLessonModal(request)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Set Lesson
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Set Lesson Modal */}
      <Dialog open={showSetLessonModal} onOpenChange={setShowSetLessonModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Lesson</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">
                  Course: {selectedRequest.course?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Student: {selectedRequest.student?.firstName} {selectedRequest.student?.lastName}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonDate">Date</Label>
                  <Input
                    id="lessonDate"
                    type="date"
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonTime">Time</Label>
                  <Input
                    id="lessonTime"
                    type="time"
                    value={lessonTime}
                    onChange={(e) => setLessonTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                  <Select value={lessonDuration} onValueChange={setLessonDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonType">Lesson Type</Label>
                  <Select value={lessonType} onValueChange={setLessonType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSetLessonModal(false);
              setSelectedRequest(null);
              setLessonDate("");
              setLessonTime("");
              setLessonDuration("60");
              setLessonType("online");
            }}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleSetLesson}
              disabled={settingLesson || !lessonDate || !lessonTime}
            >
              {settingLesson ? "Setting..." : "Set Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorAcceptedRequests;

