import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Star, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const FindTutor = () => {
  const navigate = useNavigate();
  const [hasBursary, setHasBursary] = useState(false);
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    subject: "",
    learningGoals: "",
    schedule: "",
    bursaryProvider: "",
    bursaryContact: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const southAfricanCities = [
    "Johannesburg",
    "Cape Town",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Polokwane",
    "Nelspruit",
    "Kimberley",
    "Rustenburg",
    "Pietermaritzburg",
    "Stellenbosch",
    "Potchefstroom",
    "Welkom",
    "Other"
  ];

  const gradeLevels = [
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "First Year",
    "Second Year",
    "Final Year"
  ];

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Validate password in real-time
    if (id === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      toast.error("Please fix password validation errors");
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      // Prepare student registration data
      const studentData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: location === "Other" ? otherLocation : location,
        level: level,
        subject: formData.subject,
        learningGoals: formData.learningGoals,
        hasBursary: hasBursary,
        bursaryProvider: hasBursary ? formData.bursaryProvider : undefined,
        bursaryContact: hasBursary ? formData.bursaryContact : undefined,
      };

      // Register the student
      const registerResponse = await apiService.registerStudent(studentData);
      
      if (registerResponse.error) {
        toast.error(registerResponse.error);
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Logging you in...");

      // Auto-login after registration
      const loginResponse = await apiService.login(formData.email, formData.password);
      
      if (loginResponse.error) {
        toast.error("Registration successful but login failed. Please sign in manually.");
        navigate("/student-signin");
        return;
      }

      // Redirect to student dashboard
      toast.success("Welcome! Redirecting to your dashboard...");
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pendingRaw = localStorage.getItem("pendingBooking");
    if (!pendingRaw) return;
    try {
      const pending = JSON.parse(pendingRaw);
      setPendingBooking(pending);
      if (pending.tutorId) {
        apiService
          .getTutor(pending.tutorId)
          .then((response) => {
            if (!response.error && response.data) {
              setSelectedTutor(response.data);
              if (pending.courseId) {
                setSelectedCourseId(pending.courseId);
              }
            }
          })
          .catch(() => {});
      }
    } catch (error) {
      console.error("Invalid pending booking", error);
      localStorage.removeItem("pendingBooking");
    }
  }, []);

  useEffect(() => {
    if (selectedTutor && !selectedCourseId && selectedTutor.courses?.length > 0) {
      setSelectedCourseId(selectedTutor.courses[0].id);
    }
  }, [selectedTutor, selectedCourseId]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
         <Link to="/" className="text-2xl font-bold">
              <span className="text-gradient">123tutors</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Find Your Perfect Tutor.{" "}
            <span className="text-gradient">Start Learning Today.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Get matched with qualified tutors who understand your learning needs and goals.
          </p>
        </div>

        {selectedTutor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Your requested tutor</CardTitle>
              <CardDescription>You are requesting {selectedTutor.firstName} {selectedTutor.lastName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTutor.avatar ?? selectedTutor.photoUrl ?? "/placeholder.svg"}
                  alt={`${selectedTutor.firstName} ${selectedTutor.lastName}`}
                  className="h-16 w-16 rounded-lg object-cover border"
                />
                <div>
                  <p className="text-lg font-semibold">{selectedTutor.firstName} {selectedTutor.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedTutor.experience || "Experienced educator"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Courses they offer</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTutor.courses?.map((course: any) => (
                    <Button
                      key={course.id}
                      variant={course.id === selectedCourseId ? "accent" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setFormData((prev) => ({ ...prev, subject: course.subject || course.name || prev.subject }));
                      }}
                    >
                      {course.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-accent/20">
            <CardHeader>
              <Search className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Easy Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We'll find the perfect tutor based on your requirements
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Users className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Expert Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All tutors are verified and highly qualified
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Star className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Proven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join thousands of students achieving their goals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Request Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Request a Tutor</CardTitle>
            <CardDescription>
              Tell us about your learning needs and we'll match you with the perfect tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a secure password" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={passwordErrors.length > 0 ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.length > 0 && (
                    <div className="text-sm text-destructive space-y-1">
                      <p className="font-medium">Password must meet the following requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {passwordErrors.length === 0 && formData.password.length > 0 && (
                    <p className="text-sm text-green-600">✓ Password meets all requirements</p>
                  )}
                  {formData.password.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Jane" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Smith" 
                      value={formData.lastName}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+27 12 345 6789" 
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              {/* Learning Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Learning Requirements</h3>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Needed</Label>
                  <Input 
                    id="subject" 
                    placeholder="e.g., Mathematics, Physics, English" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level/Grade</Label>
                    <Select value={level} onValueChange={setLevel} required>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select grade/level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredLocation">Preferred Location</Label>
                    <Select value={location} onValueChange={setLocation} required>
                      <SelectTrigger id="preferredLocation">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {southAfricanCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {location === "Other" && (
                      <Input
                        id="otherLocation"
                        placeholder="Please specify location"
                        value={otherLocation}
                        onChange={(e) => setOtherLocation(e.target.value)}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="learningGoals">Learning Goals</Label>
                  <Textarea 
                    id="learningGoals" 
                    placeholder="Describe what you want to achieve (e.g., improve grades, exam preparation, understanding specific topics)"
                    rows={4}
                    value={formData.learningGoals}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Preferred Schedule (Optional)</Label>
                  <Textarea 
                    id="schedule" 
                    placeholder="Let us know your availability (e.g., weekday evenings, Saturday mornings)"
                    rows={3}
                    value={formData.schedule}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Bursary Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bursary Information</h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="hasBursary" 
                    checked={hasBursary}
                    onCheckedChange={setHasBursary}
                  />
                  <Label htmlFor="hasBursary" className="cursor-pointer">
                    I have a bursary
                  </Label>
                </div>

                {hasBursary && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="bursaryProvider">Bursary Provider/Organization</Label>
                      <Input 
                        id="bursaryProvider" 
                        placeholder="e.g., Feenix Trust, ISFAP, Allan Gray Orbis Foundation"
                        value={formData.bursaryProvider}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bursaryContact">Bursary Email or Phone Number (Optional)</Label>
                      <Input 
                        id="bursaryContact" 
                        placeholder="e.g., contact@bursary.org or +27 12 345 6789"
                        value={formData.bursaryContact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" size="lg" variant="accent" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Find My Tutor"}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <Link to="/student-signin" className="text-accent hover:underline">
                    Sign in as student
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FindTutor;

