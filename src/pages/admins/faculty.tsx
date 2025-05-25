import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "../../components/layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "../../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../components/ui/form";
import { useToast } from "../../hooks/use-toast";
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
  Building
} from "lucide-react";
import { apiRequest, queryClient } from "../../lib/queryClient";

interface Faculty {
  id: number;
  username: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  createdAt: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  facultyId?: number;
}

// Form schema for adding/editing faculty
const facultyFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  profileImage: z.string().optional(),
});

export default function Faculty() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // Fetch faculty
  const { data: faculty = [], isLoading } = useQuery<Faculty[]>({
    queryKey: ['/api/users', { role: 'faculty' }],
  });

  // Fetch courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Faculty form
  const facultyForm = useForm<z.infer<typeof facultyFormSchema>>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      profileImage: "",
    },
  });

  // Create faculty mutation
  const createFacultyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof facultyFormSchema>) => {
      const facultyData = {
        ...data,
        role: "faculty",
        password: data.password || "faculty123" // Set a default password if not provided
      };
      const result = await apiRequest("POST", "/api/users", facultyData);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Faculty created",
        description: "New faculty member has been added successfully.",
      });
      facultyForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create faculty",
        description: error.message || "An error occurred while creating the faculty member.",
      });
    }
  });

  // Handle faculty form submission
  const onFacultySubmit = (data: z.infer<typeof facultyFormSchema>) => {
    createFacultyMutation.mutate(data);
  };

  // Filter faculty based on search query
  const filteredFaculty = faculty.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Get assigned courses for a faculty member
  const getAssignedCourses = (facultyId: number) => {
    return courses.filter(course => course.facultyId === facultyId);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage faculty members and their course assignments.
            </p>
          </div>
          
          {/* Add Faculty Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>
                  Enter faculty details to create a new account.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...facultyForm}>
                <form onSubmit={facultyForm.handleSubmit(onFacultySubmit)} className="space-y-4">
                  <FormField
                    control={facultyForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="profsmith" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used for login purposes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={facultyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Prof. John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={facultyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.smith..college.edu" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={facultyForm.control}
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
                    control={facultyForm.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional: Enter a URL for the faculty's profile image.
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
                      disabled={createFacultyMutation.isPending}
                    >
                      {createFacultyMutation.isPending ? "Creating..." : "Create Faculty"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search faculty..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>All Faculty</CardTitle>
          <CardDescription>
            Showing {filteredFaculty.length} faculty members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading faculty...</p>
            </div>
          ) : filteredFaculty.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Courses</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((member) => {
                  const assignedCourses = getAssignedCourses(member.id);
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={member.profileImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                            alt={member.name} 
                            className="h-8 w-8 rounded-full" 
                          />
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {assignedCourses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedCourses.map(course => (
                              <Badge key={course.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                {course.code}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">No courses assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
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
                              Edit Faculty
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Building className="mr-2 h-4 w-4" />
                              Assign Course
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <BarChart2 className="mr-2 h-4 w-4" />
                              View Classes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Faculty
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
                <p className="text-lg font-medium text-gray-900 dark:text-white">No faculty found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Try changing your search query or add a new faculty member.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredFaculty.length} of {faculty.length} faculty members
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* View Faculty Details Dialog (would be implemented when needed) */}
    </Layout>
  );
}
