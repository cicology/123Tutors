"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
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
  Eye,
  FileX
} from "lucide-react"
import { apiService } from "@/lib/api-service"

interface StudentData {
  bursary: string
  studentEmail: string
  studentNameAndSurname: string
  year?: number
  university?: string
  course?: string
  studentIdNumber?: string
  phoneNumber?: string
  address?: string
  enrollmentDate?: string
  status?: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface MissingReference {
  type: 'course' | 'bursary' | 'university'
  name: string
  rows: number[]
}

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

export function BulkUploadEnhanced({ onUploadComplete, onClose }: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<StudentData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [missingReferences, setMissingReferences] = useState<MissingReference[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [manualStudents, setManualStudents] = useState<StudentData[]>([{
    bursary: '',
    studentEmail: '',
    studentNameAndSurname: '',
    year: undefined,
    university: '',
    course: '',
    studentIdNumber: '',
    phoneNumber: '',
    address: '',
    enrollmentDate: '',
    status: ''
  }])

  const requiredFields = ['bursary', 'studentEmail', 'studentNameAndSurname']
  const validStatuses = ['active', 'inactive', 'graduated', 'suspended']

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return true // Optional field
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  const validateYear = (year: number): boolean => {
    return year >= 1 && year <= 6
  }

  const validateStatus = (status: string): boolean => {
    if (!status) return true // Optional field
    return validStatuses.includes(status.toLowerCase())
  }

  const validateStudentData = (students: StudentData[]): { errors: ValidationError[], missingRefs: MissingReference[] } => {
    const errors: ValidationError[] = []
    const missingRefs: MissingReference[] = []
    const courseRefs = new Map<string, number[]>()
    const bursaryRefs = new Map<string, number[]>()
    const universityRefs = new Map<string, number[]>()

    students.forEach((student, index) => {
      const row = index + 1

      // Validate required fields
      requiredFields.forEach(field => {
        if (!student[field as keyof StudentData] || student[field as keyof StudentData] === '') {
          errors.push({
            row,
            field,
            message: `${field} is required`
          })
        }
      })

      // Validate email format
      if (student.studentEmail && !validateEmail(student.studentEmail)) {
        errors.push({
          row,
          field: 'studentEmail',
          message: 'Invalid email format'
        })
      }

      // Validate year
      if (student.year && !validateYear(student.year)) {
        errors.push({
          row,
          field: 'year',
          message: 'Year must be between 1 and 6'
        })
      }

      // Validate enrollment date
      if (student.enrollmentDate && !validateDate(student.enrollmentDate)) {
        errors.push({
          row,
          field: 'enrollmentDate',
          message: 'Invalid date format'
        })
      }

      // Validate status
      if (student.status && !validateStatus(student.status)) {
        errors.push({
          row,
          field: 'status',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        })
      }

      // Collect references for validation
      if (student.course) {
        const courses = courseRefs.get(student.course) || []
        courses.push(row)
        courseRefs.set(student.course, courses)
      }

      if (student.bursary) {
        const bursaries = bursaryRefs.get(student.bursary) || []
        bursaries.push(row)
        bursaryRefs.set(student.bursary, bursaries)
      }

      if (student.university) {
        const universities = universityRefs.get(student.university) || []
        universities.push(row)
        universityRefs.set(student.university, universities)
      }
    })

    // TODO: Check against database for missing references
    // This would require API calls to validate courses, bursaries, and universities
    // For now, we'll assume all references are valid

    return { errors, missingRefs }
  }

  const parseFile = useCallback(async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    let students: StudentData[] = []

    try {
      if (fileExtension === 'csv') {
        const csvText = await file.text()
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            // Normalize headers to match our interface
            const headerMap: { [key: string]: string } = {
              'bursary': 'bursary',
              'student email': 'studentEmail',
              'studentemail': 'studentEmail',
              'email': 'studentEmail',
              'student name': 'studentNameAndSurname',
              'studentnameandsurname': 'studentNameAndSurname',
              'name': 'studentNameAndSurname',
              'full name': 'studentNameAndSurname',
              'year': 'year',
              'university': 'university',
              'course': 'course',
              'student id': 'studentIdNumber',
              'studentidnumber': 'studentIdNumber',
              'id': 'studentIdNumber',
              'phone': 'phoneNumber',
              'phone number': 'phoneNumber',
              'phonenumber': 'phoneNumber',
              'address': 'address',
              'enrollment date': 'enrollmentDate',
              'enrollmentdate': 'enrollmentDate',
              'status': 'status'
            }
            return headerMap[header.toLowerCase()] || header
          }
        })

        students = result.data.map((row: any) => ({
          bursary: row.bursary || '',
          studentEmail: row.studentEmail || '',
          studentNameAndSurname: row.studentNameAndSurname || '',
          year: row.year ? parseInt(row.year) : undefined,
          university: row.university || undefined,
          course: row.course || undefined,
          studentIdNumber: row.studentIdNumber || undefined,
          phoneNumber: row.phoneNumber || undefined,
          address: row.address || undefined,
          enrollmentDate: row.enrollmentDate || undefined,
          status: row.status || undefined,
        })).filter((student: StudentData) => 
          student.bursary || student.studentEmail || student.studentNameAndSurname
        )

      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        students = jsonData.map((row: any) => ({
          bursary: row.bursary || row.Bursary || '',
          studentEmail: row.studentEmail || row['Student Email'] || row.email || '',
          studentNameAndSurname: row.studentNameAndSurname || row['Student Name'] || row.name || '',
          year: row.year ? parseInt(row.year) : undefined,
          university: row.university || row.University || undefined,
          course: row.course || row.Course || undefined,
          studentIdNumber: row.studentIdNumber || row['Student ID'] || row.id || undefined,
          phoneNumber: row.phoneNumber || row['Phone Number'] || row.phone || undefined,
          address: row.address || row.Address || undefined,
          enrollmentDate: row.enrollmentDate || row['Enrollment Date'] || undefined,
          status: row.status || row.Status || undefined,
        })).filter((student: StudentData) => 
          student.bursary || student.studentEmail || student.studentNameAndSurname
        )
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files only.')
      }

      setParsedData(students)
      
      // Validate the parsed data
      const { errors, missingRefs } = validateStudentData(students)
      setValidationErrors(errors)
      setMissingReferences(missingRefs)
      
      if (errors.length === 0 && missingRefs.length === 0) {
        setShowPreview(true)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing file')
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      parseFile(file)
    }
  }, [parseFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (uploadMethod === 'file' && !selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (uploadMethod === 'manual' && manualStudents.length === 0) {
      setError('Please add at least one student')
      return
    }

    if (validationErrors.length > 0) {
      setError('Please fix validation errors before uploading')
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
      course: '',
      studentIdNumber: '',
      phoneNumber: '',
      address: '',
      enrollmentDate: '',
      status: ''
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
    setParsedData([])
    setValidationErrors([])
    setMissingReferences([])
    setUploadResult(null)
    setError(null)
    setUploadProgress(0)
    setShowPreview(false)
    setManualStudents([{
      bursary: '',
      studentEmail: '',
      studentNameAndSurname: '',
      year: undefined,
      university: '',
      course: '',
      studentIdNumber: '',
      phoneNumber: '',
      address: '',
      enrollmentDate: '',
      status: ''
    }])
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
          className="gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4 min-h-[44px] sm:min-h-[40px] border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
          onClick={() => {
            console.log('Bulk Upload button clicked!')
            setIsOpen(true)
          }}
        >
          <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
          Bulk Upload Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900">Bulk Upload Students</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Upload multiple students at once using a CSV/Excel file or add them manually.
            <span className="block mt-1 text-sm font-medium text-gray-700">
              Required columns: bursary, studentEmail, studentNameAndSurname
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Method Selection */}
          <div className="flex gap-3 p-1 bg-gray-50 rounded-lg">
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'ghost'}
              onClick={() => setUploadMethod('file')}
              className={`flex-1 transition-all duration-200 ${
                uploadMethod === 'file' 
                  ? 'bg-[#FF0090] hover:bg-[#E6007A] text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload File (CSV/Excel)
            </Button>
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'ghost'}
              onClick={() => setUploadMethod('manual')}
              className={`flex-1 transition-all duration-200 ${
                uploadMethod === 'manual' 
                  ? 'bg-[#FF0090] hover:bg-[#E6007A] text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>

          {/* File Upload Section */}
          {uploadMethod === 'file' && (
            <Card className="border-2 border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Upload File</CardTitle>
                <CardDescription className="text-gray-600">
                  Select a CSV or Excel file containing student data. 
                  <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto ml-2 text-[#FF0090] hover:text-[#E6007A] font-medium">
                    Download template
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive 
                      ? 'border-[#FF0090] bg-[#FF0090]/10 scale-[1.02]' 
                      : 'border-gray-300 hover:border-[#FF0090] hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-full transition-colors ${
                      isDragActive ? 'bg-[#FF0090]/20' : 'bg-gray-100'
                    }`}>
                      <FileText className={`h-12 w-12 transition-colors ${
                        isDragActive ? 'text-[#FF0090]' : 'text-gray-400'
                      }`} />
                    </div>
                    {isDragActive ? (
                      <div className="space-y-2">
                        <p className="text-[#FF0090] font-semibold text-lg">Drop the file here...</p>
                        <p className="text-gray-600 text-sm">Release to upload</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File or Drag & Drop
                        </Button>
                        <p className="text-sm text-gray-500">
                          Supports CSV and Excel files (.csv, .xlsx, .xls)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        {Math.round(selectedFile.size / 1024)} KB • Ready to upload
                      </p>
                    </div>
                  </div>
                )}

                {/* Data Preview */}
                {parsedData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Data Preview ({parsedData.length} students)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Bursary</TableHead>
                              <TableHead>Year</TableHead>
                              <TableHead>University</TableHead>
                              <TableHead>Course</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.slice(0, 10).map((student, index) => (
                              <TableRow key={index}>
                                <TableCell>{student.studentNameAndSurname}</TableCell>
                                <TableCell>{student.studentEmail}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{student.bursary}</Badge>
                                </TableCell>
                                <TableCell>{student.year || '-'}</TableCell>
                                <TableCell>{student.university || '-'}</TableCell>
                                <TableCell>{student.course || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {parsedData.length > 10 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Showing first 10 rows of {parsedData.length} total students
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Validation Errors Found:</p>
                        <div className="max-h-40 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validationErrors.slice(0, 10).map((error, index) => (
                                <TableRow key={index}>
                                  <TableCell>{error.row}</TableCell>
                                  <TableCell>{error.field}</TableCell>
                                  <TableCell className="text-red-600">{error.message}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {validationErrors.length > 10 && (
                            <p className="text-sm text-gray-500 mt-2">
                              Showing first 10 errors of {validationErrors.length} total
                            </p>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Missing References */}
                {missingReferences.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Missing References Found:</p>
                        {missingReferences.map((ref, index) => (
                          <div key={index} className="text-sm">
                            <Badge variant="outline" className="mr-2">
                              {ref.type}: {ref.name}
                            </Badge>
                            <span className="text-gray-600">
                              (Rows: {ref.rows.join(', ')})
                            </span>
                          </div>
                        ))}
                        <p className="text-sm text-gray-600 mt-2">
                          Please add these references to the system before uploading.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Entry Section */}
          {uploadMethod === 'manual' && (
            <Card className="border-2 border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Add Students Manually</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter student information manually. Click "Add Student" to add more rows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {manualStudents.map((student, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Student {index + 1}</h4>
                        {manualStudents.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualStudent(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                          <Label htmlFor={`year-${index}`}>Year (1-6)</Label>
                          <Input
                            id={`year-${index}`}
                            type="number"
                            min="1"
                            max="6"
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
                        <div>
                          <Label htmlFor={`id-${index}`}>Student ID</Label>
                          <Input
                            id={`id-${index}`}
                            value={student.studentIdNumber || ''}
                            onChange={(e) => updateManualStudent(index, 'studentIdNumber', e.target.value)}
                            placeholder="12345678"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                          <Input
                            id={`phone-${index}`}
                            value={student.phoneNumber || ''}
                            onChange={(e) => updateManualStudent(index, 'phoneNumber', e.target.value)}
                            placeholder="+27123456789"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`address-${index}`}>Address</Label>
                          <Input
                            id={`address-${index}`}
                            value={student.address || ''}
                            onChange={(e) => updateManualStudent(index, 'address', e.target.value)}
                            placeholder="Cape Town"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`enrollment-${index}`}>Enrollment Date</Label>
                          <Input
                            id={`enrollment-${index}`}
                            type="date"
                            value={student.enrollmentDate || ''}
                            onChange={(e) => updateManualStudent(index, 'enrollmentDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`status-${index}`}>Status</Label>
                          <Input
                            id={`status-${index}`}
                            value={student.status || ''}
                            onChange={(e) => updateManualStudent(index, 'status', e.target.value)}
                            placeholder="active, inactive, graduated, suspended"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addManualStudent}
                    className="w-full border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white transition-colors"
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button 
                onClick={handleUpload} 
                disabled={
                  isUploading || 
                  (uploadMethod === 'file' && (!selectedFile || validationErrors.length > 0)) || 
                  (uploadMethod === 'manual' && manualStudents.length === 0)
                }
                className="px-6 py-2 bg-[#FF0090] hover:bg-[#E6007A] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
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
