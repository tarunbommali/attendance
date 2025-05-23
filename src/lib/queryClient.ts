// src/lib/queryClient.ts

// Add this to extend ImportMeta for Vite env variables
interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  // add other env variables here as needed
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import {
  mockUsers as initialMockUsers,
  getUserByCredentials,
  getUsersByRole as getUsersByRoleFromMock,
  // getFacultyBySubject // Not directly used by current pages via queryClient, but good to have
} from "../data/mockUser";
import {
  rollList as initialRollList,
  mockAttendanceData as initialMockAttendanceData,
  subjectsData as initialSubjectsData, // Represents courses for MCA
  programsData,
} from "../data/rollList"; // Assuming programsData is also in rollList.ts or imported

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// --- In-memory stores for mock data ---
let mockUsersStore = JSON.parse(JSON.stringify(initialMockUsers));
let mockCoursesStore = JSON.parse(JSON.stringify(initialSubjectsData.mca)); // For MCA courses
let mockClassesStore: any[] = []; // Will be populated by POST /api/classes
let mockAttendanceStore = JSON.parse(JSON.stringify(initialMockAttendanceData));
let mockEnrollmentsStore: any[] = []; // Will be populated by POST /api/enrollments
let mockRollListStore = JSON.parse(JSON.stringify(initialRollList));


// Helper to reset stores if needed (for testing, etc.)
export function resetMockStores() {
  mockUsersStore = JSON.parse(JSON.stringify(initialMockUsers));
  mockCoursesStore = JSON.parse(JSON.stringify(initialSubjectsData.mca));
  mockClassesStore = [];
  mockAttendanceStore = JSON.parse(JSON.stringify(initialMockAttendanceData));
  mockEnrollmentsStore = [];
  mockRollListStore = JSON.parse(JSON.stringify(initialRollList));
  console.log("[Mock API] All mock stores have been reset.");
}

// --- End In-memory stores ---


