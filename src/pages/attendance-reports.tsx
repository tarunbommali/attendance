// src/pages/attendance-reports.tsx
import { useState, useEffect } from "react"; // Ensure useEffect is imported
import { useQuery } from "@tanstack/react-query";
// import { Layout } from "../components/layout";
import { Layout } from "../components/layout";
import { DateFilter } from "../components/date-filter"; // Assuming this component exists
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import {
  Download,
  Filter,
  Calendar,
  BarChart3,
  Users,
  BookOpen,
} from "lucide-react";
// Update the import path below to the actual location of your useAuth hook/context and User type.
// For example, if they are in src/hooks/useAuth.ts:
import { useAuth, User } from "../App";
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
  Cell,
} from "recharts";

interface CourseFromAPI {
  // Renamed to avoid conflict if Course is defined elsewhere
  id: number | string; // Course ID can be string like 'MCA103' or number
  name: string;
  code: string;
}

interface StudentFromAPI {
  // Renamed
  id: number;
  name: string;
  // profileImage?: string; // Add if used
  // email: string; // Add if used
}

interface StudentAttendanceRecord {
  id: string;
  date: string;
  subject: string;
  subjectCode?: string;
  status: string;
  instructor?: string;
  time?: string;
  duration?: number;
  notes?: string;
  studentName?: string;
  courseName?: string; // Same as subject in current mock
  // Ensure this matches what your mock API enrichment provides
}

