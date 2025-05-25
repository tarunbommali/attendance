/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// src/lib/queryClient.ts

import {
  initialCombinedUsers,
  // getUserByCredentials as getUserByCredentialsFromMockFile, // Removed: Not exported from appMockData
  // getUsersByRole as getUsersByRoleFromStaticData,       // Removed: Not exported from appMockData
  allSubjects as initialAllSubjects,
  facultyList as initialFacultyList,
  studentList as initialStudentList, // For specific student list operations if needed
  departmentData as initialDepartmentData,
  initialMockAttendance,
  studentList,
  // You might not need to import individual lists like facultyList, studentList here
  // if mockUsersStore (derived from initialCombinedUsers) is the main source for user queries.
} from "../data/appMockData"; // Path to your appMockData.ts

import { QueryClient, QueryFunction } from "@tanstack/react-query"; // Make sure these are imported

// --- In-memory stores for mock data ---
// These stores will hold the current state of mock data, allowing for dynamic changes (add, edit, delete via API mocks)
let mockUsersStore = JSON.parse(JSON.stringify(initialCombinedUsers));
let mockCoursesStore = JSON.parse(JSON.stringify(initialAllSubjects)); // 'courses' are effectively 'subjects'
let mockClassesStore: any[] = []; // Starts empty, populated by POST /api/classes or can be pre-populated
let mockAttendanceStore = JSON.parse(JSON.stringify(initialMockAttendance));
let mockEnrollmentsStore: any[] = []; // Starts empty, populated by POST /api/enrollments

// Helper to reset stores to their initial state
export function resetMockStores() {
  mockUsersStore = JSON.parse(JSON.stringify(initialCombinedUsers));
  mockCoursesStore = JSON.parse(JSON.stringify(initialAllSubjects));
  mockClassesStore = []; // Reset classes
  mockAttendanceStore = JSON.parse(JSON.stringify(initialMockAttendance));
  mockEnrollmentsStore = []; // Reset enrollments
  console.log("[Mock API] All mock stores have been reset.");
}
// --- End In-memory stores ---

// --- Standard Mock Response Utilities ---
interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
  body?: any;
}

async function throwIfResNotOk(res: Response | MockResponse) {
  if (!res.ok) {
    const text = (await (res.text ? res.text() : Promise.resolve(JSON.stringify(res.body)))) || (res as any).statusText || `Error: ${res.status}`;
    throw new Error(`${res.status}: ${text}`);
  }
}

function mockResponse(data: any, status: number = 200): Promise<MockResponse> {
  const response = {
    ok: status >= 200 && status < 300,
    status: status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    body: data,
  };
  return Promise.resolve(response);
}
// --- End Mock Response Utilities ---

export const VITE_USE_MOCK = true; // Forcing mock mode

