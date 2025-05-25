/* eslint-disable @typescript-eslint/no-explicit-any */
// src/data/appMockData.ts

// Type definitions (can be in a separate types.ts file if preferred)
export interface Subject {
  id: string; // e.g., "MCA101"
  name: string;
  code: string;
  credits: number;
  semester: number; // Semester this subject belongs to
  department: "MCA" | "CSE"; // Department offering the subject
  facultyId?: number; // ID of the faculty teaching this subject
}

export interface DepartmentFaculty {
  id: number; // Unique user ID
  username: string;
  password?: string; // Optional for mock, might not be sent to client
  name: string;
  email: string;
  role: "faculty";
  department: "MCA" | "CSE";
  profileImage?: string | null;
  subjectIds: string[]; // Array of subject IDs they teach
  createdAt: string;
}

export interface DepartmentStudent {
  id: number; // Unique user ID
  username: string;
  password?: string; // Optional for mock
  name: string;
  email: string;
  role: "student";
  department: "MCA" | "CSE";
  registrationNumber: string;
  currentSemester: number; // The semester the student is currently in
  profileImage?: string | null;
  type: "Regular" | "Detained"; // From your rollList structure
  createdAt: string;
}

export interface AdminUser {
  id: number; // Unique user ID
  username: string;
  password?: string;
  name: string;
  email: string;
  role: "admin";
  profileImage?: string | null;
  createdAt: string;
}

export interface DepartmentDetails {
  id: "MCA" | "CSE";
  name: string;
  totalSemesters: number;
  academicYears: {
    [year: string]: { // e.g., "2024-2025"
      // activeSemester: number; // The currently running semester for this year
      semesters: {
        [sem: number]: {
          subjectIds: string[];
        };
      };
    };
  };
}

// --- ADMIN USER ---
export const adminUsersList: AdminUser[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    email: "admin@college.edu",
    role: "admin",
    profileImage: null,
    createdAt: new Date("2023-01-01").toISOString(),
  },
];

// --- DEPARTMENTS ---
export const departmentData: { [key: string]: DepartmentDetails } = {
  MCA: {
    id: "MCA",
    name: "Master of Computer Applications",
    totalSemesters: 4,
    academicYears: {
      "2024-2025": {
        // activeSemester: 2,
        semesters: {
          1: { subjectIds: ["MCA101", "MCA102", "MCA103", "MCA104", "MCA105", "MCA106"] },
          2: { subjectIds: ["MCA201", "MCA202"] }, // Add Sem 2 subjects
          3: { subjectIds: [] }, // Placeholder
          4: { subjectIds: [] }, // Placeholder
        },
      },
    },
  },
  CSE: {
    id: "CSE",
    name: "B.Tech Computer Science Engineering",
    totalSemesters: 8,
    academicYears: {
      "2024-2025": {
        // activeSemester: 2,
        semesters: {
          1: { subjectIds: ["CSE101", "CSE102"] },
          2: { subjectIds: ["CSE201", "CSE202"] },
          3: { subjectIds: ["CSE301", "CSE302"] },
          // ... other semesters
        },
      },
    },
  },
};

// --- SUBJECTS ---
export const allSubjects: Subject[] = [
  // MCA Subjects
  { id: "MCA101", name: "Mathematical Foundations", code: "MCA101", credits: 4, semester: 1, department: "MCA" },
  { id: "MCA102", name: "Computer Architecture", code: "MCA102", credits: 4, semester: 1, department: "MCA" },
  { id: "MCA103", name: "Java Programming", code: "MCA103", credits: 4, semester: 1, department: "MCA", facultyId: 2 },
  { id: "MCA104", name: "Database Management", code: "MCA104", credits: 4, semester: 1, department: "MCA", facultyId: 3 },
  { id: "MCA105", name: "Operating Systems", code: "MCA105", credits: 4, semester: 1, department: "MCA", facultyId: 2 },
  { id: "MCA106", name: "Data Structures with C", code: "MCA106", credits: 4, semester: 1, department: "MCA", facultyId: 3 },
  { id: "MCA201", name: "Advanced Java", code: "MCA201", credits: 4, semester: 2, department: "MCA", facultyId: 2 },
  { id: "MCA202", name: "Web Technologies", code: "MCA202", credits: 4, semester: 2, department: "MCA", facultyId: 3 },


  // CSE Subjects
  { id: "CSE101", name: "Intro to Programming (CSE)", code: "CSE101", credits: 4, semester: 1, department: "CSE", facultyId: 10 },
  { id: "CSE102", name: "Discrete Maths (CSE)", code: "CSE102", credits: 4, semester: 1, department: "CSE", facultyId: 11 },
  { id: "CSE201", name: "Data Structures (CSE)", code: "CSE201", credits: 4, semester: 2, department: "CSE", facultyId: 10 },
  { id: "CSE202", name: "Digital Logic Design (CSE)", code: "CSE202", credits: 4, semester: 2, department: "CSE", facultyId: 11 },
  { id: "CSE301", name: "Algorithms (CSE)", code: "CSE301", credits: 4, semester: 3, department: "CSE", facultyId: 10 },
  { id: "CSE302", name: "OOP with Python (CSE)", code: "CSE302", credits: 4, semester: 3, department: "CSE", facultyId: 11 },
];

