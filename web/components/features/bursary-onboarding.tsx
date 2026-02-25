"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Users, DollarSign, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function BursaryOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Organization Details
    orgName: "",
    orgType: "",
    registrationNumber: "",
    address: "",

    // Step 2: Budget Information
    totalBudget: "",
    budgetPeriod: "",
    maxStudentBudget: "",
    hourlyRate: "",
    allocationStrategy: "",

    // Step 3: Student Criteria
    eligibleUniversities: [] as string[],
    eligibleStudyFields: [] as string[],
    minGrade: "",
    maxStudents: "",

    // Step 4: Final Setup
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    reportingFrequency: "",
    termsAccepted: false,
    privacyAccepted: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  const handleCompleteSetup = async () => {
    setIsLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Generate unique ID for the bursary
      const uniqueId = crypto.randomUUID()

      // Create bursary organization in bursary_names table
      const { data: bursary, error: bursaryError } = await supabase
        .from("bursary_names")
        .insert({
          unique_id: uniqueId,
          bursary_name: formData.orgName,
          address: formData.address,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          total_budget: Number.parseFloat(formData.totalBudget.replace(/[^\d.-]/g, "")) || 0,
          description: JSON.stringify({
            type: formData.orgType,
            registrationNumber: formData.registrationNumber,
            contactPerson: formData.contactPerson,
            reportingFrequency: formData.reportingFrequency,
            budgetPeriod: formData.budgetPeriod,
            maxStudentBudget: Number.parseFloat(formData.maxStudentBudget.replace(/[^\d.-]/g, "")) || 0,
            hourlyRate: Number.parseFloat(formData.hourlyRate.replace(/[^\d.-]/g, "")) || 0,
            allocationStrategy: formData.allocationStrategy,
            eligibleUniversities: formData.eligibleUniversities,
            eligibleStudyFields: formData.eligibleStudyFields,
            minGrade: Number.parseInt(formData.minGrade) || 0,
            maxStudents: Number.parseInt(formData.maxStudents) || 0,
            termsAccepted: formData.termsAccepted,
            privacyAccepted: formData.privacyAccepted,
          }),
        })
        .select()
        .single()

      if (bursaryError) {
        throw new Error(bursaryError.message)
      }

      // Update user profile to link to this bursary
      await supabase
        .from("user_profiles")
        .upsert({
          email: user.email,
          unique_id: user.id,
          user_type: "bursary",
          bursary_name: formData.orgName,
        })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "An error occurred during setup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center">
          <img
            src="/images/123tutors-logo.png"
            alt="123tutors"
            className="h-8 sm:h-12 w-auto mx-auto mb-3 sm:mb-4 rounded-full border-2 border-[#FF0090]"
          />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Bursary Organization Setup</h1>
          <p className="text-sm sm:text-base text-gray-600">Set up your bursary management account</p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            <AlertDescription className="text-red-600 text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            <AlertDescription className="text-green-600 text-xs sm:text-sm">
              Organization setup completed successfully! You can now access your bursary dashboard.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep >= step ? "bg-[#FF0090] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div className={`w-6 sm:w-12 h-0.5 ${currentStep > step ? "bg-[#FF0090]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <Card className="border-[#FF0090]">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-[#FF0090]">
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                Organization Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Tell us about your bursary organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="orgName" className="text-sm sm:text-base text-gray-700">
                  Organization Name
                </Label>
                <Input
                  id="orgName"
                  placeholder="e.g., South African Education Foundation"
                  value={formData.orgName}
                  onChange={(e) => handleInputChange("orgName", e.target.value)}
                  className="text-sm sm:text-base border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="orgType" className="text-sm sm:text-base text-gray-700">
                  Organization Type
                </Label>
                <Select value={formData.orgType} onValueChange={(value) => handleInputChange("orgType", value)}>
                  <SelectTrigger className="text-sm sm:text-base border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="npo">Non-Profit Organization</SelectItem>
                    <SelectItem value="corporate">Corporate Foundation</SelectItem>
                    <SelectItem value="government">Government Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="text-gray-700">
                  Registration Number
                </Label>
                <Input
                  id="registrationNumber"
                  placeholder="Organization registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Physical Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your organization's address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.orgName || !formData.orgType}
                  className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="border-[#FF0090]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FF0090]">
                <DollarSign className="h-5 w-5" />
                Budget Information
              </CardTitle>
              <CardDescription>Set up your tutoring budget parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalBudget" className="text-gray-700">
                  Total Annual Budget
                </Label>
                <Input
                  id="totalBudget"
                  placeholder="e.g., R1,500,000"
                  value={formData.totalBudget}
                  onChange={(e) => handleInputChange("totalBudget", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetPeriod" className="text-gray-700">
                  Budget Period
                </Label>
                <Select
                  value={formData.budgetPeriod}
                  onValueChange={(value) => handleInputChange("budgetPeriod", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]">
                    <SelectValue placeholder="Select budget period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudentBudget" className="text-gray-700">
                  Maximum Budget per Student
                </Label>
                <Input
                  id="maxStudentBudget"
                  placeholder="e.g., R10,000"
                  value={formData.maxStudentBudget}
                  onChange={(e) => handleInputChange("maxStudentBudget", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-gray-700">
                  Standard Hourly Rate
                </Label>
                <Input
                  id="hourlyRate"
                  placeholder="e.g., R70"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetAllocation" className="text-gray-700">
                  Budget Allocation Strategy
                </Label>
                <Select
                  value={formData.allocationStrategy}
                  onValueChange={(value) => handleInputChange("allocationStrategy", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]">
                    <SelectValue placeholder="How do you allocate budgets?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal allocation per student</SelectItem>
                    <SelectItem value="need-based">Need-based allocation</SelectItem>
                    <SelectItem value="performance">Performance-based allocation</SelectItem>
                    <SelectItem value="custom">Custom allocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090]/10"
                >
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-[#FF0090] hover:bg-[#FF0090]/90 text-white">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="border-[#FF0090]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FF0090]">
                <Users className="h-5 w-5" />
                Student Criteria
              </CardTitle>
              <CardDescription>Define eligibility criteria for your bursary program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Eligible Universities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "University of Cape Town",
                    "Stellenbosch University",
                    "University of the Witwatersrand",
                    "University of Pretoria",
                    "University of KwaZulu-Natal",
                    "Rhodes University",
                  ].map((university) => (
                    <div key={university} className="flex items-center space-x-2">
                      <Checkbox
                        id={university}
                        checked={formData.eligibleUniversities.includes(university)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("eligibleUniversities", university, checked as boolean)
                        }
                      />
                      <Label htmlFor={university} className="text-sm text-gray-700">
                        {university}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Eligible Study Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["STEM", "Commerce", "Humanities", "Health Sciences", "Engineering", "Law"].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={formData.eligibleStudyFields.includes(field)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("eligibleStudyFields", field, checked as boolean)
                        }
                      />
                      <Label htmlFor={field} className="text-sm text-gray-700">
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minGrade" className="text-gray-700">
                  Minimum Academic Grade
                </Label>
                <Select value={formData.minGrade} onValueChange={(value) => handleInputChange("minGrade", value)}>
                  <SelectTrigger className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]">
                    <SelectValue placeholder="Select minimum grade requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50% (Pass)</SelectItem>
                    <SelectItem value="60">60% (Good)</SelectItem>
                    <SelectItem value="70">70% (Very Good)</SelectItem>
                    <SelectItem value="80">80% (Excellent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents" className="text-gray-700">
                  Maximum Number of Students
                </Label>
                <Input
                  id="maxStudents"
                  placeholder="e.g., 100"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange("maxStudents", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090]/10"
                >
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} className="bg-[#FF0090] hover:bg-[#FF0090]/90 text-white">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="border-[#FF0090]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FF0090]">
                <FileText className="h-5 w-5" />
                Final Setup
              </CardTitle>
              <CardDescription>Complete your bursary account setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-gray-700">
                  Primary Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="Full name of primary contact"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-gray-700">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Primary contact email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-gray-700">
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="Primary contact phone number"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportingFrequency" className="text-gray-700">
                  Reporting Frequency
                </Label>
                <Select
                  value={formData.reportingFrequency}
                  onValueChange={(value) => handleInputChange("reportingFrequency", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#FF0090] focus:ring-[#FF0090]">
                    <SelectValue placeholder="How often do you want reports?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the terms and conditions of the 123tutors bursary management platform
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked) => handleInputChange("privacyAccepted", checked)}
                  />
                  <Label htmlFor="privacy" className="text-sm text-gray-700">
                    I consent to the processing of student data in accordance with POPIA regulations
                  </Label>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090]/10"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleCompleteSetup}
                  disabled={isLoading || !formData.termsAccepted || !formData.privacyAccepted}
                  className="bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