export async function apiRequest(method: string, url: string, data?: any): Promise<MockResponse> {
  const normalizedUrl = new URL(url, "http://localhost:3000"); // Base URL doesn't really matter for path/param parsing
  const path = normalizedUrl.pathname;
  const params = normalizedUrl.searchParams;

  console.log(`[Mock API Request] Method: ${method}, Path: ${path}, Params: ${params.toString()}, Body:`, data);

  if (VITE_USE_MOCK) {
    // --- User and Auth related mocks ---
    if (path.startsWith("/api/login") && method.toUpperCase() === "POST") {
      // Fallback: Find user by username and password from mockUsersStore
      const user = mockUsersStore.find(
        (u: any) => u.username === data.username && u.password === data.password
      );
      if (user) return mockResponse(user);
      return mockResponse({ message: "Invalid credentials" }, 401);
    }

    if (path.startsWith("/api/users")) {
      if (method.toUpperCase() === "GET") {
        const role = params.get("role");
        const department = params.get("department"); // For filtering faculty/students by dept
        let usersToReturn = [...mockUsersStore];

        if (role) {
          usersToReturn = usersToReturn.filter((u: any) => u.role === role);
        }
        if (department) {
          usersToReturn = usersToReturn.filter((u: any) => u.department === department);
        }
        // TODO: Handle GET /api/users/:id if needed by your app
        return mockResponse(usersToReturn);
      }
      if (method.toUpperCase() === "POST") { // Create user (student or faculty)
        const maxId = mockUsersStore.length > 0 ? Math.max(...mockUsersStore.map((u: any) => u.id)) : 0;
        const newUser = {
          id: maxId + 1, // Simple incrementing ID
          ...data,
          createdAt: new Date().toISOString(),
          profileImage: data.profileImage || null,
        };
        mockUsersStore.push(newUser);
        console.log("[Mock API] Added new user:", newUser, "Current store size:", mockUsersStore.length);
        return mockResponse(newUser, 201);
      }
    }

    // Inside apiRequest function in queryClient.ts

    // --- Timetable Mock ---
    if (path.startsWith("/api/timetable/student")) {
        const department = params.get("department");
        const semester = params.get("semester") ? parseInt(params.get("semester")!) : null;

        if (department && semester !== null) {
            // Find subjects for this department & semester
            const deptInfo = initialDepartmentData[department as "MCA" | "CSE"];
            const subjectIdsForSem = deptInfo?.academicYears["2024-2025"]?.semesters[semester]?.subjectIds || [];
            
            const relevantSubjects = mockCoursesStore.filter((s:any) => subjectIdsForSem.includes(s.id));

            // Create some mock class schedules based on these subjects
            const mockTimetable: any[] = [];
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            let classIdCounter = 0;

            relevantSubjects.forEach((subject: any, index: number) => {
                const dayIndex = index % days.length;
                mockTimetable.push({
                    id: `tt_${subject.id}_${dayIndex}`,
                    subjectName: subject.name,
                    subjectCode: subject.code,
                    day: days[dayIndex],
                    time: (index % 3 === 0) ? "09:00 AM - 10:30 AM" : (index % 3 === 1) ? "11:00 AM - 12:30 PM" : "02:00 PM - 03:30 PM",
                    room: `${department}-R${101 + index}`,
                    facultyName: mockUsersStore.find((f:any) => f.id === subject.facultyId)?.name || "N/A",
                });
            });
            return mockResponse(mockTimetable);
        }
        return mockResponse([], 400); // Bad request if params missing
    }

    // --- Events Mock ---
    if (path.startsWith("/api/events")) {
        const target = params.get("target"); // e.g., 'students'
        const department = params.get("department");
        const mockEvents = [
            { id: "evt1", title: `Dept. Seminar on AI (${department || 'General'})`, date: "2025-06-10", time: "02:00 PM", description: "Expert talk on latest AI trends.", type: "Seminar" },
            { id: "evt2", title: "Sports Day Trials", date: "2025-06-15", description: "Trials for upcoming annual sports meet.", type: "Sports"},
            { id: "evt3", title: "Tech Fest 'Innovate 2025'", date: "2025-07-01", description: "Annual technical festival.", type: "Fest"},
        ];
        // Further filter if needed by department or target
        return mockResponse(mockEvents);
    }

    // --- Messages/Notifications Mock ---
    if (path.startsWith("/api/notifications/student")) {
        // const studentId = path.split("/").pop();
        const mockMessages = [
            { id: "msg1", title: "Library Due Reminder", content: "Your borrowed book 'Advanced Java' is due tomorrow.", date: new Date(2025,4,24).toISOString(), read: false, type: "Reminder" },
            { id: "msg2", title: "Fee Payment Update", content: "Semester fee payment portal is now open.", date: new Date(2025,4,20).toISOString(), read: true, type: "Info" },
            { id: "msg3", from: "Admin", title: "Campus Closure Notice", content: "Campus will be closed on Monday due to public holiday.", date: new Date(2025,4,22).toISOString(), read: false, type: "Notice"},
        ];
        return mockResponse(mockMessages);
    }

    // --- Course (Subject) related mocks ---
    if (path.startsWith("/api/courses")) { // Courses are referred to as subjects in appMockData
      if (method.toUpperCase() === "GET") {
        let coursesToReturn = [...mockCoursesStore];
        const facultyId = params.get("facultyId") ? parseInt(params.get("facultyId")!) : null;
        const department = params.get("department");
        const semester = params.get("semester") ? parseInt(params.get("semester")!) : null;

        if (department) {
          coursesToReturn = coursesToReturn.filter((c: any) => c.department === department);
        }
        if (semester !== null) {
          coursesToReturn = coursesToReturn.filter((c: any) => c.semester === semester);
        }
        if (facultyId !== null) {
          // Find subjects taught by this faculty
          const facultyUser = mockUsersStore.find((u:any) => u.id === facultyId && u.role === 'faculty');
          const facultySubjectIds = facultyUser?.subjectIds || [];
          coursesToReturn = coursesToReturn.filter((c: any) => facultySubjectIds.includes(c.id));
        }
        
        // Add faculty name to courses
        coursesToReturn = coursesToReturn.map((course:any) => {
            const faculty = mockUsersStore.find((f:any) => f.id === course.facultyId && f.role === 'faculty');
            return {...course, facultyName: faculty ? faculty.name : "N/A"};
        });
        return mockResponse(coursesToReturn);
      }
      if (method.toUpperCase() === "POST") { // Create course (subject)
        const newCourse = {
          // ID generation for string IDs like "MCA107" needs a strategy.
          // For simplicity, let's assume new mock courses get a temporary numeric-like ID for now
          // or expect a code to be unique.
          id: `NEW_COURSE_${mockCoursesStore.length + 1}`, // Temporary ID strategy
          credits: data.credits || 4, // Default credits
          ...data, // name, code, description, department, semester, facultyId
        };
        mockCoursesStore.push(newCourse);
        console.log("[Mock API] Added new course (subject):", newCourse);
        return mockResponse(newCourse, 201);
      }
    }
    
    // --- Classes related mocks ---
     if (path.startsWith("/api/classes/today")) {
        const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayClasses = mockClassesStore.filter((c:any) => c.day === todayDay).map((c:any) => {
            const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId || cs.code === c.courseId); // Allow matching by ID or code
            const faculty = mockUsersStore.find((f:any) => f.id === course?.facultyId && f.role === 'faculty');
            return {...c, courseName: course?.name, facultyName: faculty?.name || "N/A" }
        });
        return mockResponse(todayClasses);
    }
    if (path.startsWith("/api/classes/course")) {
        const courseIdOrCode = path.split("/").pop()!;
        const classesForCourse = mockClassesStore.filter((c:any) => c.courseId === courseIdOrCode || c.courseId === parseInt(courseIdOrCode)).map((c:any) => {
            const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId || cs.code === c.courseId);
            const faculty = mockUsersStore.find((f:any) => f.id === course?.facultyId && f.role === 'faculty');
            return {...c, courseName: course?.name, facultyName: faculty?.name || "N/A" }
        });
        return mockResponse(classesForCourse);
    }
    if (path.startsWith("/api/classes")) {
        if (method.toUpperCase() === "GET") {
             const allRegularClasses = mockClassesStore.map((c:any) => {
                const course = mockCoursesStore.find((cs:any) => cs.id === c.courseId || cs.code === c.courseId);
                const faculty = mockUsersStore.find((f:any) => f.id === course?.facultyId && f.role === 'faculty');
                return {...c, courseName: course?.name, facultyName: faculty?.name || "N/A" }
            });
            return mockResponse(allRegularClasses);
        }
        if (method.toUpperCase() === "POST") {
            const maxId = mockClassesStore.length > 0 ? Math.max(...mockClassesStore.map(c => c.id)) : 0;
            const newClass = {
                id: maxId + 1,
                ...data // courseId, day, startTime, endTime, roomNumber
            };
            mockClassesStore.push(newClass);
            console.log("[Mock API] Added new class schedule:", newClass);
            return mockResponse(newClass, 201);
        }
    }

    // --- Enrollments ---
    if (path.startsWith("/api/enrollments/course")) {
        const courseIdOrCode = path.split("/").pop()!;
        const course = mockCoursesStore.find((cs:any) => cs.id === courseIdOrCode || cs.code === courseIdOrCode);
        const enrollmentsForCourse = mockEnrollmentsStore.filter((e:any) => e.courseId === course?.id);
        return mockResponse(enrollmentsForCourse);
    }
    if (path.startsWith("/api/enrollments")) {
        if (method.toUpperCase() === "GET") {
            return mockResponse(mockEnrollmentsStore);
        }
        if (method.toUpperCase() === "POST") {
            const maxId = mockEnrollmentsStore.length > 0 ? Math.max(...mockEnrollmentsStore.map(e => e.id)) : 0;
            const newEnrollment = {
                id: maxId + 1,
                enrollmentDate: new Date().toISOString(),
                ...data // studentId, courseId
            };
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
        let attendanceToReturn = [...mockAttendanceStore];
        const studentIdParam = params.get("studentId") ? parseInt(params.get("studentId")!) : null;
        const registrationNumberParam = params.get("registrationNumber");
        const departmentParam = params.get("department");
        const startDateParam = params.get("startDate");
        const endDateParam = params.get("endDate");

        if (studentIdParam !== null) {
            attendanceToReturn = attendanceToReturn.filter((a: any) => a.studentId === studentIdParam);
        } else if (registrationNumberParam) {
            attendanceToReturn = attendanceToReturn.filter((a: any) => a.registrationNumber === registrationNumberParam);
        }
        if (departmentParam) {
             attendanceToReturn = attendanceToReturn.filter((a:any) => a.department === departmentParam);
        }
        if (startDateParam) {
            attendanceToReturn = attendanceToReturn.filter((a: any) => new Date(a.date) >= new Date(startDateParam));
        }
        if (endDateParam) {
            attendanceToReturn = attendanceToReturn.filter((a: any) => new Date(a.date) <= new Date(endDateParam));
        }
        return mockResponse(attendanceToReturn);
    }
    if (path.startsWith("/api/attendance/class")) { // Expects /api/attendance/class/:classId/date/:dateString
        const parts = path.split("/"); // e.g. ['', 'api', 'attendance', 'class', 'CLASSID_DAY', 'date', 'YYYY-MM-DD']
        const date = parts.pop();
        parts.pop(); // remove 'date'
        const classIdMock = parts.pop(); // This is the mock classId from generateAttendanceData
        
        const records = mockAttendanceStore.filter((a:any) => a.classId === classIdMock && a.date === date);
        return mockResponse(records);
    }
    if (path.startsWith("/api/attendance")) {
        if (method.toUpperCase() === "POST") {
            const newRecord = { ...data };
            // Find existing record for update, or add new
            const existingIndex = mockAttendanceStore.findIndex((a:any) => 
                a.studentId === newRecord.studentId &&
                a.classId === newRecord.classId && // Ensure classId matches
                a.date === newRecord.date
            );
            if (existingIndex > -1) {
                mockAttendanceStore[existingIndex] = { ...mockAttendanceStore[existingIndex], ...newRecord, id: mockAttendanceStore[existingIndex].id };
                console.log("[Mock API] Updated attendance:", mockAttendanceStore[existingIndex]);
                return mockResponse(mockAttendanceStore[existingIndex], 200);
            } else {
                const newId = `${newRecord.subjectCode || 'SUB'}_${newRecord.studentId}_${new Date().getTime()}`; // More unique ID
                const recordToAdd = { ...newRecord, id: newId };
                mockAttendanceStore.push(recordToAdd);
                console.log("[Mock API] Added new attendance:", recordToAdd);
                return mockResponse(recordToAdd, 201);
            }
        }
        return mockResponse(mockAttendanceStore); // GET /api/attendance
    }

    // --- Dashboard related mocks ---
    if (path.startsWith("/api/dashboard/chart")) {
      const today = new Date();
      // Use studentList from appMockData, filter by department if needed (e.g. MCA)
      const mcaStudentsCount = studentList.filter(s => s.department === "MCA").length || 0;
      const chartData = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const present = Math.floor(Math.random() * (mcaStudentsCount * 0.7)) + Math.floor(mcaStudentsCount * 0.1);
          const absent = mcaStudentsCount - present;
          return { date: date.toISOString().split("T")[0], present, absent };
      });
      return mockResponse(chartData);
    }
    if (path.startsWith("/api/dashboard/class-summary")) {
      const mcaSubjects = mockCoursesStore.filter((s:any) => s.department === "MCA").slice(0, 4);
      const summary = mcaSubjects.map((subject:any) => {
        const faculty = mockUsersStore.find((f:any) => f.id === subject.facultyId && f.role === 'faculty');
        return {
            subjectName: subject.name,
            subjectCode: subject.code,
            facultyName: faculty?.name || "N/A",
            time: "10:00 AM", 
            attendanceRate: Math.floor(Math.random() * 20) + 75,
        };
      });
      return mockResponse(summary);
    }
    if (path.startsWith("/api/dashboard/recent-attendance")) {
      const recent = [...mockAttendanceStore]
        .filter((att: any) => att.department === "MCA") // Filter for MCA if dashboard is MCA specific
        .sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((att:any) => {
            const student = mockUsersStore.find((u:any) => u.id === att.studentId);
            return {...att, studentName: student?.name || att.studentName};
        });
      return mockResponse(recent);
    }
    if (path.startsWith("/api/dashboard/alerts")) {
      const mcaDetainedStudents = studentList.filter(s => s.department === "MCA" && s.type === "Detained");
      const alerts = mcaDetainedStudents.slice(0, 2).map(student => ({
        id: `alert_${student.registrationNumber}`,
        message: `Student ${student.name} (${student.registrationNumber}) has low attendance.`,
        type: "warning", date: new Date().toISOString(),
      }));
      if(alerts.length === 0) alerts.push({ id: 'info_mca_ok', message: 'MCA attendance is generally good.', type: 'info', date: new Date().toISOString() });
      return mockResponse(alerts);
    }
    if (path.startsWith("/api/dashboard/stats")) {
      const mcaStudents = studentList.filter(s => s.department === "MCA");
      const totalStudents = mcaStudents.length;
      const overallAttendance = Math.floor(Math.random() * 10) + 80; // 80-90%
      const todayDayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const classesTodayCount = mockClassesStore.filter((c: any) => {
          const course = mockCoursesStore.find((cs: any) => cs.id === c.courseId || cs.code === c.courseId);
          return c.day === todayDayStr && course?.department === "MCA";
      }).length;
      const absentToday = mockAttendanceStore.filter((a:any) => a.department === "MCA" && a.date === new Date().toISOString().split('T')[0] && a.status === 'absent').length;

      return mockResponse({
        attendanceRate: overallAttendance,
        totalStudents: totalStudents,
        classesToday: classesTodayCount || 2, // Fallback
        absentStudents: absentToday || Math.floor(totalStudents * 0.05), // Fallback
      });
    }

    console.warn(`[Mock API Request] No specific mock handler for ${method} ${path}. Returning 404.`);
    return mockResponse({ message: `Mock for ${method} ${path} not found.` }, 404);
  }

  // Fallback for real fetch if VITE_USE_MOCK is false
  console.warn("[Mock API Request] VITE_USE_MOCK is false. Attempting real fetch.");
  const realResponse = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  return {
      ok: realResponse.ok,
      status: realResponse.status,
      json: () => realResponse.json(),
      text: () => realResponse.text(),
      body: realResponse.body 
  };
}

// --- React Query Client Setup ---
export const getQueryFnConstructor: <T>(options?: { // Made options optional
  on401?: any; // Type for on401 can be refined if used
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    let fullUrl = url;
    const paramsObj = queryKey[1] as Record<string, string | number | boolean | undefined | null> | undefined;

    if (paramsObj && typeof paramsObj === 'object' && Object.keys(paramsObj).length > 0) {
        const queryParams = new URLSearchParams();
        for (const key in paramsObj) {
            if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
                queryParams.append(key, String(paramsObj[key]));
            }
        }
        if (queryParams.toString()) {
          fullUrl += `?${queryParams.toString()}`;
        }
    }
    
    const res = await apiRequest('GET', fullUrl);
    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFnConstructor() as QueryFunction<unknown, readonly unknown[], unknown>,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, 
      retry: (failureCount, error: any) => {
        if (error.status === 404 || error.status === 401 || error.status === 403) {
          return false;
        }
        return failureCount < 2; 
      },
    },
    mutations: {
      retry: false,
    },
  },
});