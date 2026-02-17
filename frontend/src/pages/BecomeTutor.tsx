import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, BookOpen, DollarSign, Clock, Upload, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const BecomeTutor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "", 
    email: "",
    password: "",
    phone: "",
    subjects: "",
    qualifications: "",
    experience: "",
    location: "",
    cv: null as File | null,
  });
  const [otherLocation, setOtherLocation] = useState("");
  const [isExistingAccount, setIsExistingAccount] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const hasToken = !!localStorage.getItem("access_token");
    if (!hasToken) {
      return;
    }

    setIsExistingAccount(true);
    setProfileLoading(true);

    (async () => {
      try {
        const response = await apiService.getCurrentUser();
        const profile = response?.data as any;
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            email: profile.email || prev.email,
          }));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Unable to load your profile details.");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

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
    const { id, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [id]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
      // Validate password in real-time
      if (id === "password" && !isExistingAccount) {
        const errors = validatePassword(value);
        setPasswordErrors(errors);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password for new accounts
    if (!isExistingAccount) {
      const errors = validatePassword(formData.password);
      if (errors.length > 0) {
        setPasswordErrors(errors);
        toast.error("Please fix password validation errors");
        return;
      }
    }
    
    try {
      const locationValue = formData.location === "Other" ? otherLocation : formData.location;

      if (isExistingAccount) {
        const response = await apiService.applyAsTutor({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          location: locationValue,
          subjects: formData.subjects,
          qualifications: formData.qualifications,
          experience: formData.experience,
        });

        if (response.error) {
          toast.error(response.error);
          return;
        }

        toast.success("Thanks! Your tutor application is in review. We'll email you when it's approved.");
        navigate("/tutor-dashboard");
        return;
      }

      const response = await apiService.registerTutor({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: locationValue,
        subjects: formData.subjects,
        qualifications: formData.qualifications,
        experience: formData.experience,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Tutor application submitted successfully! Awaiting approval.");
      // Login the user after registration
      const loginResponse = await apiService.loginTutor(formData.email, formData.password);
      if (loginResponse.data) {
        navigate("/tutor-dashboard");
      } else {
        navigate("/tutor-signin");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      <style>{`
        input[type="file"]#cv {
          width: 100% !important;
          min-width: 100% !important;
          padding: 0.5rem !important;
          overflow: visible !important;
          height: auto !important;
        }
        input[type="file"]#cv::file-selector-button {
          height: 2.75rem !important;
          min-width: 160px !important;
          padding: 0 1.5rem !important;
          margin-right: 1rem !important;
          border-radius: 0.5rem !important;
          background: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          border: none !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          display: inline-block !important;
        }
        /* Override shadcn Input default file styling */
        input[type="file"]#cv.file\\:bg-transparent {
          background: transparent !important;
        }
        input[type="file"]#cv::file-selector-button {
          background: hsl(var(--accent)) !important;
        }
      `}</style>
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
            Share Your Knowledge. <span className="text-gradient">Transform Lives.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Join South Africa's premier tutoring platform and earn while helping students achieve their academic goals.
          </p>
        </div>

        {isExistingAccount && (
          <div className="max-w-2xl mx-auto mb-8 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-foreground">
            You're already signed in as {formData.email || "a student"}. We'll reuse your account email and password—just share your tutoring details below.
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-accent/20">
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Expert Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build your reputation as a trusted educator in your field
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <DollarSign className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Competitive Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set your own rates and earn what you deserve
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Clock className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Flexible Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose your hours and work on your own terms
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Ongoing Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access resources and support to help you succeed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Tutor Registration</CardTitle>
            <CardDescription>
              Fill in your details to start your journey as a tutor with 123tutors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Account Information */}
              {!isExistingAccount && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tutor@example.com"
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
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
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

              {/* Teaching Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Teaching Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects You Teach</Label>
                  <Input
                    id="subjects"
                    placeholder="e.g., Mathematics, Physics"
                    value={formData.subjects}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="List your degrees, certifications, and relevant qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Teaching Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe your teaching experience and approach"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                {/* CV Upload */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="cv">Upload CV/Resume</Label>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 w-full overflow-visible">
                      <Input
                        id="cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        className="w-full cursor-pointer file:w-auto file:h-12 file:border-0 file:bg-accent file:text-accent-foreground file:px-4 file:py-2 file:rounded-md file:mr-3 text-sm overflow-visible"
                        style={{
                          padding: "0.5rem",
                          overflow: "visible",
                          minWidth: "100%",
                        }}
                      />
                    </div>
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your CV in PDF, DOC, or DOCX format (max 5MB)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    required
                  >
                    <SelectTrigger id="location">
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
                  {formData.location === "Other" && (
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

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" size="lg" variant="accent" className="w-full" disabled={profileLoading}>
                  {profileLoading ? "Loading profile..." : "Submit Application"}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <Link to="/tutor-signin" className="text-accent hover:underline">
                    Sign in as tutor
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

export default BecomeTutor;
