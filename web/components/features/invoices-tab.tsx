"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Download, DollarSign, FileText, CreditCard, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import jsPDF from 'jspdf'

interface Invoice {
  id: string
  invoiceNumber: string
  studentName: string
  course: string
  amount: number
  dueDate: string
  issueDate: string
  status: "paid" | "pending" | "overdue" | "cancelled"
  paymentMethod?: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    studentName: "Sarah Johnson",
    course: "Computer Science",
    amount: 5000,
    dueDate: "2024-02-15",
    issueDate: "2024-01-15",
    status: "paid",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    studentName: "Michael Chen",
    course: "Engineering",
    amount: 4500,
    dueDate: "2024-03-01",
    issueDate: "2024-02-01",
    status: "pending",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    studentName: "Emily Davis",
    course: "Medicine",
    amount: 6000,
    dueDate: "2024-01-30",
    issueDate: "2024-01-10",
    status: "overdue",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    studentName: "James Wilson",
    course: "Business",
    amount: 3500,
    dueDate: "2024-04-15",
    issueDate: "2024-03-15",
    status: "pending",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    studentName: "Lisa Anderson",
    course: "Computer Science",
    amount: 5000,
    dueDate: "2024-02-20",
    issueDate: "2024-01-20",
    status: "paid",
    paymentMethod: "Credit Card",
  },
]

export function InvoicesTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const response = await apiService.getInvoices(1, 100, searchTerm)
        // Handle both response formats: {data: [], total: 0} or direct array []
        const invoicesData = response.data || response || []
        const transformedInvoices = invoicesData.map((invoice: any) => ({
          id: invoice.uniqueId,
          invoiceNumber: invoice.invoiceNumber,
          studentName: invoice.studentName,
          course: invoice.courseName || 'Unknown Course',
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          issueDate: invoice.issueDate,
          status: invoice.status || 'pending',
          paymentMethod: invoice.paymentMethod,
        }))
        setInvoices(transformedInvoices)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices')
        console.error('Error fetching invoices:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [searchTerm])

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await apiService.markInvoiceAsPaid(invoiceId)
      // Refresh invoices list
      const response = await apiService.getInvoices(1, 100, searchTerm)
      const transformedInvoices = response.data.map((invoice: any) => ({
        id: invoice.uniqueId,
        invoiceNumber: invoice.invoiceNumber,
        studentName: invoice.studentName,
        course: invoice.courseName || 'Unknown Course',
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        issueDate: invoice.issueDate,
        status: invoice.status || 'pending',
        paymentMethod: invoice.paymentMethod,
      }))
      setInvoices(transformedInvoices)
    } catch (err) {
      console.error('Error marking invoice as paid:', err)
      alert('Failed to mark invoice as paid. Please try again.')
    }
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF()
      
      // Set font
      doc.setFont('helvetica')
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(255, 0, 144) // #FF0090 color
      doc.text('INVOICE', 20, 30)
      
      // Add company info
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('123Tutors Bursary Program', 20, 45)
      doc.text('Email: info@123tutors.com', 20, 55)
      doc.text('Phone: +27 11 123 4567', 20, 65)
      
      // Add invoice details
      doc.setFontSize(14)
      doc.text('Invoice Details', 20, 85)
      
      // Draw a line
      doc.setDrawColor(255, 0, 144)
      doc.line(20, 90, 190, 90)
      
      // Add invoice information
      doc.setFontSize(11)
      let yPosition = 105
      
      const invoiceDetails = [
        ['Invoice Number:', invoice.invoiceNumber],
        ['Student Name:', invoice.studentName],
        ['Course:', invoice.course],
        ['Amount:', formatCurrency(invoice.amount)],
        ['Due Date:', invoice.dueDate],
        ['Issue Date:', invoice.issueDate],
        ['Status:', invoice.status.toUpperCase()],
        ['Payment Method:', invoice.paymentMethod || 'N/A']
      ]
      
      invoiceDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(value, 80, yPosition)
        yPosition += 12
      })
      
      // Add footer
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280)
      doc.text('Thank you for choosing 123Tutors!', 20, 290)
      
      // Save the PDF
      doc.save(`invoice-${invoice.invoiceNumber}.pdf`)
      
      console.log('PDF generated and downloaded for invoice:', invoice.invoiceNumber)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (loading) {
    return <LoadingDisplay message="Loading invoices..." />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
  }

const filteredInvoices = invoices.filter((invoice) => {
  const matchesSearch =
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.course.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesFilter = filterStatus === "all" || invoice.status === filterStatus
  return matchesSearch && matchesFilter
})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((i) => i.status === "paid").length
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.amount, 0)
  const pendingAmount = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((acc, i) => acc + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage billing and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
              </div>
              <CreditCard className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF0090] border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
              </div>
              <Clock className="h-8 w-8 text-[#FF0090]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-[#FF0090] border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search invoices by number, student, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#FF0090] focus:ring-[#FF0090]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={
                  filterStatus === "all"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                All
              </Button>
              <Button
                variant={filterStatus === "paid" ? "default" : "outline"}
                onClick={() => setFilterStatus("paid")}
                className={
                  filterStatus === "paid"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                Paid
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                className={
                  filterStatus === "pending"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "overdue" ? "default" : "outline"}
                onClick={() => setFilterStatus("overdue")}
                className={
                  filterStatus === "overdue"
                    ? "bg-[#FF0090] hover:bg-[#E6007A] border-[#FF0090]"
                    : "border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                }
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-[#FF0090] border-2">
        <CardHeader>
          <CardTitle className="text-gray-900">Invoice Management</CardTitle>
          <CardDescription className="text-gray-600">Track all invoices and payment statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-gray-900">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-gray-900">{invoice.studentName}</TableCell>
                  <TableCell className="text-gray-600">{invoice.course}</TableCell>
                  <TableCell className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell className="text-gray-600">{invoice.issueDate}</TableCell>
                  <TableCell className="text-gray-600">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                            className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white"
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-[#FF0090] border-2 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900">Invoice Details</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Detailed information for {selectedInvoice?.invoiceNumber}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedInvoice.invoiceNumber}
                                  </h3>
                                  <p className="text-gray-600">Invoice for {selectedInvoice.studentName}</p>
                                </div>
                                <Badge className={getStatusColor(selectedInvoice.status)}>
                                  {selectedInvoice.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Student Name</p>
                                  <p className="font-medium text-gray-900">{selectedInvoice.studentName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Course</p>
                                  <p className="font-medium text-gray-900">{selectedInvoice.course}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Amount</p>
                                  <p className="font-medium text-gray-900 text-lg">
                                    {formatCurrency(selectedInvoice.amount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Payment Method</p>
                                  <p className="font-medium text-gray-900">
                                    {selectedInvoice.paymentMethod || "Not specified"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Issue Date</p>
                                  <p className="font-medium text-gray-900">{selectedInvoice.issueDate}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Due Date</p>
                                  <p className="font-medium text-gray-900">{selectedInvoice.dueDate}</p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                  <span className="text-2xl font-bold text-[#FF0090]">
                                    {formatCurrency(selectedInvoice.amount)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  className="bg-[#FF0090] hover:bg-[#E6007A] text-white border-[#FF0090]"
                                  onClick={() => handleDownloadPDF(selectedInvoice)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
                                >
                                  Send Reminder
                                </Button>
                                {selectedInvoice.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