async function throwIfResNotOk(res: Response | MockResponse) {
  if (!res.ok) {
    const text = (await (res.text ? res.text() : Promise.resolve(JSON.stringify(res.body)))) || (res as any).statusText || `Error: ${res.status}`;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
  body?: any; // Add body for easier debugging
}

// Helper to create a mock Response object
function mockResponse(data: any, status: number = 200): Promise<MockResponse> {
  const response = {
    ok: status >= 200 && status < 300,
    status: status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    body: data, // For easier inspection
  };
  return Promise.resolve(response);
}


export const VITE_USE_MOCK = true; 

export async function apiRequest(method: string, url: string, data?: any): Promise<MockResponse> {
  const normalizedUrl = new URL(url, "http://localhost"); // Normalize URL for easier parsing
  const path = normalizedUrl.pathname;
  const params = normalizedUrl.searchParams;

  console.log(`[Mock API Request] Method: ${method}, Path: ${path}, Params: ${params.toString()}, Body:`, data);


  if (VITE_USE_MOCK) {
    // --- User and Auth related mocks ---
    if (path.startsWith("/api/login") && method.toUpperCase() === "POST") {
      const user = getUserByCredentials(data.username, data.password);
      if (user) return mockResponse(user);
      return mockResponse({ message: "Invalid credentials" }, 401);
    }

    if (path.startsWith("/api/users")) {
      if (method.toUpperCase() === "GET") {
        const role = params.get("role");
        if (role) {
          return mockResponse(getUsersByRoleFromMock(role, mockUsersStore));
        }
        // Handle GET /api/users/:id if needed
        return mockResponse(mockUsersStore);
      }
      if (method.toUpperCase() === "POST") { // Create user (student or faculty)
        const newUser = {
          id: mockUsersStore.length > 0 ? Math.max(...mockUsersStore.map((u: any) => u.id)) + 1 : 1000,
          ...data,
          createdAt: new Date().toISOString(),
          profileImage: data.profileImage || null,
        };
        mockUsersStore.push(newUser);
        console.log("[Mock API] Added new user:", newUser);
        console.log("[Mock API] Current users store:", mockUsersStore);
        return mockResponse(newUser, 201);
      }
    }

    // --- Course related mocks ---
    if (path.startsWith("/api/courses")) {
      if (method.toUpperCase() === "GET") {
        const facultyId = params.get("facultyId");
        if (facultyId) {
          // Filter courses assigned to this facultyId
          const facultyCourses = mockCoursesStore.filter((c: any) => c.facultyId === parseInt(facultyId));
          return mockResponse(facultyCourses);
        }
        return mockResponse(mockCoursesStore.map((s: any) => ({
          id: s.id, name: s.name, code: s.code, credits: s.credits, facultyId: s.facultyId, facultyName: s.faculty
        })));
      }
      if (method.toUpperCase() === "POST") { // Create course
        const newCourse = {
          id: mockCoursesStore.length > 0 ? Math.max(...mockCoursesStore.map((c: any) => c.id.replace ? parseInt(c.id.replace(/\D/g,''))+100 : c.id+1)) +1 : 700, // Simple ID generation
          ...data,
          // facultyName might need to be looked up if only facultyId is passed
        };
        const facultyMember = mockUsersStore.find((u:any) => u.id === newCourse.facultyId && u.role === 'faculty');
        if (facultyMember) (newCourse as any).faculty = (facultyMember as any).name;

        mockCoursesStore.push(newCourse);
         console.log("[Mock API] Added new course:", newCourse);
        return mockResponse(newCourse, 201);
      }
    }
    
    // Inside apiRequest function in lib/queryClient.ts

    // --- Attendance related mocks ---
    if (path.startsWith("/api/attendance/range")) {
        let filteredAttendance = [...mockAttendanceStore]; // Use the in-memory store
        const startDateParam = params.get("startDate");
        const endDateParam = params.get("endDate");
        const studentIdParam = params.get("studentId");
        const registrationNumberParam = params.get("registrationNumber");

        if (studentIdParam) {
            filteredAttendance = filteredAttendance.filter((a: any) => a.studentId === parseInt(studentIdParam) || a.studentId === studentIdParam);
        } else if (registrationNumberParam) {
            // Assuming studentId in mockAttendanceStore can be registrationNumber from generateAttendanceData
            filteredAttendance = filteredAttendance.filter((a: any) => a.studentId === registrationNumberParam);
        }
        // Note: Your mockAttendanceData is generated using registration numbers as studentId in the records.
        // If your User object in useAuth has an `id` (numeric) and `registrationNumber`,
        // ensure the query from StudentView sends the correct identifier that matches your mockAttendanceStore.
        // The queryKey in StudentView currently sends both `user?.id` as studentId and `user?.registrationNumber`.
        // The above logic prioritizes studentIdParam if present.

        if (startDateParam) {
            filteredAttendance = filteredAttendance.filter((a: any) => new Date(a.date) >= new Date(startDateParam));
        }
        if (endDateParam) {
            filteredAttendance = filteredAttendance.filter((a: any) => new Date(a.date) <= new Date(endDateParam));
        }
        
        // Enrich with student name (though for student view, it's their own name)
        const enrichedAttendance = filteredAttendance.map((att: any) => {
          const studentDetails = mockUsersStore.find((s: any) => s.id === att.studentId || s.registrationNumber === att.studentId);
          return {
            ...att,
            studentName: studentDetails ? studentDetails.name : att.studentName || 'Unknown Student',
            // subject, instructor, time, duration should come directly from mockAttendanceStore records
          };
        });
        return mockResponse(enrichedAttendance);
    }
    // ... other handlers
    
    // --- Classes related mocks ---
     if (path.startsWith("/api/classes/today")) {
        const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayClasses = mockClassesStore.filter(c => c.day === todayDay).map(c => {
            const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId);
            return {...c, courseName: course?.name, facultyName: course?.faculty }
        });
        return mockResponse(todayClasses);
    }
    if (path.startsWith("/api/classes/course")) { // GET /api/classes/course/:courseId
        const courseId = parseInt(path.split("/").pop()!);
        const classesForCourse = mockClassesStore.filter(c => c.courseId === courseId).map(c => {
            const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId);
            return {...c, courseName: course?.name, facultyName: course?.faculty }
        });
        return mockResponse(classesForCourse);
    }
    if (path.startsWith("/api/classes")) {
        if (method.toUpperCase() === "GET") {
             const allRegularClasses = mockClassesStore.map(c => {
                const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId);
                return {...c, courseName: course?.name, facultyName: course?.faculty }
            });
            return mockResponse(allRegularClasses);
        }
        if (method.toUpperCase() === "POST") { // Create class
            const newClass = {
                id: mockClassesStore.length > 0 ? Math.max(...mockClassesStore.map(c => c.id)) + 1 : 1,
                ...data
            };
            mockClassesStore.push(newClass);
            console.log("[Mock API] Added new class:", newClass);
            return mockResponse(newClass, 201);
        }
    }


    // --- Enrollments ---
    if (path.startsWith("/api/enrollments/course")) { // GET /api/enrollments/course/:courseId
        const courseId = parseInt(path.split("/").pop()!);
        const enrollmentsForCourse = mockEnrollmentsStore.filter(e => e.courseId === courseId);
        return mockResponse(enrollmentsForCourse);
    }
    if (path.startsWith("/api/enrollments")) {
        if (method.toUpperCase() === "GET") {
            return mockResponse(mockEnrollmentsStore);
        }
        if (method.toUpperCase() === "POST") {
            const newEnrollment = {
                id: mockEnrollmentsStore.length > 0 ? Math.max(...mockEnrollmentsStore.map(e => e.id)) + 1 : 1,
                enrollmentDate: new Date().toISOString(),
                ...data
            };
            // Prevent duplicate enrollments for the same student in the same course
            const existing = mockEnrollmentsStore.find(e => e.studentId === newEnrollment.studentId && e.courseId === newEnrollment.courseId);
            if (existing) {
                return mockResponse({ message: "Student already enrolled in this course" }, 409);
            }
            mockEnrollmentsStore.push(newEnrollment);
            console.log("[Mock API] Added new enrollment:", newEnrollment);
            return mockResponse(newEnrollment, 201);
        }
    }

    // --- Attendance related mocks ---
    if (path.startsWith("/api/attendance/range")) {
        let filteredAttendance = [...mockAttendanceStore];
        const startDateParam = params.get("startDate");
        const endDateParam = params.get("endDate");
        // const facultyIdParam = params.get("facultyId"); // TODO: Link attendance to faculty if needed

        if (startDateParam) {
            filteredAttendance = filteredAttendance.filter(a => new Date(a.date) >= new Date(startDateParam));
        }
        if (endDateParam) {
            filteredAttendance = filteredAttendance.filter(a => new Date(a.date) <= new Date(endDateParam));
        }
        // Enrich with student and course names
        const enrichedAttendance = filteredAttendance.map((att: any) => {
          const student = mockUsersStore.find((s: any) => s.id === att.studentId || s.registrationNumber === att.studentId);
          // Finding course and class details might be more complex based on classId
          // For now, using subject from attendance record directly if available
          return {
            ...att,
            studentName: student ? student.name : 'Unknown Student',
            courseName: att.subject || 'Unknown Course', // att.subject comes from generateAttendanceData
          };
        });
        return mockResponse(enrichedAttendance);
    }
    if (path.startsWith("/api/attendance/class")) { // GET /api/attendance/class/:classId/date/:date
        const parts = path.split("/");
        const classId = parseInt(parts[parts.length - 3]); // or parse based on structure
        const date = parts[parts.length - 1];
        const records = mockAttendanceStore.filter((a:any) => a.classId === classId && a.date === date);
        return mockResponse(records);
    }
    if (path.startsWith("/api/attendance")) {
        if (method.toUpperCase() === "POST") { // Record attendance
            const newAttendanceRecord = {
                id: mockAttendanceStore.length > 0 ? Math.max(...mockAttendanceStore.map((a:any) => parseInt(a.id.split('_').pop()) || 0)) + 1 : 1, // Improve ID
                ...data
            };
            // Update if exists for same student, class, date, or add new
            const existingIndex = mockAttendanceStore.findIndex((a:any) => 
                a.studentId === newAttendanceRecord.studentId &&
                a.classId === newAttendanceRecord.classId &&
                a.date === newAttendanceRecord.date
            );
            if (existingIndex > -1) {
                mockAttendanceStore[existingIndex] = { ...mockAttendanceStore[existingIndex], ...newAttendanceRecord };
                 console.log("[Mock API] Updated attendance:", newAttendanceRecord);
            } else {
                mockAttendanceStore.push(newAttendanceRecord);
                 console.log("[Mock API] Added new attendance:", newAttendanceRecord);
            }
            return mockResponse(newAttendanceRecord, 201);
        }
         // Default GET /api/attendance returns all
        return mockResponse(mockAttendanceStore);
    }


    // --- Dashboard related mocks (MCA focused) ---
    if (path.startsWith("/api/dashboard/chart")) {
        const today = new Date();
        const mcaStudentsCount = initialRollList.find(r => r.department === "MCA")?.rollList.length || 65;
        const chartData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            const present = Math.floor(Math.random() * (mcaStudentsCount * 0.7)) + Math.floor(mcaStudentsCount * 0.2); // Random present count
            const absent = mcaStudentsCount - present;
            return { date: date.toISOString().split("T")[0], present, absent };
        });
        return mockResponse(chartData);
    }
    if (path.startsWith("/api/dashboard/class-summary")) {
      const mcaCourseDetails = initialSubjectsData["mca"].slice(0, 4).map(subject => ({ // Take first 4 for summary
        subjectName: subject.name,
        subjectCode: subject.code,
        facultyName: subject.faculty || "N/A",
        time: "09:00 AM", // Sample time
        attendanceRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      }));
      return mockResponse(mcaCourseDetails);
    }
    if (path.startsWith("/api/dashboard/recent-attendance")) {
      const mcaAttendance = initialMockAttendanceData.filter((att: any) => {
        const student = initialMockUsers.find(u => u.registrationNumber === att.studentId);
        return student && student.department === "MCA";
      });
      const recent = [...mcaAttendance]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5) // Show 5 recent records
        .map(att => ({
          ...att,
          studentName: initialMockUsers.find(u => u.registrationNumber === att.studentId)?.name || att.studentName,
          // courseName: initialSubjectsData.mca.find(s => s.code === att.subjectCode)?.name || att.subject
        }));
      return mockResponse(recent);
    }
    if (path.startsWith("/api/dashboard/alerts")) {
      const detainedStudents = initialRollList[0].rollList.filter(s => s.type === "Detained");
      const alerts = detainedStudents.slice(0, 2).map(student => ({
        id: `alert_${student.registrationNumber}`,
        message: `Student ${student.name} (${student.registrationNumber}) has low attendance in multiple subjects.`,
        type: "warning", date: new Date().toISOString(),
      }));
      if(alerts.length === 0) alerts.push({ id: 'info1', message: 'Overall attendance for MCA is above 80%.', type: 'info', date: new Date().toISOString() });
      return mockResponse(alerts);
    }
    if (path.startsWith("/api/dashboard/stats")) {
      const mcaRoll = initialRollList.find(r => r.department === "MCA")?.rollList || [];
      const totalStudents = mcaRoll.length;
      // Simulate some stats
      const presentToday = Math.floor(totalStudents * (Math.random() * 0.2 + 0.7)); // 70-90% present
      const overallAttendance = Math.floor(Math.random() * 15) + 75; // 75-90%
      const absentStudentsCount = mockAttendanceStore.filter((a: any) => a.date === new Date().toISOString().split('T')[0] && a.status === 'absent').length || Math.floor(totalStudents * 0.1);


      return mockResponse({
        attendanceRate: overallAttendance,
        totalStudents: totalStudents,
        classesToday: mockClassesStore.filter(c => c.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length || 2, // Example
        absentStudents: absentStudentsCount,
      });
    }

    // If no mock is found for the URL, log it and return a 404 or specific error
    console.warn(`[Mock API Request] No mock handler for ${method} ${path}.`);
    return mockResponse({ message: `Mock for ${method} ${path} not found.` }, 404);
  }

  // Real fetch logic (fallback if VITE_USE_MOCK is false)
  console.warn("[Mock API Request] VITE_USE_MOCK is false. Attempting real fetch.");
  const realResponse = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  // To make it compatible with MockResponse structure for throwIfResNotOk
  return {
      ok: realResponse.ok,
      status: realResponse.status,
      json: () => realResponse.json(),
      text: () => realResponse.text(),
      body: realResponse.body // This is a ReadableStream, not directly usable like mock body
  };
}

