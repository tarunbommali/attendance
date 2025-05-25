// src/pages/StudentAttendanceView.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { PrinterIcon, ClipboardCheckIcon } from "lucide-react";
import { User } from "../../App";

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
}

interface StudentAttendanceViewProps {
  user: User; // Expect the logged-in user object as a prop
}

export default function StudentAttendanceView({ user }: StudentAttendanceViewProps) {
  const { toast } = useToast();
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>([]);

  const {
    data: fetchedAttendanceData = [],
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useQuery<StudentAttendanceRecord[]>({
    queryKey: [ "/api/attendance/range", { studentId: user.id, registrationNumber: user.registrationNumber, department: user.department }],
    // 'enabled' is true by default when queryKey changes and is not undefined.
    // The parent StudentDashboard already ensures user exists and is a student.
  });

  useEffect(() => {
    if (fetchedAttendanceData) {
      setStudentAttendance(fetchedAttendanceData);
    }
  }, [fetchedAttendanceData]);

  useEffect(() => {
    if (attendanceError) {
      toast({
        variant: "destructive",
        title: "Failed to load attendance",
        description: (attendanceError as Error).message || "Could not fetch records.",
      });
    }
  }, [attendanceError, toast]);

  // calculateAttendanceStats, calculateSubjectStats, formatDate, getStatusBadge (as in your student-view.tsx)
  // ... (Copy these helper functions from your current student-view.tsx here) ...
  // Make sure to handle the case where studentAttendance is empty in these functions.
  const calculateAttendanceStats = () => {
    if (!studentAttendance || studentAttendance.length === 0) {
      return { totalClasses: 0, presentClasses: 0, lateClasses: 0, absentClasses: 0, excusedClasses: 0, attendanceRate: 0, totalHours: 0, attendedHours: 0 };
    }
    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(r => r.status === "present").length;
    const lateClasses = studentAttendance.filter(r => r.status === "late").length;
    const absentClasses = studentAttendance.filter(r => r.status === "absent").length;
    const excusedClasses = studentAttendance.filter(r => r.status === "excused").length;
    const effectiveTotal = totalClasses - excusedClasses;
    const attendedForRate = presentClasses + lateClasses;
    const attendanceRate = effectiveTotal > 0 ? Math.round((attendedForRate / effectiveTotal) * 100) : 100;
    const totalHours = studentAttendance.reduce((s, r) => s + (r.duration || 0), 0);
    const attendedHours = studentAttendance.filter(r => r.status === "present" || r.status === "late").reduce((s, r) => s + (r.duration || 0), 0);
    return { totalClasses, presentClasses, lateClasses, absentClasses, excusedClasses, attendanceRate, totalHours, attendedHours };
  };

  const calculateSubjectStats = () => {
     if (!studentAttendance || studentAttendance.length === 0) return [];
    const subjectMap: { [key: string]: StudentAttendanceRecord[] } = {};
    studentAttendance.forEach(record => {
      if (!subjectMap[record.subject]) subjectMap[record.subject] = [];
      subjectMap[record.subject].push(record);
    });
    return Object.keys(subjectMap).map(subjectName => {
      const classes = subjectMap[subjectName];
      const total = classes.length;
      const present = classes.filter(r => r.status === "present").length;
      const late = classes.filter(r => r.status === "late").length;
      const absent = classes.filter(r => r.status === "absent").length;
      const excused = classes.filter(r => r.status === "excused").length;
      const effectiveTotal = total - excused;
      const attendedForRate = present + late;
      const rate = effectiveTotal > 0 ? Math.round((attendedForRate / effectiveTotal) * 100) : 100;
      const totalHrs = classes.reduce((s, r) => s + (r.duration || 0), 0);
      const attendedHrs = classes.filter(r => r.status === "present" || r.status === "late").reduce((s, r) => s + (r.duration || 0), 0);
      return { subject: subjectName, totalClasses: total, presentClasses: present, lateClasses: late, absentClasses: absent, excusedClasses: excused, attendanceRate: rate, totalHours: totalHrs, attendedHours: attendedHrs };
    });
  };

  const formatDate = (dateString: string) => { /* ... */ return new Date(dateString).toLocaleDateString("en-GB", { year: 'numeric', month: 'short', day: '2-digit' }); };
  const getStatusBadge = (status: string) => { /* ... as before ... */ 
    switch (status?.toLowerCase()) {
      case "present": return <Badge className="bg-green-100 text-green-700 border border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600">Present</Badge>;
      case "late": return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-600">Late</Badge>;
      case "absent": return <Badge className="bg-red-100 text-red-700 border border-red-300 dark:bg-red-700/20 dark:text-red-300 dark:border-red-600">Absent</Badge>;
      case "excused": return <Badge className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-700/20 dark:text-blue-300 dark:border-blue-600">Excused</Badge>;
      default: return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };
  const currentAcademicYear = "2024-2025"; // Placeholder
  const stats = calculateAttendanceStats();
  const subjectStats = calculateSubjectStats();


  if (isLoadingAttendance) {
    return <div className="text-center p-10">Loading attendance records...</div>;
  }

  return (
    <div className="space-y-6 print:space-y-4"> {/* Adjust print spacing if needed */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:border-b print:border-gray-300">
            <div className="print:text-center print:mb-4 hidden print:block"> {/* Print only college header */}
                <h1 className="text-xl font-bold">Attendance Report</h1>
                <p className="text-sm">JNTU-GV UCEV</p>
            </div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm print:text-xs">
                <div><strong>Student:</strong> {user.name}</div>
                <div><strong>Reg. No:</strong> {user.registrationNumber}</div>
                <div><strong>Dept:</strong> {user.department}</div>
                <div><strong>Semester:</strong> {user.currentSemester}</div>
                {/* <div className="print:hidden"><strong>Academic Year:</strong> {currentAcademicYear}</div> */}
                {/* <div className="print:hidden"><strong>Report As Of:</strong> {formatDate(new Date().toISOString())}</div> */}
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 print:p-2">
            {studentAttendance.length > 0 ? (
              <div className="space-y-6">
                {/* Overall Summary Section */}
                 <section>
                  <h3 className="text-lg font-semibold mb-2 print:text-base">Overall Summary</h3>
                  {/* ... StatDisplayReportCard grid ... */}
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 print:gap-1">
                    <StatDisplayReportCard label="Attendance Rate" value={`${stats.attendanceRate}%`} highlight={stats.attendanceRate < 75} />
                    <StatDisplayReportCard label="Total Classes" value={stats.totalClasses.toString()} />
                    <StatDisplayReportCard label="Attended" value={(stats.presentClasses + stats.lateClasses).toString()} />
                    <StatDisplayReportCard label="Absent" value={stats.absentClasses.toString()} highlight={stats.absentClasses > 0} />
                    <StatDisplayReportCard label="Late" value={stats.lateClasses.toString()} />
                    <StatDisplayReportCard label="Excused" value={stats.excusedClasses.toString()} />
                  </div>
                </section>
                {/* Subject-wise Section */}
                <section>
                    <h3 className="text-lg font-semibold mt-4 mb-2 print:text-base">Subject-wise Performance</h3>
                    {/* ... Subject table ... */}
                    <div className="overflow-x-auto">
                    <Table className="print:text-xs">
                      <TableHeader><TableRow>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="text-center font-semibold">Total</TableHead>
                          <TableHead className="text-center font-semibold">Attd.</TableHead>
                          <TableHead className="text-center font-semibold">Abs.</TableHead>
                          <TableHead className="text-center font-semibold">Late</TableHead>
                          <TableHead className="text-center font-semibold">Exc.</TableHead>
                          <TableHead className="text-center font-semibold">Rate</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {subjectStats.map((s) => (
                          <TableRow key={s.subject}>
                            <TableCell className="font-medium">{s.subject}</TableCell>
                            <TableCell className="text-center">{s.totalClasses}</TableCell>
                            <TableCell className="text-center">{s.presentClasses + s.lateClasses}</TableCell>
                            <TableCell className="text-center">{s.absentClasses}</TableCell>
                            <TableCell className="text-center">{s.lateClasses}</TableCell>
                            <TableCell className="text-center">{s.excusedClasses}</TableCell>
                            <TableCell className={`text-center font-semibold ${s.attendanceRate < 75 ? 'text-red-500' : ''}`}>{s.attendanceRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
                {/* Detailed Log Section */}
                <section>
                    <h3 className="text-lg font-semibold mt-4 mb-2 print:text-base">Detailed Log</h3>
                     {/* ... Detailed log table ... */}
                     <div className="overflow-x-auto max-h-[300px] print:max-h-none">
                        <Table className="print:text-xs">
                          <TableHeader><TableRow>
                            <TableHead className="font-semibold">Date</TableHead><TableHead className="font-semibold">Subject</TableHead>
                            <TableHead className="font-semibold">Time</TableHead><TableHead className="font-semibold">Instructor</TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {studentAttendance.map((record) => (
                              <TableRow key={record.id}>
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
                </section>
              </div>
            ) : (
              <div className="py-10 text-center">
                <ClipboardCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No Attendance Records</h3>
                <p className="mt-1 text-sm text-gray-500">No records found for the selected period or criteria.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <PrinterIcon className="mr-2 h-4 w-4" /> Print This Report
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}

// Helper component for displaying stats (can be moved to a shared file)
const StatDisplayReportCard = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`p-2.5 rounded-md print:p-1.5 ${highlight ? 'bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-700' : 'bg-gray-50 dark:bg-gray-700/20 border border-gray-200 dark:border-gray-600'} print:border print:border-gray-400`}>
    <div className="text-xs font-medium text-muted-foreground print:text-sm">{label}</div>
    <div className={`mt-0.5 text-lg font-semibold ${highlight ? 'text-red-600 dark:text-red-300' : 'text-foreground'} print:text-base`}>{value}</div>
  </div>
);