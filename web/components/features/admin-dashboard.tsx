"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { supabase } from "@/lib/supabase"
import { ErrorDisplay, LoadingDisplay } from "@/components/ui/error-handling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Home,
  Users,
  Building2,
  BookOpen,
  DollarSign,
  TrendingUp,
  Settings,
  Search,
  User,
  LogOut,
  Menu,
  BarChart3,
  FileText,
  Shield,
  GraduationCap,
} from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
}

interface SystemStats {
  total_users: number
  total_students: number
  total_tutors: number
  total_bursaries: number
  total_requests: number
  total_lessons: number
  total_revenue: number
  active_sessions: number
}

interface UserProfile {
  email: string
  user_type: string
  unique_id: string
  creation_date: string
  bursary_name?: string
}

interface BursaryInfo {
  unique_id: string
  bursary_name: string
  total_students: number
  total_budget: number
  email?: string
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Data states
  const [stats, setStats] = useState<SystemStats>({
    total_users: 0,
    total_students: 0,
    total_tutors: 0,
    total_bursaries: 0,
    total_requests: 0,
    total_lessons: 0,
    total_revenue: 0,
    active_sessions: 0,
  })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [bursaries, setBursaries] = useState<BursaryInfo[]>([])
  const [tutorRequests, setTutorRequests] = useState<any[]>([])

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setIsLoading(true)

      // Load all users
      const usersData = await apiService.getUserProfiles(1, 1000)
      if (usersData?.data) {
        setUsers(usersData.data)

        // Calculate user stats
        const students = usersData.data.filter((u: UserProfile) => u.user_type === "student")
        const tutors = usersData.data.filter((u: UserProfile) => u.user_type === "tutor")

        setStats(prev => ({
          ...prev,
          total_users: usersData.data.length,
          total_students: students.length,
          total_tutors: tutors.length,
        }))
      }

      // Load bursaries
      const bursariesData = await apiService.getBursaryNames(1, 100)
      if (bursariesData?.data) {
        setBursaries(bursariesData.data)
        setStats(prev => ({ ...prev, total_bursaries: bursariesData.data.length }))
      }

      // Load tutor requests
      const requestsData = await apiService.getTutorRequests(1, 100)
      if (requestsData?.data) {
        setTutorRequests(requestsData.data)
        setStats(prev => ({ ...prev, total_requests: requestsData.data.length }))
      }

      // Load lessons for stats
      const lessonsData = await apiService.getLessons(1, 1000)
      if (lessonsData?.data) {
        setStats(prev => ({ ...prev, total_lessons: lessonsData.data.length }))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: "home", label: "Overview", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "bursaries", label: "Bursaries", icon: Building2 },
    { id: "requests", label: "Tutor Requests", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <LoadingDisplay message="Loading admin dashboard..." />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadAdminData} />
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white shadow-sm lg:flex">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <Shield className="h-8 w-8 text-[#FF0090]" />
          <span className="text-lg font-bold text-gray-900">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#FF0090]/10 text-[#FF0090]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#FF0090]" />
          <span className="font-bold">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-16 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    activeTab === tab.id ? "bg-[#FF0090]/10 text-[#FF0090]" : "text-gray-600"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600">Manage users, bursaries, and system settings.</p>
          </div>

          {/* Tab Content */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-[#FF0090]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_students.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">registered students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tutors</CardTitle>
                    <BookOpen className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_tutors.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">active tutors</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Bursaries</CardTitle>
                    <Building2 className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_bursaries}</div>
                    <p className="text-xs text-gray-500">organizations</p>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tutor Requests</CardTitle>
                    <FileText className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_requests.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">total requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Lessons</CardTitle>
                    <BookOpen className="h-4 w-4 text-teal-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_lessons.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">total lessons</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Online</div>
                    <p className="text-xs text-gray-500">all systems operational</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tutor Requests</CardTitle>
                  <CardDescription>Latest tutoring requests in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {tutorRequests.slice(0, 5).length > 0 ? (
                    <div className="space-y-4">
                      {tutorRequests.slice(0, 5).map((request) => (
                        <div key={request.unique_id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{request.student_first_name} {request.student_last_name}</p>
                            <p className="text-sm text-gray-500">{request.request_courses || "Various subjects"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {request.creation_date ? new Date(request.creation_date).toLocaleDateString() : "N/A"}
                            </p>
                            <Badge variant={request.paid ? "default" : "secondary"}>
                              {request.paid ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No recent requests</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Bursary</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 50).map((user) => (
                      <TableRow key={user.unique_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.user_type === "admin" ? "destructive" :
                            user.user_type === "tutor" ? "default" :
                            user.user_type === "bursary_admin" ? "outline" :
                            "secondary"
                          }>
                            {user.user_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.bursary_name || "-"}</TableCell>
                        <TableCell>
                          {user.creation_date ? new Date(user.creation_date).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUsers.length > 50 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing 50 of {filteredUsers.length} users
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "bursaries" && (
            <Card>
              <CardHeader>
                <CardTitle>Bursary Organizations</CardTitle>
                <CardDescription>Manage bursary organizations in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {bursaries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bursaries.map((bursary) => (
                        <TableRow key={bursary.unique_id}>
                          <TableCell className="font-medium">{bursary.bursary_name}</TableCell>
                          <TableCell>{bursary.email || "-"}</TableCell>
                          <TableCell>{bursary.total_students || 0}</TableCell>
                          <TableCell>R{(bursary.total_budget || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">No bursaries registered</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "requests" && (
            <Card>
              <CardHeader>
                <CardTitle>All Tutor Requests</CardTitle>
                <CardDescription>View and manage all tutoring requests</CardDescription>
              </CardHeader>
              <CardContent>
                {tutorRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Bursary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tutorRequests.slice(0, 50).map((request) => (
                        <TableRow key={request.unique_id}>
                          <TableCell className="font-medium">
                            {request.student_first_name} {request.student_last_name}
                          </TableCell>
                          <TableCell>{request.request_courses || "Various"}</TableCell>
                          <TableCell>{request.institute_name || "-"}</TableCell>
                          <TableCell>{request.bursary_name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={request.paid ? "default" : "secondary"}>
                              {request.paid ? "Paid" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.creation_date ? new Date(request.creation_date).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">No tutor requests</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Analytics</CardTitle>
                  <CardDescription>Overview of platform performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                      <h4 className="font-medium mb-4">User Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Students</span>
                          <span className="font-bold">{stats.total_students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tutors</span>
                          <span className="font-bold">{stats.total_tutors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bursary Admins</span>
                          <span className="font-bold">
                            {users.filter(u => u.user_type === "bursary_admin").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>System Admins</span>
                          <span className="font-bold">
                            {users.filter(u => u.user_type === "admin").length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-6">
                      <h4 className="font-medium mb-4">Platform Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Requests</span>
                          <span className="font-bold">{stats.total_requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Lessons</span>
                          <span className="font-bold">{stats.total_lessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Bursaries</span>
                          <span className="font-bold">{stats.total_bursaries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate</span>
                          <span className="font-bold">
                            {stats.total_requests > 0
                              ? ((stats.total_lessons / stats.total_requests) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Database Connection</h4>
                    <p className="text-sm text-gray-500 mb-2">Status: Connected to Supabase</p>
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">API Status</h4>
                    <p className="text-sm text-gray-500 mb-2">Backend: Running on port 8081</p>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Authentication</h4>
                    <p className="text-sm text-gray-500 mb-2">Provider: Supabase Auth</p>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
