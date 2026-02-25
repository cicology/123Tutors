"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BookOpen, Users, TrendingUp, Award, Target, ArrowLeft } from "lucide-react"

interface CourseAnalyticsProps {
  course?: any
  onBack?: () => void
}

const courseData = [
  {
    id: 1,
    name: "Advanced Mathematics",
    code: "MATH301",
    totalStudents: 12,
    activeStudents: 12,
    completionRate: 70,
    averageGrade: 85,
    passRate: 92,
    dropoutRate: 8,
    monthlyProgress: [
      { month: "Jan", enrolled: 12, completed: 1, dropped: 0 },
      { month: "Feb", enrolled: 12, completed: 2, dropped: 0 },
      { month: "Mar", enrolled: 12, completed: 4, dropped: 0 },
      { month: "Apr", enrolled: 12, completed: 6, dropped: 0 },
      { month: "May", enrolled: 12, completed: 8, dropped: 0 },
      { month: "Jun", enrolled: 12, completed: 9, dropped: 0 },
    ],
  },
  {
    id: 2,
    name: "Physics Fundamentals",
    code: "PHYS201",
    totalStudents: 8,
    activeStudents: 8,
    completionRate: 60,
    averageGrade: 82,
    passRate: 88,
    dropoutRate: 12,
    monthlyProgress: [
      { month: "Jan", enrolled: 8, completed: 0, dropped: 0 },
      { month: "Feb", enrolled: 8, completed: 1, dropped: 0 },
      { month: "Mar", enrolled: 8, completed: 2, dropped: 0 },
      { month: "Apr", enrolled: 8, completed: 3, dropped: 0 },
      { month: "May", enrolled: 8, completed: 4, dropped: 0 },
      { month: "Jun", enrolled: 8, completed: 5, dropped: 0 },
    ],
  },
  {
    id: 3,
    name: "Computer Science Basics",
    code: "CS101",
    totalStudents: 15,
    activeStudents: 15,
    completionRate: 90,
    averageGrade: 88,
    passRate: 95,
    dropoutRate: 5,
    monthlyProgress: [
      { month: "Jan", enrolled: 15, completed: 2, dropped: 0 },
      { month: "Feb", enrolled: 15, completed: 4, dropped: 0 },
      { month: "Mar", enrolled: 15, completed: 7, dropped: 0 },
      { month: "Apr", enrolled: 15, completed: 10, dropped: 0 },
      { month: "May", enrolled: 15, completed: 12, dropped: 0 },
      { month: "Jun", enrolled: 15, completed: 14, dropped: 0 },
    ],
  },
]

const performanceData = [
  { course: "Advanced Mathematics", performance: 85, students: 12 },
  { course: "Physics Fundamentals", performance: 82, students: 8 },
  { course: "Computer Science Basics", performance: 88, students: 15 },
  { course: "Medicine", performance: 91, students: 28 },
  { course: "Law", performance: 79, students: 35 },
]

const gradeDistribution = [
  { grade: "A (90-100)", count: 45, color: "#10B981" },
  { grade: "B (80-89)", count: 68, color: "#3B82F6" },
  { grade: "C (70-79)", count: 32, color: "#F59E0B" },
  { grade: "D (60-69)", count: 15, color: "#EF4444" },
  { grade: "F (0-59)", count: 8, color: "#6B7280" },
]

