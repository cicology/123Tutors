"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Trash2,
  Plus,
  Eye
} from "lucide-react"
import { apiService } from "@/lib/api-service"

interface BulkUploadResult {
  totalProcessed: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
  createdStudents: Array<{
    bursary: string
    studentEmail: string
    studentNameAndSurname: string
    year?: number
    university?: string
    course?: string
  }>
}

interface BulkUploadProps {
  onUploadComplete?: (result: BulkUploadResult) => void
  onClose?: () => void
}

export function BulkUploadDialog({ onUploadComplete, onClose }: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualStudents, setManualStudents] = useState<Array<{
    bursary: string
    studentEmail: string
    studentNameAndSurname: string
    year?: number
    university?: string
    course?: string
  }>>([{
    bursary: '',
    studentEmail: '',
    studentNameAndSurname: '',
    year: undefined,
    university: '',
    course: ''
  }])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug logging
  console.log('BulkUploadDialog rendered, isOpen:', isOpen)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        setSelectedFile(file)
        setError(null)
      } else {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
        setSelectedFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (uploadMethod === 'file' && !selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (uploadMethod === 'manual' && manualStudents.length === 0) {
      setError('Please add at least one student')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      let result: BulkUploadResult

      if (uploadMethod === 'file') {
        // Simulate progress for file upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        result = await apiService.bulkUploadStudentsFromFile(selectedFile!)
        clearInterval(progressInterval)
      } else {
        // Simulate progress for manual upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 15
          })
        }, 150)

        result = await apiService.bulkUploadStudentsFromData(manualStudents)
        clearInterval(progressInterval)
      }

      setUploadProgress(100)
      setUploadResult(result)
      
      if (onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const addManualStudent = () => {
    setManualStudents([...manualStudents, {
      bursary: '',
      studentEmail: '',
      studentNameAndSurname: '',
      year: undefined,
      university: '',
      course: ''
    }])
  }

  const removeManualStudent = (index: number) => {
    setManualStudents(manualStudents.filter((_, i) => i !== index))
  }

  const updateManualStudent = (index: number, field: string, value: string | number) => {
    const updated = [...manualStudents]
    updated[index] = { ...updated[index], [field]: value }
    setManualStudents(updated)
  }

  const downloadTemplate = () => {
    const csvContent = `bursary,studentEmail,studentNameAndSurname,year,university,course,studentIdNumber,phoneNumber,address,enrollmentDate,status
NSFAS,john.doe@example.com,John Doe,2,University of Cape Town,Computer Science,12345678,+27123456789,Cape Town,2024-01-15,active
Funza Lushaka,jane.smith@example.com,Jane Smith,1,University of Johannesburg,Engineering,87654321,+27123456790,Johannesburg,2024-01-20,active`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setError(null)
    setUploadProgress(0)
    setManualStudents([{
      bursary: '',
      studentEmail: '',
      studentNameAndSurname: '',
      year: undefined,
      university: '',
      course: ''
    }])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    resetForm()
    if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog state changing to:', open)
      setIsOpen(open)
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            console.log('Bulk Upload button clicked!')
            setIsOpen(true)
          }}
        >
          <Upload className="h-4 w-4" />
          Bulk Upload Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>
            Upload multiple students at once using a CSV/Excel file or add them manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Method Selection */}
          <div className="flex gap-4">
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload File (CSV/Excel)
            </Button>
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('manual')}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>

          {/* File Upload Section */}
          {uploadMethod === 'file' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload File</CardTitle>
                <CardDescription>
                  Select a CSV or Excel file containing student data. 
                  <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto ml-2">
                    Download template
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Entry Section */}
          {uploadMethod === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Students Manually</CardTitle>
                <CardDescription>
                  Enter student information manually. Click "Add Student" to add more rows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {manualStudents.map((student, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Student {index + 1}</h4>
                        {manualStudents.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualStudent(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`bursary-${index}`}>Bursary *</Label>
                          <Input
                            id={`bursary-${index}`}
                            value={student.bursary}
                            onChange={(e) => updateManualStudent(index, 'bursary', e.target.value)}
                            placeholder="e.g., NSFAS"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${index}`}>Email *</Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={student.studentEmail}
                            onChange={(e) => updateManualStudent(index, 'studentEmail', e.target.value)}
                            placeholder="student@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`name-${index}`}>Full Name *</Label>
                          <Input
                            id={`name-${index}`}
                            value={student.studentNameAndSurname}
                            onChange={(e) => updateManualStudent(index, 'studentNameAndSurname', e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`year-${index}`}>Year</Label>
                          <Input
                            id={`year-${index}`}
                            type="number"
                            min="1"
                            max="10"
                            value={student.year || ''}
                            onChange={(e) => updateManualStudent(index, 'year', parseInt(e.target.value) || undefined)}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`university-${index}`}>University</Label>
                          <Input
                            id={`university-${index}`}
                            value={student.university || ''}
                            onChange={(e) => updateManualStudent(index, 'university', e.target.value)}
                            placeholder="University of Cape Town"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`course-${index}`}>Course</Label>
                          <Input
                            id={`course-${index}`}
                            value={student.course || ''}
                            onChange={(e) => updateManualStudent(index, 'course', e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addManualStudent}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{uploadResult.totalProcessed}</div>
                    <div className="text-sm text-blue-800">Total Processed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.successful}</div>
                    <div className="text-sm text-green-800">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                    <div className="text-sm text-red-800">Failed</div>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Errors:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>{error.email}</TableCell>
                              <TableCell className="text-red-600">{error.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {uploadResult.createdStudents.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Successfully Created:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Bursary</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.createdStudents.map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>{student.studentNameAndSurname}</TableCell>
                              <TableCell>{student.studentEmail}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{student.bursary}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'manual' && manualStudents.length === 0)}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Students
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
