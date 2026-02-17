import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiService } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  Search,
  Star,
  Users,
} from "lucide-react";

type TutorCourse = {
  id: string;
  name: string;
  subject?: string | null;
  level?: string | null;
  lessonsOffered?: number[];
  description?: string | null;
};

type MarketplaceTutor = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  rating?: number;
  reviews?: number;
  hourlyRate?: number;
  experienceYears?: number;
  location?: string;
  mode?: string[];
  levelFocus?: string[];
  subjects?: string[];
  courses?: TutorCourse[];
  bio?: string;
  highlights?: string[];
  availability?: string;
  profilePicture?: string | null;
};

type HydratedTutor = MarketplaceTutor & {
  displayName: string;
  avatar: string;
  hourlyRate: number;
  subjects: string[];
  levelFocus: string[];
  mode: string[];
  courses: TutorCourse[];
  highlights: string[];
  availability: string;
};

type ScheduleSlot = {
  id: string;
  day: string;
  start: string;
  end: string;
};

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createSlotId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const fallbackTutors: MarketplaceTutor[] = [
  {
    id: "seed-lerato",
    name: "Lerato Mokoena",
    location: "Cape Town",
    rating: 4.9,
    reviews: 42,
    hourlyRate: 320,
    mode: ["Online", "In-person"],
    levelFocus: ["Grade 10-12", "First Year"],
    subjects: ["Mathematics", "Physics", "AP Maths"],
    courses: [
      {
        id: "seed-ap-maths",
        name: "Advanced Mathematics (Grade 12)",
        level: "Grade 12",
        lessonsOffered: [1, 4, 8],
        description: "Exam readiness programme covering calculus, complex numbers, and probability.",
      },
      {
        id: "seed-physics",
        name: "Physics: Mechanics Mastery",
        level: "Grade 11-12",
        lessonsOffered: [1, 6, 10],
        description: "Problem-solving strategies for kinematics, forces, and energy.",
      },
        {
          id: "seed-geography",
          name: "Geography Field Methods",
          level: "Grade 10-12",
          lessonsOffered: [2, 5, 8],
          description: "Map reading, eco-systems, and environmental case studies for top matric results.",
        },
    ],
    bio: "Engineering graduate helping matric learners unlock top results with data-driven study plans.",
    highlights: ["98% improve two grade bands", "UCT engineering graduate"],
    availability: "Mon • Wed • Thu | 16:00 - 20:00",
  },
  {
    id: "seed-thabo",
    name: "Thabo Khumalo",
    location: "Johannesburg",
    rating: 4.8,
    reviews: 37,
    hourlyRate: 280,
    mode: ["Online"],
    levelFocus: ["High School", "University"],
    subjects: ["Accounting", "Economics", "Business Studies"],
    courses: [
      {
        id: "seed-accounting",
        name: "Accounting Exam Accelerator",
        level: "Grade 11-12",
        lessonsOffered: [1, 5, 8],
        description: "Intensive ledger mastery and exam technique bootcamp.",
      },
      {
        id: "seed-micro",
        name: "Microeconomics Fundamentals",
        level: "First Year",
        lessonsOffered: [1, 4, 6],
        description: "Build intuition for demand, supply, and market structures.",
      },
    ],
    bio: "Chartered accountant in training simplifying complex finance concepts with real-world case studies.",
    highlights: ["SAICA trainee mentor", "Custom study templates"],
    availability: "Tue • Thu • Sat | 14:00 - 19:00",
  },
  {
    id: "seed-asanda",
    name: "Asanda Ndlovu",
    location: "Stellenbosch",
    rating: 5,
    reviews: 29,
    hourlyRate: 350,
    mode: ["Online", "In-person"],
    levelFocus: ["University"],
    subjects: ["Computer Science", "Data Structures", "Python"],
    courses: [
      {
        id: "seed-cs101",
        name: "Intro to Programming (Python)",
        level: "First Year",
        lessonsOffered: [2, 6, 12],
        description: "Studio-style lessons with live coding and project feedback.",
      },
      {
        id: "seed-dsa",
        name: "Data Structures & Algorithms",
        level: "Second Year",
        lessonsOffered: [1, 4, 8],
        description: "Master linked lists, trees, and complexity analysis with interview-style practice.",
      },
    ],
    bio: "Software engineer at a fintech startup. Passionate about building confident problem-solvers.",
    highlights: ["Google Women Techmakers scholar", "Project-based learning"],
    availability: "Mon • Wed • Fri | 18:00 - 21:30",
  },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const {
    data: apiTutors,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MarketplaceTutor[], Error>({
    queryKey: ["marketplace-tutors"],
    queryFn: async () => {
      try {
        const response = await apiService.getMarketplaceTutors();
        if (response.error) {
          console.error("[Marketplace] API error:", response.error);
          throw new Error(response.error);
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data && Array.isArray((response.data as any).data)) {
          return (response.data as any).data;
        }
        return [];
      } catch (err) {
        console.error("[Marketplace] Failed to fetch tutors:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load tutors";
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network error")) {
          toast.error("Cannot connect to backend server. Please make sure the backend is running on port 3001.");
        } else {
          toast.error(`Error loading tutors: ${errorMessage}`);
        }
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([220, 360]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<HydratedTutor | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("custom");
  const [lessonCount, setLessonCount] = useState(4);
  const [lessonDuration, setLessonDuration] = useState(60);
  const [preferredSlots, setPreferredSlots] = useState<ScheduleSlot[]>([
    { id: createSlotId(), day: "Tuesday", start: "17:00", end: "18:30" },
  ]);
  const [notes, setNotes] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const tutors = useMemo<HydratedTutor[]>(() => {
    const source = apiTutors && apiTutors.length > 0 ? apiTutors : fallbackTutors;

    return source.map((tutor) => {
      const displayName =
        (tutor.name || `${tutor.firstName || ""} ${tutor.lastName || ""}`.trim()) || "Tutor";
      const avatar = tutor.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
      const hourlyRate = Math.max(200, Math.round(tutor.hourlyRate || 300));
      const subjects = tutor.subjects && tutor.subjects.length ? tutor.subjects : ["General support"];
      const levelFocus = tutor.levelFocus && tutor.levelFocus.length ? tutor.levelFocus : ["All levels"];
      const mode = tutor.mode && tutor.mode.length ? tutor.mode : ["Online"];
      const courses =
        tutor.courses && tutor.courses.length
          ? tutor.courses.map((course) => ({
              ...course,
              lessonsOffered:
                course.lessonsOffered && course.lessonsOffered.length > 0
                  ? course.lessonsOffered
                  : [1, 4, 8, 12],
            }))
          : [];
      const highlights = tutor.highlights && tutor.highlights.length ? tutor.highlights : [];

      return {
        ...tutor,
        displayName: displayName.trim(),
        avatar,
        hourlyRate,
        subjects,
        levelFocus,
        mode,
        courses,
        highlights,
        availability: tutor.availability || "Flexible availability",
      };
    });
  }, [apiTutors]);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tutors.forEach((tutor) =>
      (tutor.subjects || []).forEach((subject) => {
        if (subject && subject.trim().length > 0) {
          subjects.add(subject.trim());
        }
      }),
    );
    return Array.from(subjects).sort();
  }, [tutors]);

  const allLevels = useMemo(() => {
    const levels = new Set<string>();
    tutors.forEach((tutor) =>
      (tutor.levelFocus || []).forEach((level) => {
        if (level && level.trim().length > 0) {
          levels.add(level.trim());
        }
      }),
    );
    return Array.from(levels).sort();
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        tutor.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        tutor.courses.some((course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesSubject =
        subjectFilter === "all" || tutor.subjects.includes(subjectFilter);

      const matchesLevel =
        levelFilter === "all" || tutor.levelFocus.includes(levelFilter);

      const matchesMode =
        modeFilter === "" || tutor.mode.includes(modeFilter as "Online" | "In-person");

      const matchesLocation =
        locationFilter === "" ||
        tutor.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesPrice =
        tutor.hourlyRate >= priceRange[0] && tutor.hourlyRate <= priceRange[1];

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLevel &&
        matchesMode &&
        matchesLocation &&
        matchesPrice
      );
    });
  }, [searchTerm, subjectFilter, levelFilter, modeFilter, locationFilter, priceRange]);

  const resetBookingState = () => {
    setSelectedCourseId("custom");
    setLessonCount(4);
    setLessonDuration(60);
    setPreferredSlots([{ id: createSlotId(), day: "Tuesday", start: "17:00", end: "18:30" }]);
    setNotes("");
  };

  const openBooking = (tutor: HydratedTutor) => {
    setSelectedTutor(tutor);
    setSelectedCourseId(tutor.courses[0]?.id ?? "custom");
    setBookingOpen(true);
  };

  const updateSlot = (slotId: string, key: keyof ScheduleSlot, value: string) => {
    setPreferredSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, [key]: value } : slot)),
    );
  };

  const addSlot = () => {
    setPreferredSlots((prev) => [
      ...prev,
      {
        id: createSlotId(),
        day: "Monday",
        start: "15:00",
        end: "16:00",
      },
    ]);
  };

  const removeSlot = (slotId: string) => {
    setPreferredSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const selectedCourse = selectedTutor?.courses.find((course) => course.id === selectedCourseId);
  const lessonRate = selectedTutor ? (selectedTutor.hourlyRate / 60) * lessonDuration : 0;
  const totalPrice = lessonRate * lessonCount;

  const handleConfirmBooking = () => {
    if (!selectedTutor) {
      toast.error("Please pick a tutor to continue");
      return;
    }

    // Validate that the tutor ID is a valid UUID (not a fallback tutor)
    if (selectedTutor.id.startsWith("seed-")) {
      toast.error("This is a demo tutor. Please select a real tutor from the list to book a session.");
      return;
    }

    if (preferredSlots.length === 0) {
      toast.error("Add at least one preferred time slot");
      return;
    }

    const invalidSlot = preferredSlots.some((slot) => slot.start >= slot.end);
    if (invalidSlot) {
      toast.error("Please ensure end times are later than start times");
      return;
    }

    const bookingPayload = {
      tutorId: selectedTutor.id,
      tutorName: selectedTutor.displayName,
      courseId: selectedCourse?.id || null,
      courseName: selectedCourse?.name || null,
      lessonCount,
      lessonDuration,
      preferredSlots,
      notes,
      totalPrice,
      createdAt: new Date().toISOString(),
    };

    const isAuthenticated = !!localStorage.getItem("access_token");
    const isStudent = apiService.isStudent();
    console.log("[Marketplace] Auth check - isAuthenticated:", isAuthenticated, "isStudent:", isStudent);
    
    if (!isAuthenticated || !isStudent) {
      console.log("[Marketplace] User not authenticated as student, redirecting to sign-in");
      localStorage.setItem("pendingBooking", JSON.stringify(bookingPayload));
      toast.info("Create an account to finalise your booking.");
      navigate("/signin", {
        state: {
          redirectTo: "/student-dashboard",
          highlightTutor: selectedTutor.id,
        },
      });
      setBookingOpen(false);
      resetBookingState();
      return;
    }
    
    console.log("[Marketplace] User authenticated as student, proceeding with request creation");

    const schedulePayload = JSON.stringify({
      preferredSlots,
    });

    setBookingSubmitting(true);
    
    // Prepare request payload - only include courseId if a course is selected (not "custom")
    const requestPayload: any = {
      tutorId: selectedTutor.id,
      preferredSchedule: schedulePayload,
      lessonCount,
      lessonDuration,
      totalPrice,
    };
    
    // Only include courseId if a course is actually selected (not "custom")
    if (selectedCourse?.id && selectedCourseId !== "custom") {
      requestPayload.courseId = selectedCourse.id;
    }
    
    // Include message/notes if provided
    if (notes && notes.trim()) {
      requestPayload.message = notes.trim();
      requestPayload.notes = notes.trim();
    }
    
    apiService
      .createServiceRequest(requestPayload)
      .then((response) => {
        if (response.error) {
          console.error("[Marketplace] Error creating request:", response.error);
          toast.error(response.error || "Failed to submit booking. Please try again.");
          return;
        }
        toast.success("Booking sent! Track progress inside your dashboard.");
        navigate("/student-dashboard", { state: { highlightBooking: bookingPayload.tutorId } });
      })
      .catch((error) => {
        console.error("[Marketplace] Exception creating request:", error);
        toast.error("Failed to submit booking. Please try again.");
      })
      .finally(() => {
        setBookingSubmitting(false);
        setBookingOpen(false);
        resetBookingState();
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="px-4 py-1 rounded-full text-sm">
              Curated South African tutors
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Marketplace for{" "}
              <span className="text-gradient">on-demand tutoring</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search, compare, and book verified tutors. Filter by subject, level, learning mode,
              and availability to build the perfect learning plan.
            </p>
          </div>

          <Card className="border-border/70 bg-background/80 backdrop-blur">
            <CardContent className="p-6 grid lg:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-4">
                <Label className="text-muted-foreground text-sm">Search tutors, subjects or courses</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="E.g., Calculus, Physics, Programming..."
                    className="pl-11 h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Learning mode</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Online", "In-person"].map((mode) => (
                      <Button
                        key={mode}
                        variant={modeFilter === mode ? "accent" : "outline"}
                        onClick={() => setModeFilter(modeFilter === mode ? "" : mode)}
                        className="justify-center"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Location (optional)</Label>
                  <Input
                    value={locationFilter}
                    onChange={(event) => setLocationFilter(event.target.value)}
                    placeholder="City or suburb"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4" />
                  Refine results
                </CardTitle>
                <CardDescription>Combine filters to zero-in on your ideal tutor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any subject</SelectItem>
                      {allSubjects
                        .filter((subject) => subject && subject.trim().length > 0)
                        .map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      {allLevels
                        .filter((level) => level && level.trim().length > 0)
                        .map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Hourly Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      R{priceRange[0]} - R{priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    min={100}
                    max={400}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSubjectFilter("all");
                    setLevelFilter("all");
                    setModeFilter("");
                    setLocationFilter("");
                    setPriceRange([220, 360]);
                  }}
                >
                  Reset filters
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Showing tutors</p>
                  <h2 className="text-2xl font-semibold">
                    {filteredTutors.length} {filteredTutors.length === 1 ? "match" : "matches"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Expert educators
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Verified profiles
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Avg. 4h response
                  </Badge>
                </div>
              </div>

              {isError ? (
                <Card className="border-destructive/40 bg-destructive/5">
                  <CardContent className="py-8 text-center space-y-3">
                    <p className="font-semibold text-destructive">Unable to load tutors</p>
                    <p className="text-muted-foreground text-sm">{error?.message}</p>
                    <Button variant="outline" onClick={() => refetch()}>
                      Try again
                    </Button>
                  </CardContent>
                </Card>
              ) : isLoading ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Fetching tutors...
                  </CardContent>
                </Card>
              ) : filteredTutors.length === 0 ? (
                <Card className="border-dashed text-center py-16">
                  <CardContent className="space-y-3">
                    <p className="text-lg font-semibold">No tutors match these filters yet.</p>
                    <p className="text-muted-foreground">
                      Try removing a filter or contact us and we&apos;ll scout a tutor for you within 24h.
                    </p>
                    <Button variant="accent">Talk to support</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTutors.map((tutor) => (
                    <Card key={tutor.id} className="border-border/70 hover:border-accent transition-colors h-full flex flex-col">
                      <CardContent className="p-4 flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={tutor.avatar}
                            alt={tutor.displayName}
                            className="h-14 w-14 rounded-lg border object-cover"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{tutor.displayName}</h3>
                              <Badge variant="secondary">{tutor.location || "Remote"}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                                {tutor.rating?.toFixed(1) ?? "5.0"} ({tutor.reviews || 0})
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                {tutor.levelFocus.slice(0, 2).join(" • ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {tutor.subjects.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>

                        {tutor.courses.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs uppercase text-muted-foreground tracking-wide">Courses</p>
                            <div className="flex flex-wrap gap-2">
                              {tutor.courses.slice(0, 3).map((course) => (
                                <Badge key={course.id} variant="secondary" className="text-xs">
                                  {course.name || course.subject || "Course"}
                                  {course.level ? ` • ${course.level}` : ""}
                                </Badge>
                              ))}
                              {tutor.courses.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{tutor.courses.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {tutor.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{tutor.bio}</p>
                        )}

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            {tutor.availability}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            {tutor.mode.join(" & ")}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Hourly rate</p>
                            <p className="text-2xl font-semibold">R{tutor.hourlyRate}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => openBooking(tutor)}
                            disabled={tutor.id.startsWith("seed-")}
                            title={tutor.id.startsWith("seed-") ? "Demo tutors cannot be booked. Please select a real tutor." : ""}
                          >
                            Request Tutor
                          </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={bookingOpen} onOpenChange={(open) => {
        setBookingOpen(open);
        if (!open) {
          setSelectedTutor(null);
          resetBookingState();
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold">Book {selectedTutor?.displayName}</DialogTitle>
            <p className="text-muted-foreground">
              Choose a lesson package and share your availability. We&apos;ll send the request directly to the tutor.
            </p>
          </DialogHeader>

          {selectedTutor && (
            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
              <div className="space-y-6">
                {selectedTutor.courses.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Course (optional)</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                      {selectedTutor.courses.map((course) => {
                        const labelParts = [];
                        if (course.name) {
                          labelParts.push(course.name);
                        }
                        if (course.subject) {
                          labelParts.push(course.subject);
                        }
                        if (course.level) {
                          labelParts.push(course.level);
                        }
                        const displayLabel = labelParts.join(" • ") || "Course";
                        return (
                          <SelectItem key={course.id} value={course.id}>
                            {displayLabel}
                          </SelectItem>
                        );
                      })}
                        <SelectItem value="custom">Custom request</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedCourse && selectedCourse.description && (
                      <p className="text-xs text-muted-foreground">
                        {selectedCourse.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-secondary/10 text-sm text-muted-foreground">
                    This tutor offers bespoke services. Describe your learning goals below and they&apos;ll tailor a plan for you.
                  </div>
                )}

            <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of lessons</Label>
                    <Select value={lessonCount.toString()} onValueChange={(value) => setLessonCount(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                    {(selectedCourse?.lessonsOffered ?? [1, 4, 6, 8, 10, 12]).map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} lesson{count > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration per lesson</Label>
                    <Select
                      value={lessonDuration.toString()}
                      onValueChange={(value) => setLessonDuration(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[60, 75, 90, 120].map((duration) => (
                          <SelectItem key={duration} value={String(duration)}>
                            {duration} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      Weekly schedule preference
                    </Label>
                    <Button variant="ghost" size="sm" onClick={addSlot}>
                      Add time slot
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {preferredSlots.map((slot) => (
                      <Card key={slot.id} className="p-4 border-dashed">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="sm:flex-1">
                            <Label className="text-xs uppercase text-muted-foreground">Day</Label>
                            <Select value={slot.day} onValueChange={(value) => updateSlot(slot.id, "day", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {dayOptions.map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs uppercase text-muted-foreground">Start time</Label>
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={(event) => updateSlot(slot.id, "start", event.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs uppercase text-muted-foreground">End time</Label>
                            <Input
                              type="time"
                              value={slot.end}
                              onChange={(event) => updateSlot(slot.id, "end", event.target.value)}
                            />
                          </div>
                          {preferredSlots.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="self-start text-destructive"
                              onClick={() => removeSlot(slot.id)}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Learning goals or context</Label>
                  <Textarea
                    placeholder="Let the tutor know about upcoming exams, current grades, or preferred teaching styles."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <Card className="border-accent/40 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Booking summary</CardTitle>
                  <CardDescription>Transparent pricing before you commit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hourly rate</span>
                      <span>R{selectedTutor.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lesson duration</span>
                      <span>{lessonDuration} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons</span>
                      <span>{lessonCount}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total package</span>
                      <span>R{totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/80 border p-4 text-sm text-muted-foreground">
                    We&apos;ll confirm exact lesson times with {selectedTutor.displayName} and keep you updated via email and your dashboard.
                  </div>
                  <Button className="w-full" onClick={handleConfirmBooking} disabled={bookingSubmitting}>
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm & continue"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;

