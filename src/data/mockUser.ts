// src/data/mockUser.ts
import {
  initialCombinedUsers, // Use the combined list
  facultyList,          // For specific faculty operations if needed
  type AdminUser,
  type DepartmentFaculty,
  type DepartmentStudent,
  studentList
} from './appMockData'; // Adjust path if appMockData.ts is elsewhere

// Define a general User type that can represent any user from initialCombinedUsers
export type GenericUser = AdminUser | DepartmentFaculty | DepartmentStudent;

// Get user by username and password (for login)
export function getUserByCredentials(username: string, password?: string): GenericUser | undefined {
  return initialCombinedUsers.find(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() &&
      (password ? user.password === password : true)
  ) as GenericUser | undefined;
}

// Get user by ID
export function getUserById(id: number): GenericUser | undefined {
  return initialCombinedUsers.find((user) => user.id === id) as GenericUser | undefined;
}

// Get all users by role from the initial static list
export function getUsersByRole(role: string): GenericUser[] {
  return initialCombinedUsers.filter((user) => user.role === role) as GenericUser[];
}

// Get faculty by subject ID (searches for faculty teaching a specific subject)
export function getFacultyBySubjectId(subjectId: string): DepartmentFaculty[] {
  return facultyList.filter(
    (faculty) => faculty.subjectIds.includes(subjectId)
  );
}

// Get faculty by department
export function getFacultyByDepartment(department: "MCA" | "CSE"): DepartmentFaculty[] {
    return facultyList.filter(faculty => faculty.department === department);
}

// Get students by department and semester
export function getStudentsByDepartmentAndSemester(department: "MCA" | "CSE", semester: number): DepartmentStudent[] {
    return studentList.filter(student => student.department === department && student.currentSemester === semester);
}