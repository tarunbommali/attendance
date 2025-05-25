import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "../components/layout";
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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserCircle, 
  Mail, 
  BarChart2, 
  Filter
} from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Badge } from "../components/ui/badge";

interface Student {
  id: number;
  username: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  createdAt: string;
}

interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  courseName?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

// Form schema for adding/editing student
const studentFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  profileImage: z.string().optional(),
});

// Form schema for enrolling student in a course
const enrollmentFormSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
});

export default function Students() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);

  // Fetch students
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/users', { role: 'student' }],
  });

  // Fetch courses for enrollment
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Student form
  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

  // Enrollment form
  const enrollmentForm = useForm<z.infer<typeof enrollmentFormSchema>>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      courseId: "",
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentFormSchema>) => {
      const studentData = {
        ...data,
        role: "student",
        password: data.password || "password123" // Set a default password if not provided
      };
      const result = await apiRequest("POST", "/api/users", studentData);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Student created",
        description: "New student has been added successfully.",
      });
      studentForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create student",
        description: error.message || "An error occurred while creating the student.",
      });
    }
  });

  // Create enrollment mutation
  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: { studentId: number; courseId: number }) => {
      const result = await apiRequest("POST", "/api/enrollments", data);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      toast({
        title: "Enrollment successful",
        description: "Student has been enrolled in the course.",
      });
      enrollmentForm.reset();
      setIsEnrollmentDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "An error occurred while enrolling the student.",
      });
    }
  });

  // Handle student form submission
  const onStudentSubmit = (data: z.infer<typeof studentFormSchema>) => {
    createStudentMutation.mutate(data);
  };

  // Handle enrollment form submission
  const onEnrollmentSubmit = (data: z.infer<typeof enrollmentFormSchema>) => {
    if (!selectedStudent) return;
    
    createEnrollmentMutation.mutate({ 
      studentId: selectedStudent.id, 
      courseId: parseInt(data.courseId)
    });
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Open enrollment dialog for a student
  const openEnrollmentDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsEnrollmentDialogOpen(true);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage students and their course enrollments.
            </p>
          </div>
          
          {/* Add Student Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details to create a new account.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                  <FormField
                    control={studentForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used for login purposes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={studentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={studentForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe..example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={studentForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use default password.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={studentForm.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional: Enter a URL for the student's profile image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={createStudentMutation.isPending}
                    >
                      {createStudentMutation.isPending ? "Creating..." : "Create Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} students
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={student.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                          alt={student.name} 
                          className="h-8 w-8 rounded-full" 
                        />
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.username}</TableCell>
                    <TableCell>{formatDate(student.createdAt)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => openEnrollmentDialog(student)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Enroll in Course
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <BarChart2 className="mr-2 h-4 w-4" />
                            View Attendance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white">No students found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try changing your search query or add a new student.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student in Course</DialogTitle>
            <DialogDescription>
              Select a course to enroll {selectedStudent?.name} in.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...enrollmentForm}>
            <form onSubmit={enrollmentForm.handleSubmit(onEnrollmentSubmit)} className="space-y-4">
              <FormField
                control={enrollmentForm.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name} ({course.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEnrollmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEnrollmentMutation.isPending}
                >
                  {createEnrollmentMutation.isPending ? "Enrolling..." : "Enroll Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
