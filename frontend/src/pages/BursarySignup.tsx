import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BursarySignup = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Bursary application submitted");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header (logo + back to home), matching Find Tutor page style */}
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

      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-8">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">
              Register your <span className="text-gradient">Bursary</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Bursary organizations can partner with 123tutors to provide tutoring for their students.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bursary Client Form</CardTitle>
              <CardDescription>
                Tell us about your bursary program and how we can support your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input id="orgName" placeholder="e.g., Feenix Trust" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" placeholder="https://example.org" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgType">Organization Type</Label>
                      <Select>
                        <SelectTrigger id="orgType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="foundation">Foundation</SelectItem>
                          <SelectItem value="corporate">Corporate CSI</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="npo">NPO / NGO</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                      <Input id="logoUrl" type="url" placeholder="https://.../logo.png" />
                    </div>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Primary Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name</Label>
                      <Input id="contactName" placeholder="Jane Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactRole">Role/Title</Label>
                      <Input id="contactRole" placeholder="Programme Manager" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input id="contactEmail" type="email" placeholder="jane@example.org" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input id="contactPhone" type="tel" placeholder="+27 12 345 6789" required />
                    </div>
                  </div>
                </div>

                {/* Programme Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Programme Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentsPerYear">Students Covered / Year</Label>
                      <Input id="studentsPerYear" type="number" min="1" placeholder="e.g., 250" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerStudent">Tutoring Hours / Student / Month</Label>
                      <Input id="hoursPerStudent" type="number" min="1" placeholder="e.g., 4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Tutoring Modes</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2"><Checkbox id="modeOnline" /><Label htmlFor="modeOnline">Online</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="modeInPerson" /><Label htmlFor="modeInPerson">In-person</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="modeHybrid" /><Label htmlFor="modeHybrid">Hybrid</Label></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="levels">Education Levels Covered</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center space-x-2"><Checkbox id="levelHighSchool" /><Label htmlFor="levelHighSchool">High School</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="levelTVET" /><Label htmlFor="levelTVET">TVET</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="levelUndergrad" /><Label htmlFor="levelUndergrad">Undergrad</Label></div>
                      <div className="flex items-center space-x-2"><Checkbox id="levelPostgrad" /><Label htmlFor="levelPostgrad">Postgrad</Label></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects or Focus Areas</Label>
                    <Textarea id="subjects" placeholder="e.g., Maths, Science, Accounting..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regions">Regions / Provinces Covered</Label>
                    <Textarea id="regions" placeholder="List the provinces or regions where your students are based" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" placeholder="Share any requirements, timelines, or partnership preferences" rows={4} />
                  </div>
                </div>

                {/* Authorization */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox id="authorized" />
                    <Label htmlFor="authorized" className="text-sm text-muted-foreground">
                      I confirm that I am authorised to submit this request on behalf of the organisation.
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="accent">
                  Request Partnership
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BursarySignup;
