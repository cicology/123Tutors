import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, User, Bell, Shield, CreditCard, GraduationCap, Upload, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const TutorSettings = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    subjects: "",
    qualifications: "",
    experience: "",
    profilePicture: "",
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiService.getTutorProfile();
        if (response.error) {
          toast.error(response.error);
          return;
        }
        if (response.data) {
          setFormData((prev) => ({
            ...prev,
            firstName: response.data.firstName || "",
            lastName: response.data.lastName || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            location: response.data.location || "",
            subjects: response.data.subjects || "",
            qualifications: response.data.qualifications || "",
            experience: response.data.experience || "",
            profilePicture: response.data.profilePicture || "",
          }));
          if (response.data.profilePicture) {
            setProfilePicturePreview(response.data.profilePicture);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tutor profile", error);
        toast.error("Failed to load tutor profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleFieldChange = (field: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    try {
      // Convert to base64 for now (can be changed to actual file upload later)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // For now, we'll store as data URL. In production, upload to server and get URL
        setProfilePicturePreview(base64String);
        setFormData((prev) => ({ ...prev, profilePicture: base64String }));
        setUploadingPicture(false);
        toast.success("Profile picture uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setUploadingPicture(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        phone: formData.phone?.trim(),
        location: formData.location?.trim(),
        subjects: formData.subjects?.trim(),
        qualifications: formData.qualifications?.trim(),
        experience: formData.experience?.trim(),
        profilePicture: formData.profilePicture?.trim() || undefined,
      };
      const response = await apiService.updateTutorProfile(payload);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Profile updated! These details now appear on the marketplace.");
    } catch (error) {
      console.error("Failed to update tutor profile", error);
      toast.error("Unable to save changes. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/tutor-dashboard" className="text-2xl font-bold">
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tutor Settings</h1>
            <p className="text-muted-foreground">Manage your tutoring profile and preferences</p>
          </div>

          {loadingProfile && (
            <Card className="mb-8">
              <CardContent className="py-6 text-sm text-muted-foreground">
                Fetching your profile...
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details and qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profilePicturePreview || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}`} />
                      <AvatarFallback className="bg-accent/20 text-accent">
                        {formData.firstName?.[0] || ''}{formData.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loadingProfile || savingProfile || uploadingPicture}
                        className="hidden"
                      />
                      <Label htmlFor="profilePicture" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loadingProfile || savingProfile || uploadingPicture}
                          className="w-full"
                          onClick={() => document.getElementById('profilePicture')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadingPicture ? "Uploading..." : "Upload Picture"}
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max size 5MB. This will appear on the marketplace.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleFieldChange("firstName")}
                      disabled={loadingProfile || savingProfile}
                      placeholder="e.g., Lerato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleFieldChange("lastName")}
                      disabled={loadingProfile || savingProfile}
                      placeholder="e.g., Mokoena"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFieldChange("phone")}
                    disabled={loadingProfile || savingProfile}
                    placeholder="+27 12 345 6789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={handleFieldChange("location")}
                    disabled={loadingProfile || savingProfile}
                    placeholder="e.g., Cape Town"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects Taught</Label>
                  <Textarea
                    id="subjects"
                    placeholder="Mathematics, Physics, Chemistry..."
                    value={formData.subjects}
                    onChange={handleFieldChange("subjects")}
                    disabled={loadingProfile || savingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="PhD in Mathematics, Teaching Certificate..."
                    value={formData.qualifications}
                    onChange={handleFieldChange("qualifications")}
                    disabled={loadingProfile || savingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience / Bio</Label>
                  <Textarea
                    id="experience"
                    placeholder="Tell students about yourself and your teaching approach..."
                    rows={4}
                    value={formData.experience}
                    onChange={handleFieldChange("experience")}
                    disabled={loadingProfile || savingProfile}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  These details power your public marketplace profile. Keep them accurate to help students pick you.
                </p>
              </CardContent>
            </Card>

            {/* Teaching Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Teaching Preferences
                </CardTitle>
                <CardDescription>Set your teaching preferences and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (ZAR)</Label>
                  <Input id="hourlyRate" type="number" defaultValue="500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutoringMode">Tutoring Modes</Label>
                  <Select defaultValue="both">
                    <SelectTrigger>
                      <SelectValue placeholder="Select tutoring modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="inperson">In-Person Only</SelectItem>
                      <SelectItem value="both">Both Online & In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionLength">Preferred Session Length</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue placeholder="Select session length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Maximum Students</Label>
                  <Input id="maxStudents" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Textarea id="availability" placeholder="e.g., Weekday evenings, Saturday mornings..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachingStyle">Teaching Style</Label>
                  <Textarea id="teachingStyle" placeholder="Describe your teaching methodology..." />
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>Manage your payment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" defaultValue="Standard Bank" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input id="accountNumber" type="text" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchCode">Branch Code</Label>
                  <Input id="branchCode" type="text" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input id="accountHolder" defaultValue="Dr. Sarah Johnson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sessionReminders">Session Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming sessions</p>
                  </div>
                  <Switch id="sessionReminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="studentMessages">Student Messages</Label>
                    <p className="text-sm text-muted-foreground">Notifications for messages from students</p>
                  </div>
                  <Switch id="studentMessages" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newBookings">New Bookings</Label>
                    <p className="text-sm text-muted-foreground">Notifications for new session bookings</p>
                  </div>
                  <Switch id="newBookings" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentNotifications">Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notifications about payments and earnings</p>
                  </div>
                  <Switch id="paymentNotifications" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow students to see your profile</p>
                  </div>
                  <Switch id="profileVisibility" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              variant="accent"
              size="lg"
              disabled={loadingProfile || savingProfile}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorSettings;
