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
import { Badge } from "../components/ui/badge";
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
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Users, 
  PlusCircle, 
  ClipboardList,
  Building,
  Clock
} from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../App";

interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  facultyId?: number;
  facultyName?: string;
}

interface Class {
  id: number;
  courseId: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  day: string;
  courseName?: string;
  facultyName?: string;
}

const dayOptions = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

// Form schema for adding/editing class
const classFormSchema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  day: z.string().min(1, "Please select a day of the week"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  roomNumber: z.string().optional(),
});

// Form schema for adding/editing course
const courseFormSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters"),
  code: z.string().min(2, "Course code must be at least 2 characters"),
  description: z.string().optional(),
  facultyId: z.string().optional(),
});

export default function Classes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"classes" | "courses">("classes");

  // Fetch classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/classes/today'],
  });

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Fetch faculty users
  interface Faculty {
    id: number;
    name: string;
    // add other fields if needed
  }
  const { data: faculty = [] } = useQuery<Faculty[]>({
    queryKey: ['/api/users', { role: 'faculty' }],
  });

  // Class form
  const classForm = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      courseId: "",
      day: "",
      startTime: "",
      endTime: "",
      roomNumber: "",
    },
  });

  // Course form
  const courseForm = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      facultyId: "",
    },
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (data: z.infer<typeof classFormSchema>) => {
      const classData = {
        courseId: parseInt(data.courseId),
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber || "",
      };
      const result = await apiRequest("POST", "/api/classes", classData);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({
        title: "Class created",
        description: "New class has been added successfully.",
      });
      classForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create class",
        description: error.message || "An error occurred while creating the class.",
      });
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof courseFormSchema>) => {
      const courseData = {
        name: data.name,
        code: data.code,
        description: data.description || "",
        facultyId: data.facultyId ? parseInt(data.facultyId) : undefined,
      };
      const result = await apiRequest("POST", "/api/courses", courseData);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Course created",
        description: "New course has been added successfully.",
      });
      courseForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create course",
        description: error.message || "An error occurred while creating the course.",
      });
    }
  });

  // Handle class form submission
  const onClassSubmit = (data: z.infer<typeof classFormSchema>) => {
    createClassMutation.mutate(data);
  };

  // Handle course form submission
  const onCourseSubmit = (data: z.infer<typeof courseFormSchema>) => {
    createCourseMutation.mutate(data);
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(classItem => {
    const courseName = courses.find(c => c.id === classItem.courseId)?.name || "";
    return courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.day.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFacultyName = (facultyId?: number) => {
    if (!facultyId) return "Unassigned";
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : "Unassigned";
  };

  const isToday = (day: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today;
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === "classes" ? "Classes" : "Courses"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "classes" 
                ? "Manage class schedules and room assignments." 
                : "Manage courses and their faculty assignments."}
            </p>
          </div>
          
          {activeTab === "classes" ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <Clock className="mr-2 h-4 w-4" />
                  Add Class Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class Schedule</DialogTitle>
                  <DialogDescription>
                    Create a new class schedule for a course.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...classForm}>
                  <form onSubmit={classForm.handleSubmit(onClassSubmit)} className="space-y-4">
                    <FormField
                      control={classForm.control}
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
                    
                    <FormField
                      control={classForm.control}
                      name="day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Week</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a day" />
                              </SelectTrigger>
                              <SelectContent>
                                {dayOptions.map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={classForm.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={classForm.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={classForm.control}
                      name="roomNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. A101" {...field} />
                          </FormControl>
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
                        disabled={createClassMutation.isPending}
                      >
                        {createClassMutation.isPending ? "Creating..." : "Create Class"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>
                    Create a new course and assign a faculty member.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...courseForm}>
                  <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4">
                    <FormField
                      control={courseForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Code</FormLabel>
                          <FormControl>
                            <Input placeholder="CS101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduction to Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="facultyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign Faculty</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a faculty member" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {faculty.map((f: any) => (
                                  <SelectItem key={f.id} value={f.id.toString()}>
                                    {f.name}
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
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createCourseMutation.isPending}
                      >
                        {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "classes"
              ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          }`}
          onClick={() => setActiveTab("classes")}
        >
          <Clock className="inline-block mr-2 h-4 w-4" />
          Class Schedule
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "courses"
              ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
              : "text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <Building className="inline-block mr-2 h-4 w-4" />
          Courses
        </button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      {activeTab === "classes" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Class Schedule</CardTitle>
            <CardDescription>
              Showing {filteredClasses.length} classes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingClasses ? (
              <div className="flex items-center justify-center h-64">
                <p>Loading classes...</p>
              </div>
            ) : filteredClasses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => {
                    const course = courses.find(c => c.id === classItem.courseId);
                    return (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium">
                          {course?.name || `Course ${classItem.courseId}`}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {course?.code || ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {classItem.day}
                            {isToday(classItem.day) && (
                              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Today
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                        </TableCell>
                        <TableCell>{classItem.roomNumber || "-"}</TableCell>
                        <TableCell>{getFacultyName(course?.facultyId)}</TableCell>
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
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Mark Attendance
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Users className="mr-2 h-4 w-4" />
                                View Students
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Schedule
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No classes found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Try changing your search query or add a new class.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      {activeTab === "courses" && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Courses</CardTitle>
            <CardDescription>
              Showing {filteredCourses.length} courses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCourses ? (
              <div className="flex items-center justify-center h-64">
                <p>Loading courses...</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.description || "-"}</TableCell>
                      <TableCell>{getFacultyName(course.facultyId)}</TableCell>
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
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Clock className="mr-2 h-4 w-4" />
                              Add Class Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Users className="mr-2 h-4 w-4" />
                              View Enrolled Students
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
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
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No courses found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Try changing your search query or add a new course.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