export default function AttendanceReports() {
  const { toast } = useToast();
  // Default to a range that includes your mock data (e.g., Jan 2025 - May 2025)
  // Use YYYY-MM-DD format
  const [startDate, setStartDate] = useState<string>(
    new Date(2025, 0, 1).toISOString().split("T")[0]
  ); // "2025-01-01"
  const [endDate, setEndDate] = useState<string>(
    new Date(2025, 4, 31).toISOString().split("T")[0]
  ); // "2025-05-31"

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null); // Course ID can be string
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [reportType, setReportType] = useState<string>("course");

  const { user } = useAuth();

  const { data: courses = [] } = useQuery<CourseFromAPI[]>({
    queryKey: [
      "/api/courses",
      user?.role === "faculty"
        ? { facultyId: user?.id, department: user?.department }
        : {},
    ],
  });

  const { data: students = [] } = useQuery<StudentFromAPI[]>({
    queryKey: [
      "/api/users",
      { role: "student", department: user?.department || undefined },
    ], // Optionally filter by user's department
  });

  const { data: attendanceData = [], isLoading: isLoadingAttendance } =
    useQuery<StudentAttendanceRecord[]>({
      queryKey: [
        "/api/attendance/range",
        {
          startDate,
          endDate,
          department: user?.department, // Add department context if available and relevant for faculty
          // For faculty, you might filter by their courses or department in the mock handler based on user.id or user.department
          // For admin, no specific filter here, they see all (or can filter in UI)
          // Student role won't typically access this page; they use /student-view
        },
      ],
      enabled: !!startDate && !!endDate && !!user, // Ensure user context is available if needed for filtering
    });

  // Ensure your DateFilter component calls this with Date objects or YYYY-MM-DD strings
  const handleDateRangeChange = (
    start: Date | string | undefined,
    end: Date | string | undefined
  ) => {
    if (start) {
      setStartDate(
        typeof start === "string" ? start : start.toISOString().split("T")[0]
      );
    }
    if (end) {
      setEndDate(
        typeof end === "string" ? end : end.toISOString().split("T")[0]
      );
    }
  };

  const handleExportReport = () => {
    toast({
      title: "Report exported",
      description: "The attendance report has been exported successfully.",
    });
    // Actual export logic would go here
  };

  const filteredAttendance = attendanceData.filter(
    (record: StudentAttendanceRecord) => {
      let courseMatch = true;
      let studentMatch = true;

      if (reportType === "course" && selectedCourse) {
        // Assuming record.subjectCode or record.subject can be used to link to course
        // This needs careful alignment with your data. If course ID is not in attendance record,
        // this filtering might be tricky without fetching class details first.
        // For mock, let's assume record.subjectCode can match selectedCourse (which is course.code)
        const courseDetails = courses.find(
          (c) => c.id === selectedCourse || c.code === selectedCourse
        );
        courseMatch =
          record.subjectCode === courseDetails?.code ||
          record.subject === courseDetails?.name;
      }

      if (reportType === "student" && selectedStudent) {
        // studentId is not directly in StudentAttendanceRecord, but studentName is.
        // This is problematic if studentName is not unique.
        // Better to have studentId in StudentAttendanceRecord if filtering by student.
        // Assuming your enrichment adds studentId to the records for this to work properly.
        // For now, let's assume studentName is sufficient for mock or use record.studentId if you add it.
        // const studentDetails = students.find(s => s.id === selectedStudent);
        // studentMatch = record.studentName === studentDetails?.name;
        // If your mock API for /api/attendance/range can filter by studentId,
        // then the fetched attendanceData might already be for the selected student if you re-trigger the query.
        // Or, if not, and studentId is on the record:
        // studentMatch = (record as any).studentId === selectedStudent;
        // For now, this client-side filter might not be needed if API handles it.
        // If filtering here, ensure the data is available.
      }

      return courseMatch && studentMatch;
    }
  );

  // ... (rest of your component: statusCounts, pieChartData, getStatusBadge, formatDate, UI rendering) ...
  // Ensure StudentAttendanceRecord matches data from mock API

  const statusCounts = {
    present: filteredAttendance.filter((record) => record.status === "present")
      .length,
    late: filteredAttendance.filter((record) => record.status === "late")
      .length,
    absent: filteredAttendance.filter((record) => record.status === "absent")
      .length,
    excused: filteredAttendance.filter((record) => record.status === "excused")
      .length,
  };

  const pieChartData = [
    { name: "Present", value: statusCounts.present, color: "#10b981" },
    { name: "Late", value: statusCounts.late, color: "#f59e0b" },
    { name: "Absent", value: statusCounts.absent, color: "#ef4444" },
    { name: "Excused", value: statusCounts.excused, color: "#3b82f6" },
  ].filter((item) => item.value > 0);

  const monthlyTrendData = [
    /* Placeholder, ideally derive from filteredAttendance */
    { month: "Jan", present: 85, absent: 5 },
    { month: "Feb", present: 80, absent: 8 },
    { month: "Mar", present: 78, absent: 7 },
  ];

  const getAttendanceRate = () => {
    const totalConsidered =
      statusCounts.present + statusCounts.late + statusCounts.absent;
    if (totalConsidered === 0) return 0;
    return Math.round(
      ((statusCounts.present + statusCounts.late) / totalConsidered) * 100
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Late</Badge>
        );
      case "absent":
        return <Badge className="bg-red-500 hover:bg-red-600">Absent</Badge>;
      case "excused":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Excused</Badge>;
      default:
        return <Badge variant="secondary">{status || "N/A"}</Badge>;
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      // Example: 23/May/2025
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyze and export attendance data.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>
      </div>
      <DateFilter onDateRangeChange={handleDateRangeChange} />
      {/* Pass initial dates if DateFilter supports it */}
      <Tabs
        defaultValue="course"
        value={reportType}
        onValueChange={setReportType}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="course">
            <BookOpen className="mr-2 h-4 w-4" />
            Course Report
          </TabsTrigger>
          <TabsTrigger value="student">
            <Users className="mr-2 h-4 w-4" />
            Student Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Select Course
                  </label>
                  <Select
                    value={selectedCourse || "_ALL_COURSES_"} // Use a placeholder value or null for the state
                    onValueChange={(value) => {
                      if (value === "_ALL_COURSES_") {
                        setSelectedCourse(null);
                      } else {
                        setSelectedCourse(value); // value is course.id (string)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_ALL_COURSES_">All Courses</SelectItem>
                      {/* Changed value */}
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          
                          {/* Ensure course.id is string */}
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <Button variant="secondary"><Filter className="mr-2 h-4 w-4" />Apply Filter</Button> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Select Student
                  </label>
                  <Select
                    value={selectedStudent?.toString() || "_ALL_STUDENTS_"} // Use a placeholder value or null for the state
                    onValueChange={(value) => {
                      if (value === "_ALL_STUDENTS_") {
                        setSelectedStudent(null);
                      } else {
                        setSelectedStudent(Number(value));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_ALL_STUDENTS_">
                        All Students
                      </SelectItem>
                      {/* Changed value */}
                      {students.map((student) => (
                        <SelectItem
                          key={student.id}
                          value={student.id.toString()}
                        >
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <Button variant="secondary"><Filter className="mr-2 h-4 w-4" />Apply Filter</Button> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Monthly trend (sample)</CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="present"
                    stackId="a"
                    fill="#10b981"
                    name="Present"
                  />
                  <Bar
                    dataKey="absent"
                    stackId="a"
                    fill="#ef4444"
                    name="Absent"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {getAttendanceRate()}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Attendance Rate
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Stats counts can be displayed here if needed */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detailed Attendance Records</CardTitle>
          <CardDescription>
            Showing {filteredAttendance.length} records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingAttendance ? (
            <div className="p-10 text-center">Loading records...</div>
          ) : filteredAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDateForDisplay(record.date)}</TableCell>
                    <TableCell>
                      {record.studentName || `ID: ${(record as any).studentId}`}
                    </TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>{record.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center">
              No attendance records found for the selected criteria.
            </div>
          )}
        </CardContent>
        {/* Footer with pagination can be added here */}
      </Card>
    </Layout>
  );
}