// --- React Query Client Setup ---
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFnConstructor: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  () => // Removed on401 for now as apiRequest handles errors
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    let fullUrl = url;
    const paramsObj = queryKey[1] as Record<string, string> | undefined;

    if (paramsObj && typeof paramsObj === 'object' && Object.keys(paramsObj).length > 0) {
        const queryParams = new URLSearchParams();
        // Filter out undefined/null params that might come from optional chaining (e.g. user?.id)
        for (const key in paramsObj) {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                queryParams.append(key, String(paramsObj[key]));
            }
        }
        if (queryParams.toString()) {
          fullUrl += `?${queryParams.toString()}`;
        }
    }
    
    const res = await apiRequest('GET', fullUrl); // apiRequest handles mock/real
    await throwIfResNotOk(res); // Use the modified throwIfResNotOk
    return res.json();
  };


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFnConstructor({ on401: "throw" }) as QueryFunction<unknown, readonly unknown[], unknown>,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for staleTime
      retry: (failureCount, error: any) => {
        // Do not retry on 404 or 401/403 errors from our mock/real API
        if (error.status === 404 || error.status === 401 || error.status === 403) {
          return false;
        }
        // Default retry for other errors (e.g., network issues if not mocking)
        return failureCount < 2; 
      },
    },
    mutations: {
      retry: false,
      // You can add a default mutationFn here if you want one,
      // but mutations often call apiRequest directly with method and data.
    },
  },
});