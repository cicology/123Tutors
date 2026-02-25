"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, Users, Plus } from "lucide-react"

interface Student {
  name: string
  email: string
  university: string
  course: string
  maxBudget: number
  status: "valid" | "duplicate" | "invalid"
  errors?: string[]
}

interface UploadResult {
  total: number
  successful: number
  failed: number
  duplicates: number
  students: Student[]
}

export function BulkUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validTypes.includes(fileExtension)) {
      alert("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate file processing with progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Mock processing results
      const mockStudents: Student[] = [
        {
          name: "John Smith",
          email: "john.smith@uct.ac.za",
          university: "UCT",
          course: "Computer Science",
          maxBudget: 8000,
          status: "valid",
        },
        {
          name: "Sarah Johnson",
          email: "sarah.j@stellenbosch.ac.za",
          university: "Stellenbosch",
          course: "Mathematics",
          maxBudget: 6000,
          status: "valid",
        },
        {
          name: "Mike Davis",
          email: "mike.davis@wits.ac.za",
          university: "Wits",
          course: "Physics",
          maxBudget: 7500,
          status: "valid",
        },
        {
          name: "Emma Wilson",
          email: "emma.wilson@uct.ac.za",
          university: "UCT",
          course: "Chemistry",
          maxBudget: 5500,
          status: "duplicate",
          errors: ["Student already exists in system"],
        },
        {
          name: "",
          email: "invalid.email",
          university: "",
          course: "Biology",
          maxBudget: 0,
          status: "invalid",
          errors: ["Missing name", "Invalid email format", "Missing university", "Invalid budget amount"],
        },
      ]

      const result: UploadResult = {
        total: mockStudents.length,
        successful: mockStudents.filter((s) => s.status === "valid").length,
        failed: mockStudents.filter((s) => s.status === "invalid").length,
        duplicates: mockStudents.filter((s) => s.status === "duplicate").length,
        students: mockStudents,
      }

      setUploadResult(result)
      setShowResults(true)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = `Name,Email,University,Course,Max Budget
John Smith,john.smith@uct.ac.za,UCT,Computer Science,8000
Sarah Johnson,sarah.j@stellenbosch.ac.za,Stellenbosch,Mathematics,6000
Mike Davis,mike.davis@wits.ac.za,Wits,Physics,7500`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "student_upload_template.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleConfirmUpload = () => {
    if (!uploadResult) return

    // Process successful students
    const validStudents = uploadResult.students.filter((s) => s.status === "valid")
    console.log("Adding students to system:", validStudents)

    // Reset state
    setUploadResult(null)
    setShowResults(false)
    setUploadProgress(0)

    alert(`Successfully added ${validStudents.length} students to the system!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#FF0090]">Bulk Student Upload</h2>
          <p className="text-gray-600">Upload multiple student records at once using CSV or Excel files</p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Instructions */}
      <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#FF0090]">Upload Instructions</CardTitle>
          <CardDescription>Follow these guidelines for successful bulk upload</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Required Columns:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Name (Full student name)</li>
                <li>• Email (Valid email address)</li>
                <li>• University (Institution name)</li>
                <li>• Course (Field of study)</li>
                <li>• Max Budget (Numeric value in Rands)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">File Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Maximum 1000 records per upload</li>
                <li>• First row should contain column headers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-[#FF0090] rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-[#FF0090] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Student Data</h3>
            <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isUploading ? "Processing..." : "Choose File"}
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing file...</span>
                <span className="text-[#FF0090] font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FF0090]">Upload Results</DialogTitle>
            <DialogDescription>
              Review the upload results and confirm to add valid students to the system
            </DialogDescription>
          </DialogHeader>

          {uploadResult && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#FF0090] text-white border-[#FF0090]">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{uploadResult.total}</p>
                    <p className="text-xs text-gray-200">Total Records</p>
                  </CardContent>
                </Card>

                <Card className="bg-green-500 text-white">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{uploadResult.successful}</p>
                    <p className="text-xs text-gray-200">Valid</p>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-500 text-white">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{uploadResult.duplicates}</p>
                    <p className="text-xs text-gray-200">Duplicates</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500 text-white">
                  <CardContent className="p-4 text-center">
                    <XCircle className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{uploadResult.failed}</p>
                    <p className="text-xs text-gray-200">Invalid</p>
                  </CardContent>
                </Card>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.students.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "valid"
                                ? "default"
                                : student.status === "duplicate"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              student.status === "valid"
                                ? "bg-green-100 text-green-800"
                                : student.status === "duplicate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {student.status === "valid" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {student.status === "duplicate" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {student.status === "invalid" && <XCircle className="h-3 w-3 mr-1" />}
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{student.name || "-"}</TableCell>
                        <TableCell>{student.email || "-"}</TableCell>
                        <TableCell>{student.university || "-"}</TableCell>
                        <TableCell>{student.course || "-"}</TableCell>
                        <TableCell>{student.maxBudget ? `R${student.maxBudget.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          {student.errors && student.errors.length > 0 && (
                            <div className="text-sm text-red-600">
                              {student.errors.map((error, i) => (
                                <div key={i}>• {error}</div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowResults(false)}
                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={uploadResult.successful === 0}
                  className="bg-[#FF0090] hover:bg-[#FF0090]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {uploadResult.successful} Valid Students
                </Button>
              </div>

              {uploadResult.successful === 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    No valid students found. Please fix the issues and try uploading again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
