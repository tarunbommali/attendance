import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import { DateFilter } from "../components/date-filter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { Download, Filter, Calendar, BarChart3, Users, BookOpen } from "lucide-react";
import { useAuth } from "../App";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Student {
  id: number;
  name: string;
  profileImage?: string;
  email: string;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: string;
  recordedBy: number;
  notes?: string;
  studentName?: string;
  courseName?: string;
}

export default function AttendanceReports() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>("01/04/2023");
  const [endDate, setEndDate] = useState<string>("30/04/2023");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [reportType, setReportType] = useState<string>("course");
  
  const { user } = useAuth();
  
  // Fetch courses - for faculty only show their assigned courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses', user?.role === 'faculty' ? { facultyId: user?.id } : undefined],
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/users', { role: 'student' }],
  });

  // Fetch attendance data based on date range and user role
  const { data: attendanceData = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: [
      '/api/attendance/range', 
      { 
        startDate, 
        endDate,
        // For faculty, only fetch attendance for their courses
        ...(user?.role === 'faculty' ? { facultyId: user.id } : {})
      }
    ],
    enabled: !!startDate && !!endDate,
  });
  
  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExportReport = () => {
    toast({
      title: "Report exported",
      description: "The attendance report has been exported successfully.",
    });
  };

  // Filter attendance data based on selected course and/or student
  const filteredAttendance = attendanceData.filter((record: AttendanceRecord) => {
    if (selectedCourse && reportType === "course") {
      // Get class ids for the selected course
      const classesForCourse = [1, 2, 3]; // Simplified - would need to fetch this data
      return classesForCourse.includes(record.classId);
    }
    
    if (selectedStudent && reportType === "student") {
      return record.studentId === selectedStudent;
    }
    
    return true;
  });

  // Group data for charts
  const statusCounts = {
    present: filteredAttendance.filter((record: AttendanceRecord) => record.status === "present").length,
    late: filteredAttendance.filter((record: AttendanceRecord) => record.status === "late").length,
    absent: filteredAttendance.filter((record: AttendanceRecord) => record.status === "absent").length,
    excused: filteredAttendance.filter((record: AttendanceRecord) => record.status === "excused").length,
  };

  const pieChartData = [
    { name: "Present", value: statusCounts.present, color: "#10b981" },
    { name: "Late", value: statusCounts.late, color: "#f59e0b" },
    { name: "Absent", value: statusCounts.absent, color: "#ef4444" },
    { name: "Excused", value: statusCounts.excused, color: "#3b82f6" },
  ];

  // Monthly trend data (simplified)
  const monthlyTrendData = [
    { month: "Jan", present: 85, late: 10, absent: 5 },
    { month: "Feb", present: 80, late: 12, absent: 8 },
    { month: "Mar", present: 78, late: 15, absent: 7 },
    { month: "Apr", present: 82, late: 10, absent: 8 },
    { month: "May", present: 88, late: 7, absent: 5 },
    { month: "Jun", present: 90, late: 5, absent: 5 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="present">Present</Badge>;
      case "late":
        return <Badge variant="late">Late</Badge>;
      case "absent":
        return <Badge variant="absent">Absent</Badge>;
      case "excused":
        return <Badge variant="outline">Excused</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAttendanceRate = () => {
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    
    return Math.round((statusCounts.present / total) * 100);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analyze and export attendance data for students and courses.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={handleExportReport}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter onDateRangeChange={handleDateRangeChange} />

      {/* Report Type Tabs */}
      <Tabs 
        defaultValue="course" 
        value={reportType} 
        onValueChange={setReportType}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="course" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Course Report
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Student Report
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="course" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Course
                  </label>
                  <Select 
                    value={selectedCourse?.toString() || ""} 
                    onValueChange={(value) => setSelectedCourse(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="secondary">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="student" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Student
                  </label>
                  <Select 
                    value={selectedStudent?.toString() || ""} 
                    onValueChange={(value) => setSelectedStudent(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="secondary">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reports and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Attendance Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Attendance Overview</CardTitle>
              <CardDescription>
                Monthly attendance trend
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                  <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Attendance Summary</CardTitle>
              <CardDescription>
                Overall attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">{getAttendanceRate()}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</div>
                </div>
                
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">{statusCounts.present}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Present</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">{statusCounts.late}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Late</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-red-600 dark:text-red-400">{statusCounts.absent}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Absent</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">{statusCounts.excused}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Excused</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Attendance Records */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b">
          <div>
            <CardTitle>Detailed Attendance Records</CardTitle>
            <CardDescription>
              List of all attendance records for the selected period
            </CardDescription>
          </div>
          <div className="mt-2 sm:mt-0">
            <div className="relative">
              <Input 
                placeholder="Search records..." 
                className="pr-8 w-full sm:w-64"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading attendance records...</p>
            </div>
          ) : filteredAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course/Class</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <img 
                          className="h-8 w-8 rounded-full" 
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                          alt="Student profile" 
                        />
                        <span>{record.studentName || `Student ${record.studentId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.courseName || `Class ${record.classId}`}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">No attendance records found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try changing your filters or date range.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredAttendance.length} records
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" disabled className="mx-1">Previous</Button>
            <Button variant="outline" size="sm" className="mx-1">1</Button>
            <Button variant="outline" size="sm" disabled className="mx-1">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </Layout>
  );
}
