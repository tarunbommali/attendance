import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Pen, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { rollList, programsData, subjectsData } from "../data/rollList";

// Form schema for adding/editing student details
const studentFormSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  registrationNumber: z.string().min(1, "Registration number is required")
    .regex(/^\d{2}[A-Z]{2}\d[A-Z]\d{4}$/, "Registration number format: 24VV1F0001"),
  type: z.enum(["Regular", "Detained"]),
  department: z.string().min(1, "Department is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.string().min(1, "Semester is required"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function StudentManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("mca");
  
  // Setup form with validation
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      type: "Regular",
      department: "MCA",
      academicYear: "2024-2025",
      semester: "1",
    },
  });

  // Initialize students from the roll list
  useEffect(() => {
    const departmentData = rollList.find(dept => dept.department === "MCA");
    if (departmentData) {
      setStudents(departmentData.rollList);
    }
  }, []);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!openDialog) {
      setEditingStudent(null);
      form.reset({
        name: "",
        registrationNumber: "",
        type: "Regular",
        department: "MCA",
        academicYear: "2024-2025",
        semester: "1",
      });
    }
  }, [openDialog, form]);
  
  // When editing a student, populate form with student data
  useEffect(() => {
    if (editingStudent) {
      form.reset({
        name: editingStudent.name,
        registrationNumber: editingStudent.registrationNumber,
        type: editingStudent.type,
        department: "MCA",
        academicYear: "2024-2025",
        semester: "1",
      });
    }
  }, [editingStudent, form]);

  // Handle form submission
  function onSubmit(data: StudentFormValues) {
    if (editingStudent) {
      // Edit existing student
      const updatedStudents = students.map(student => 
        student.registrationNumber === editingStudent.registrationNumber 
          ? { ...data } 
          : student
      );
      setStudents(updatedStudents);
      
      toast({
        title: "Student Updated",
        description: `Student ${data.name} has been updated successfully.`,
      });
    } else {
      // Check for duplicate registration number
      const exists = students.some(student => student.registrationNumber === data.registrationNumber);
      if (exists) {
        toast({
          variant: "destructive",
          title: "Registration number already exists",
          description: "Please use a unique registration number."
        });
        return;
      }
      
      // Add new student
      setStudents([...students, data]);
      
      toast({
        title: "Student Added",
        description: `Student ${data.name} has been added successfully.`,
      });
    }
    
    setOpenDialog(false);
  }
  
  // Delete a student
  function deleteStudent(registrationNumber: string) {
    const updatedStudents = students.filter(
      student => student.registrationNumber !== registrationNumber
    );
    setStudents(updatedStudents);
    
    toast({
      title: "Student Removed",
      description: "Student has been removed successfully.",
    });
  }

  // Edit student handler
  function handleEdit(student: any) {
    setEditingStudent(student);
    setOpenDialog(true);
  }
  
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This page is restricted to administrators only. Please log in with an admin account or contact your system administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <UserPlus size={16} />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? "Update the student details below and save your changes." 
                  : "Enter the new student details below."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 24VV1F0001" 
                          {...field} 
                          disabled={!!editingStudent} 
                        />
                      </FormControl>
                      <FormDescription>
                        Format: 24VV1F0001 (Year, College, Dept, Number)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Detained">Detained</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MCA">MCA</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                            <SelectItem value="BTech">BTech</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2022-2023">2022-2023</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                            <SelectItem value="3">Semester 3</SelectItem>
                            <SelectItem value="4">Semester 4</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">{editingStudent ? "Update Student" : "Add Student"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="mca" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="mca">MCA</TabsTrigger>
          <TabsTrigger value="mba" disabled>MBA</TabsTrigger>
          <TabsTrigger value="btech" disabled>B.Tech</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>MCA Student Records</span>
                <Badge variant="outline">{students.length} Students</Badge>
              </CardTitle>
              <CardDescription>
                Master of Computer Applications - Academic Year 2024-2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Registration Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.registrationNumber}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>
                          <Badge variant={student.type === "Regular" ? "default" : "secondary"}>
                            {student.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(student)}
                            >
                              <Pen size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteStudent(student.registrationNumber)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}