export function CourseAnalytics({ course, onBack }: CourseAnalyticsProps) {
  console.log('CourseAnalytics received course:', course)
  console.log('Course fields:', {
    moduleName: course?.moduleName,
    moduleCode: course?.moduleCode,
    moduleLevel: course?.moduleLevel,
    moduleCredits: course?.moduleCredits,
    uniqueId: course?.uniqueId
  })
  
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (course) {
      // Find matching course in courseData or create analytics data for the passed course
      const matchingCourse = courseData.find((c) => c.name === (course.moduleName || course.name) || c.code === (course.moduleCode || course.code))
      if (matchingCourse) return matchingCourse

      // Create analytics data for the passed course
      return {
        id: course.id || course.uniqueId || 999,
        name: course.moduleName || course.name || 'Unknown Course',
        code: course.moduleCode || course.code || 'N/A',
        totalStudents: course.students || 0,
        activeStudents: course.students || 0,
        completionRate: course.budgetPercentage || 70,
        averageGrade: 85,
        passRate: 92,
        dropoutRate: 8,
        monthlyProgress: [
          {
            month: "Jan",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.1),
            dropped: 0,
          },
          {
            month: "Feb",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.2),
            dropped: 0,
          },
          {
            month: "Mar",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.4),
            dropped: 0,
          },
          {
            month: "Apr",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.6),
            dropped: 0,
          },
          {
            month: "May",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.7),
            dropped: 0,
          },
          {
            month: "Jun",
            enrolled: course.students || 0,
            completed: Math.floor((course.students || 0) * 0.8),
            dropped: 0,
          },
        ],
      }
    }
    return courseData[0]
  })
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <div className="space-y-6">
      {/* Course Selection and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-[#FF0090] text-[#FF0090] hover:bg-[#FF0090] hover:text-white bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCourse?.name ? `${selectedCourse.name} Analytics` : "Course Analytics"}
            </h2>
            <p className="text-gray-600">
              {selectedCourse?.code ? `${selectedCourse.code} - ` : ""}Detailed performance metrics
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {!course && (
            <Select
              value={selectedCourse.id.toString()}
              onValueChange={(value) => {
                const courseItem = courseData.find((c) => c.id === Number.parseInt(value))
                if (courseItem) setSelectedCourse(courseItem)
              }}
            >
              <SelectTrigger className="w-48 border-[#FF0090] focus:border-[#FF0090]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseData.map((courseItem) => (
                  <SelectItem key={courseItem.id} value={courseItem.id.toString()}>
                    {courseItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 border-[#FF0090] focus:border-[#FF0090]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-[#FF0090]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF0090]">{selectedCourse?.totalStudents || 0}</div>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {selectedCourse?.activeStudents || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-[#FF0090]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF0090]">{selectedCourse?.completionRate || 0}%</div>
            <Progress value={selectedCourse?.completionRate || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-[#FF0090]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF0090]">{selectedCourse?.averageGrade || 0}%</div>
            <Badge
              variant={(selectedCourse?.averageGrade || 0) >= 85 ? "default" : "secondary"}
              className={(selectedCourse?.averageGrade || 0) >= 85 ? "bg-[#FF0090] text-white" : ""}
            >
              {(selectedCourse?.averageGrade || 0) >= 85 ? "Excellent" : "Good"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pass Rate</CardTitle>
            <BookOpen className="h-4 w-4 text-[#FF0090]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF0090]">{selectedCourse?.passRate || 0}%</div>
            <p className="text-xs text-gray-600">{selectedCourse?.dropoutRate || 0}% dropout rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Chart */}
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Monthly Progress</CardTitle>
            <CardDescription className="text-gray-600">Student enrollment and completion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedCourse?.monthlyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #FF0090",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="enrolled" stroke="#FF0090" strokeWidth={2} name="Enrolled" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
                <Line type="monotone" dataKey="dropped" stroke="#EF4444" strokeWidth={2} name="Dropped" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Grade Distribution</CardTitle>
            <CardDescription className="text-gray-600">Grade breakdown for this course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {!course && (
        <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Course Performance Comparison</CardTitle>
            <CardDescription className="text-gray-600">Average performance across different courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #FF0090",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="performance" fill="#FF0090" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Course Metrics */}
      <Card className="bg-white border-[#FF0090] border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {course ? "Course Performance Details" : "All Courses Overview"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {course ? "Detailed metrics for this specific course" : "Comprehensive course performance data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FF0090]">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Completion</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Avg Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Pass Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {(course ? [selectedCourse] : courseData).map((courseItem) => (
                  <tr key={courseItem.id} className="border-b border-gray-100 hover:bg-[#FF0090]/5">
                    <td className="py-3 px-4 font-medium text-gray-900">{courseItem.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {courseItem.activeStudents}/{courseItem.totalStudents}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={courseItem.completionRate} className="w-16 h-2" />
                        <span className="text-sm text-gray-600">{courseItem.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{courseItem.averageGrade}%</td>
                    <td className="py-3 px-4 text-gray-600">{courseItem.passRate}%</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={courseItem.passRate >= 90 ? "default" : "secondary"}
                        className={courseItem.passRate >= 90 ? "bg-[#FF0090] text-white" : ""}
                      >
                        {courseItem.passRate >= 90 ? "Excellent" : "Good"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
