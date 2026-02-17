import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MessageCircle, Mail, Phone, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const TutorStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Get students from accepted requests instead of non-existent /students endpoint
      const requestsResponse = await apiService.getTutorRequests();
      
      if (requestsResponse.error) {
        console.error("Error fetching requests:", requestsResponse.error);
        setStudents([]);
        setLoading(false);
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
              requestCreatedAt: request.createdAt,
            });
          }
        }
      });
      
      const studentsList = Array.from(studentMap.values());
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Students</h1>
          <p className="text-muted-foreground">View all students you're currently tutoring</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students yet</h3>
              <p className="text-sm text-muted-foreground">
                Students will appear here once they book lessons with you
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {getInitials(student.firstName, student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex flex-col gap-2 mt-2">
                        {student.level && (
                          <Badge variant="secondary" className="w-fit">
                            {student.level}
                          </Badge>
                        )}
                        {student.subject && (
                          <p className="text-sm text-muted-foreground">
                            {student.subject}
                          </p>
                        )}
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {student.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link to={`/tutor-chats?studentId=${student.id}`}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TutorStudents;

