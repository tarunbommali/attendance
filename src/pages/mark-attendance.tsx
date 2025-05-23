import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { DateFilter } from "@/components/date-filter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  courseId: number;
  startTime: string;
  endTime: string;
  roomNumber: string;
  day: string;
}

interface Student {
  id: number;
  name: string;
  profileImage?: string;
  email: string;
}

interface AttendanceRecord {
  id?: number;
  studentId: number;
  classId: number;
  date: string;
  status: string;
  recordedBy: number;
  notes?: string;
}

export default function MarkAttendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [studentsAttendance, setStudentsAttendance] = useState<{ [key: number]: string }>({});
  const [notes, setNotes] = useState<{ [key: number]: string }>({});

  // Fetch courses - for faculty only show their assigned courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses', user?.role === 'faculty' ? { facultyId: user?.id } : undefined],
  });

  // Fetch classes for selected course
  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/classes/course', selectedCourse],
    enabled: !!selectedCourse,
  });

  // Fetch enrolled students for selected course
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments/course', selectedCourse],
    enabled: !!selectedCourse,
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/users', { role: 'student' }],
  });

  // Fetch existing attendance records
  const { data: existingAttendance = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/attendance/class', selectedClass, 'date', attendanceDate],
    enabled: !!selectedClass && !!attendanceDate,
  });

  // Mutation for submitting attendance
  const submitAttendanceMutation = useMutation({
    mutationFn: async (attendance: AttendanceRecord) => {
      const result = await apiRequest("POST", "/api/attendance", attendance);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/class', selectedClass, 'date', attendanceDate] });
    }
  });

  // Populate studentsAttendance with existing data when available
  useEffect(() => {
    if (existingAttendance.length > 0) {
      const attendanceMap: { [key: number]: string } = {};
      const notesMap: { [key: number]: string } = {};

      existingAttendance.forEach(record => {
        attendanceMap[record.studentId] = record.status;
        if (record.notes) {
          notesMap[record.studentId] = record.notes;
        }
      });

      setStudentsAttendance(attendanceMap);
      setNotes(notesMap);

      toast({
        title: "Attendance records loaded",
        description: "Existing attendance records for this class have been loaded.",
      });
    } else {
      // Reset if no existing records
      setStudentsAttendance({});
      setNotes({});
    }
  }, [existingAttendance, toast]);

  // Filter enrolled students
  const enrolledStudentIds = enrollments.map((enrollment: any) => enrollment.studentId);
  const enrolledStudents = students.filter(student => enrolledStudentIds.includes(student.id));

  const handleAttendanceChange = (studentId: number, status: string) => {
    setStudentsAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleNotesChange = (studentId: number, note: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: note
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || !user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a class before submitting attendance.",
      });
      return;
    }

    try {
      // Submit attendance for each student
      for (const studentId of enrolledStudentIds) {
        const status = studentsAttendance[studentId] || "absent";
        
        const attendanceRecord: AttendanceRecord = {
          studentId,
          classId: selectedClass,
          date: attendanceDate,
          status,
          recordedBy: user.id,
          notes: notes[studentId] || ""
        };

        await submitAttendanceMutation.mutateAsync(attendanceRecord);
      }

      toast({
        title: "Attendance submitted",
        description: "Attendance has been recorded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit attendance. Please try again.",
      });
    }
  };

  const getSelectedCourseName = () => {
    if (!selectedCourse) return "";
    const course = courses.find(c => c.id === selectedCourse);
    return course ? course.name : "";
  };

  const getSelectedClassDetails = () => {
    if (!selectedClass) return "";
    const classInfo = classes.find(c => c.id === selectedClass);
    if (!classInfo) return "";
    
    return `${classInfo.day}, ${formatTime(classInfo.startTime)} - ${formatTime(classInfo.endTime)}, Room ${classInfo.roomNumber}`;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Record attendance for classes and track student participation.
        </p>
      </div>

      {/* Selection Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Course
              </label>
              <Select 
                value={selectedCourse?.toString() || ""} 
                onValueChange={(value) => {
                  setSelectedCourse(Number(value));
                  setSelectedClass(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Class
              </label>
              <Select 
                value={selectedClass?.toString() || ""} 
                onValueChange={(value) => setSelectedClass(Number(value))}
                disabled={!selectedCourse}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCourse ? "Select a class" : "Select a course first"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      {classItem.day}, {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <Input 
                type="date" 
                value={attendanceDate} 
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {selectedCourse && selectedClass ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>{getSelectedCourseName()}</CardTitle>
            <CardDescription>{getSelectedClassDetails()}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {enrolledStudents.length > 0 ? (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="w-[120px]">Present</TableHead>
                      <TableHead className="w-[120px]">Late</TableHead>
                      <TableHead className="w-[120px]">Absent</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={student.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                              alt={student.name} 
                              className="h-8 w-8 rounded-full" 
                            />
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={studentsAttendance[student.id] === "present"}
                              onCheckedChange={() => handleAttendanceChange(student.id, "present")}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                            <CheckCircle 
                              className="h-5 w-5 text-green-500" 
                              onClick={() => handleAttendanceChange(student.id, "present")}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={studentsAttendance[student.id] === "late"}
                              onCheckedChange={() => handleAttendanceChange(student.id, "late")}
                              className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                            />
                            <Clock 
                              className="h-5 w-5 text-yellow-500" 
                              onClick={() => handleAttendanceChange(student.id, "late")}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={studentsAttendance[student.id] === "absent"} 
                              onCheckedChange={() => handleAttendanceChange(student.id, "absent")} 
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                            <XCircle 
                              className="h-5 w-5 text-red-500" 
                              onClick={() => handleAttendanceChange(student.id, "absent")}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder="Add notes (optional)" 
                            value={notes[student.id] || ""}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 flex justify-end">
                  <Button 
                    onClick={handleSubmitAttendance}
                    disabled={submitAttendanceMutation.isPending}
                  >
                    {submitAttendanceMutation.isPending ? "Submitting..." : "Submit Attendance"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No students enrolled</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    There are no students enrolled in this course.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a course and class</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Please select a course and class to mark attendance.
          </p>
        </div>
      )}
    </Layout>
  );
}
