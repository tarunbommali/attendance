// src/pages/student-view.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { ClipboardCheckIcon } from "lucide-react";
import { useAuth, User } from "../App"; // Import useAuth and User
// No longer need to import rollList, programsData, subjectsData directly for student lookup here
// as we will use the logged-in user's context.

// Interface for the attendance records fetched from the API
interface StudentAttendanceRecord {
  id: string; // Or number, depending on your mock API
  date: string;
  subject: string; // Or subjectName
  subjectCode?: string;
  status: string;
  instructor?: string;
  time?: string;
  duration?: number; // hours
  notes?: string;
}

export default function StudentView() {
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get logged-in user

  // State for attendance data specific to the logged-in student
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>([]);

  // Fetch attendance data for the logged-in student
  const {
    data: fetchedAttendanceData = [],
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useQuery<StudentAttendanceRecord[]>({
    // Using student's registration number as part of the query key for uniqueness
    // and to pass it as a parameter to the mock API.
    queryKey: ['/api/attendance/range', { studentId: user?.id, registrationNumber: user?.registrationNumber }],
    enabled: !!user && user.role === 'student' && !isAuthLoading, // Only fetch if a student is logged in and auth check is done
    // The actual filtering by studentId/registrationNumber will happen in the mock API handler
  });

  useEffect(() => {
    if (fetchedAttendanceData) {
      setStudentAttendance(fetchedAttendanceData);
      if(fetchedAttendanceData.length > 0) {
        toast({
          title: "Attendance records loaded",
          description: `Showing attendance for ${user?.name}.`,
        });
      }
    }
  }, [fetchedAttendanceData, user?.name, toast]);

  useEffect(() => {
    if (attendanceError) {
      toast({
        variant: "destructive",
        title: "Failed to load attendance",
        description: (attendanceError as Error).message || "Could not fetch your attendance records.",
      });
    }
  }, [attendanceError, toast]);


  // Calculate overall attendance statistics from fetched data
  const calculateAttendanceStats = () => {
    if (!studentAttendance || studentAttendance.length === 0) {
      return {
        totalClasses: 0, presentClasses: 0, lateClasses: 0, absentClasses: 0,
        attendanceRate: 0, totalHours: 0, attendedHours: 0,
      };
    }
    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(record => record.status === "present").length;
    const lateClasses = studentAttendance.filter(record => record.status === "late").length;
    const absentClasses = studentAttendance.filter(record => record.status === "absent").length;
    
    const attendanceRate = totalClasses > 0 ? Math.round(((presentClasses + lateClasses) / totalClasses) * 100) : 0;
    
    const totalHours = studentAttendance.reduce((sum, record) => sum + (record.duration || 0), 0);
    const attendedHours = studentAttendance
      .filter(record => record.status === "present" || record.status === "late")
      .reduce((sum, record) => sum + (record.duration || 0), 0);
    
    return {
      totalClasses, presentClasses, lateClasses, absentClasses,
      attendanceRate, totalHours, attendedHours
    };
  };
  
  // Calculate subject-wise attendance from fetched data
  const calculateSubjectStats = () => {
    if (!studentAttendance || studentAttendance.length === 0) return [];

    const subjectMap: { [key: string]: StudentAttendanceRecord[] } = {};
    studentAttendance.forEach(record => {
      if (!subjectMap[record.subject]) {
        subjectMap[record.subject] = [];
      }
      subjectMap[record.subject].push(record);
    });

    return Object.keys(subjectMap).map(subjectName => {
      const subjectClasses = subjectMap[subjectName];
      const totalClasses = subjectClasses.length;
      const presentClasses = subjectClasses.filter(record => record.status === "present").length;
      const lateClasses = subjectClasses.filter(record => record.status === "late").length;
      const absentClasses = subjectClasses.filter(record => record.status === "absent").length;
      
      const attendanceRate = totalClasses > 0 ? Math.round(((presentClasses + lateClasses) / totalClasses) * 100) : 0;
      
      const totalHours = subjectClasses.reduce((sum, record) => sum + (record.duration || 0), 0);
      const attendedHours = subjectClasses
        .filter(record => record.status === "present" || record.status === "late")
        .reduce((sum, record) => sum + (record.duration || 0), 0);
      
      return {
        subject: subjectName, totalClasses, presentClasses, lateClasses, absentClasses,
        attendanceRate, totalHours, attendedHours
      };
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present": return <Badge className="bg-green-500 hover:bg-green-600">Present</Badge>;
      case "late": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Late</Badge>;
      case "absent": return <Badge className="bg-red-500 hover:bg-red-600">Absent</Badge>;
      case "excused": return <Badge className="bg-blue-500 hover:bg-blue-600">Excused</Badge>;
      default: return <Badge variant="secondary">{status || "N/A"}</Badge>;
    }
  };

  if (isAuthLoading || (user && user.role === 'student' && isLoadingAttendance)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-lg">Loading your attendance data...</p>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    // This case should ideally be handled by routing (StudentRoute in App.tsx)
    // but as a fallback:
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This portal is for students. Please log in as a student to view attendance.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const stats = calculateAttendanceStats();
  const subjectStats = calculateSubjectStats();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-2 px-2">
      <header className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-primary text-white p-3 rounded-full"> 
              <ClipboardCheckIcon className="h-8 w-8" />
            </div>
            <div className="flex flex-col ml-3">
            <h1 className="ml-3 text-xl font-bold dark:text-white">Attendly</h1>
            <h4 className="ml-3 text-xl font-thin dark:text-white">JNTU GV</h4>
            </div>
          </div>
          {user && (
            <div className="text-right">
              <p className="font-semibold dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.registrationNumber}</p>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto flex-1 space-y-6">
        {studentAttendance.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Overall Attendance Summary</CardTitle>
                <CardDescription>Your attendance performance across all subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Stats Cards ... */}
                  <StatDisplay label="Attendance Rate" value={`${stats.attendanceRate}%`} />
                  <StatDisplay label="Total Classes" value={stats.totalClasses.toString()} />
                  <StatDisplay label="Attended" value={(stats.presentClasses + stats.lateClasses).toString()} />
                  <StatDisplay label="Missed" value={stats.absentClasses.toString()} />
                </div>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatDisplay label="Total Hours" value={stats.totalHours.toFixed(1)} />
                  <StatDisplay label="Hours Attended" value={stats.attendedHours.toFixed(1)} />
                  <StatDisplay label="Hours Missed" value={(stats.totalHours - stats.attendedHours).toFixed(1)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Total Classes</TableHead>
                        <TableHead className="text-center">Attendance</TableHead>
                        <TableHead className="text-center">Hours Attended (Total)</TableHead>
                        <TableHead className="text-right">Standing</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectStats.map((subjectData, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{subjectData.subject}</TableCell>
                          <TableCell className="text-center">{subjectData.totalClasses}</TableCell>
                          <TableCell className="text-center">{subjectData.attendanceRate}%</TableCell>
                          <TableCell className="text-center">{subjectData.attendedHours.toFixed(1)} / {subjectData.totalHours.toFixed(1)}</TableCell>
                          <TableCell className="text-right">
                            {subjectData.attendanceRate >= 75 ? <Badge className="bg-green-500 hover:bg-green-600">Good</Badge> : 
                             subjectData.attendanceRate >= 60 ? <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge> : 
                             <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Detailed Attendance Log</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((record, index) => (
                        <TableRow key={record.id || index}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>{record.time || "N/A"}</TableCell>
                          <TableCell>{record.instructor || "N/A"}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button variant="outline" onClick={() => window.print()}>Print Report</Button>
              </CardFooter>
            </Card>
          </>
        ) : (
           !isLoadingAttendance && ( // Only show "No records" if not loading
            <Card>
              <CardContent className="py-10 text-center">
                <ClipboardCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No Attendance Records</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We couldn't find any attendance records for you yet.
                </p>
              </CardContent>
            </Card>
           )
        )}
      </main>
    </div>
  );
}

// Helper component for displaying stats
const StatDisplay = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-1 text-3xl font-semibold text-primary dark:text-primary-foreground">{value}</div>
  </div>
);