// --- FACULTY ---
export const facultyList: DepartmentFaculty[] = [
  { id: 2, username: "haritha", password: "faculty123", name: "Haritha L.", email: "haritha@college.edu", role: "faculty", department: "MCA", subjectIds: ["MCA103", "MCA105", "MCA201"], createdAt: new Date("2023-01-15").toISOString() },
  { id: 3, username: "manasa", password: "faculty123", name: "Manasa Devi P.", email: "manasa@college.edu", role: "faculty", department: "MCA", subjectIds: ["MCA104", "MCA106", "MCA202"], createdAt: new Date("2023-01-20").toISOString() },
  { id: 10, username: "anand_cse", password: "faculty123", name: "Dr. Anand K.", email: "anand.cse@college.edu", role: "faculty", department: "CSE", subjectIds: ["CSE201", "CSE301"], createdAt: new Date("2022-08-10").toISOString() },
  { id: 11, username: "sunita_cse", password: "faculty123", name: "Prof. Sunita M.", email: "sunita.cse@college.edu", role: "faculty", department: "CSE", subjectIds: ["CSE101", "CSE102", "CSE302"], createdAt: new Date("2022-09-01").toISOString() },
];

// --- STUDENTS ---
export const studentList: DepartmentStudent[] = [
  // MCA Students
  { id: 101, username: "24vv1f0001", password: "student123", name: "ALLUMALLI HARSHITHA", email: "harshitha@college.edu", role: "student", department: "MCA", registrationNumber: "24VV1F0001", currentSemester: 1, type: "Regular", createdAt: new Date("2024-07-15").toISOString() },
  { id: 102, username: "24vv1f0022", password: "student123", name: "KELLA MANASA", email: "manasa.k@college.edu", role: "student", department: "MCA", registrationNumber: "24VV1F0022", currentSemester: 1, type: "Regular", createdAt: new Date("2024-07-15").toISOString() },
  { id: 103, username: "24vv1f0008", password: "student123", name: "TARUN BOMMALI", email: "tarunbommali@college.edu", role: "student", department: "MCA", registrationNumber: "24VV1F0008", currentSemester: 1, type: "Regular", createdAt: new Date("2024-07-15").toISOString() },
  { id: 104, username: "24vv1f0010", password: "student123", name: "BURIDI DINESH VENKAT", email: "dinesh@college.edu", role: "student", department: "MCA", registrationNumber: "24VV1F0010", currentSemester: 2, type: "Regular", createdAt: new Date("2024-01-17").toISOString() }, // Example of Sem 2 student

  // CSE Students
  { id: 201, username: "24cs1f0001", password: "student123", name: "Ajay Kumar", email: "ajay.cse@college.edu", role: "student", department: "CSE", registrationNumber: "24CS1F0001", currentSemester: 1, type: "Regular", createdAt: new Date("2024-08-01").toISOString() },
  { id: 202, username: "24cs1f0002", password: "student123", name: "Priya Sharma", email: "priya.cse@college.edu", role: "student", department: "CSE", registrationNumber: "24CS1F0002", currentSemester: 1, type: "Regular", createdAt: new Date("2024-08-01").toISOString() },
  { id: 203, username: "23cs1f0050", password: "student123", name: "Rohan Das", email: "rohan.cse@college.edu", role: "student", department: "CSE", registrationNumber: "23CS1F0050", currentSemester: 3, type: "Regular", createdAt: new Date("2023-08-01").toISOString() }, // 2nd year, 3rd sem
  { id: 204, username: "23cs1f0051", password: "student123", name: "Anita Singh", email: "anita.cse@college.edu", role: "student", department: "CSE", registrationNumber: "23CS1F0051", currentSemester: 3, type: "Detained", createdAt: new Date("2023-08-01").toISOString() },
];

// --- Combined initial users for general purposes (like login, user listing by role) ---
export const initialCombinedUsers = [
  ...adminUsersList,
  ...facultyList,
  ...studentList,
];

// --- Helper function to generate mock attendance ---
export function generateMockAttendance(
  students: DepartmentStudent[],
  subjects: Subject[],
  numRecordsPerStudentSubjectPair: number = 5 // Number of attendance records per subject for a student
) {
  const attendance: any[] = [];
  const statuses = ["present", "absent", "late", "excused"];
  const startDate = new Date(2025, 0, 15); // Jan 15, 2025 (future date for freshness)

  students.forEach(student => {
    // Get subjects for the student's current semester and department
    const studentSubjects = subjects.filter(
      s => s.department === student.department && s.semester === student.currentSemester
    );

    studentSubjects.forEach(subject => {
      for (let i = 0; i < numRecordsPerStudentSubjectPair; i++) {
        const classDate = new Date(startDate);
        classDate.setDate(startDate.getDate() + i * 2 + Math.floor(Math.random() * 5)); // Vary dates a bit

        // Ensure classDate is not in the future relative to "today" for this mock data generation
        const todayForMock = new Date(2025, 4, 25); // Assuming "today" is around May 25, 2025 for this data
        if (classDate > todayForMock) continue;


        const randomStatusIndex = Math.floor(Math.random() * statuses.length);
        let status = statuses[randomStatusIndex];
        // Higher probability of present
        if (Math.random() < 0.75) status = "present";


        attendance.push({
          id: `${subject.code}_${student.registrationNumber}_${i}`, // Unique ID
          date: classDate.toISOString().split('T')[0],
          subject: subject.name,
          subjectCode: subject.code,
          studentId: student.id, // Using numeric student ID
          registrationNumber: student.registrationNumber, // Keep for reference
          studentName: student.name,
          status: status,
          instructor: facultyList.find(f => f.id === subject.facultyId)?.name || "N/A",
          facultyId: subject.facultyId,
          time: (i % 2 === 0) ? "09:00 AM - 10:30 AM" : "11:00 AM - 12:30 PM", // Example times
          duration: 1.5,
          notes: status === "excused" ? "Prior permission" : "",
          classId: `${subject.id}_${classDate.getDay()}`, // Mock class ID
          department: student.department
        });
      }
    });
  });
  return attendance;
}

export const initialMockAttendance = generateMockAttendance(studentList, allSubjects);