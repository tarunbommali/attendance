import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { formatTime } from "../lib/utils";

interface AttendanceEntry {
  id: number;
  studentId: number;
  studentName: string;
  profileImage: string;
  course: string;
  status: string;
  time: string;
  date: string;
}

export function RecentAttendance() {
  const { data: attendanceData, isLoading, error } = useQuery<AttendanceEntry[]>({
    queryKey: ['/api/dashboard/recent-attendance'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Recent Attendance Entries</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p>Loading attendance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !attendanceData) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Recent Attendance Entries</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p className="text-red-500">Failed to load attendance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="present">Present</Badge>;
      case 'absent':
        return <Badge variant="absent">Absent</Badge>;
      case 'late':
        return <Badge variant="late">Late</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-start border-b">
        <div>
          <CardTitle>Recent Attendance Entries</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </div>
        <Button variant="link" className="text-primary-600 dark:text-primary-400 p-0">
          View all
        </Button>
      </CardHeader>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
        {attendanceData.map((entry: AttendanceEntry) => (
          <CardContent key={entry.id} className="px-5 py-4 flex items-center">
            <img 
              className="h-10 w-10 rounded-full" 
              src={entry.profileImage} 
              alt={`${entry.studentName} profile`} 
            />
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.studentName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{entry.course}</p>
                </div>
                {getStatusBadge(entry.status)}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Today, {entry.time}</p>
            </div>
          </CardContent>
        ))}
      </div>
    </Card>
  );
}
