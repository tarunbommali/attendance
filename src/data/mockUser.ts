// Mock users data for the application
export const mockUsers = [
  // Admin users
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    email: "admin@college.edu",
    role: "admin",
    profileImage: null,
    createdAt: new Date("2023-01-01"),
  },

  // Faculty users
  {
    id: 2,
    username: "haritha",
    password: "faculty123",
    name: "Haritha",
    email: "haritha@college.edu",
    role: "faculty",
    department: "MCA",
    profileImage: null,
    subjects: ["MCA103", "MCA105"], // Java, Operating Systems
    createdAt: new Date("2023-01-15"),
  },
  {
    id: 3,
    username: "manasa",
    password: "faculty123",
    name: "Manasa Devi",
    email: "manasa@college.edu",
    role: "faculty",
    department: "MCA",
    profileImage: null,
    subjects: ["MCA104", "MCA106"], // DBMS, Data Structures
    createdAt: new Date("2023-01-20"),
  },

  // Student users (samples from the MCA roll list)
  {
    id: 101,
    username: "24vv1f0001",
    password: "student123",
    name: "ALLUMALLI HARSHITHA",
    email: "harshitha@college.edu",
    role: "student",
    department: "MCA",
    registrationNumber: "24VV1F0001",
    semester: 1,
    profileImage: null,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 102,
    username: "24vv1f0022",
    password: "student123",
    name: "KELLA MANASA",
    email: "manasa.k@college.edu",
    role: "student",
    department: "MCA",
    registrationNumber: "24VV1F0022",
    semester: 1,
    profileImage: null,
    createdAt: new Date("2024-01-16"),
  },
  {
    id: 108,
    username: "24vv1f0008",
    password: "student123",
    name: "TARUN BOMMALI",
    email: "tarunbommali@college.edu",
    role: "student",
    department: "MCA",
    registrationNumber: "24VV1F0010",
    semester: 1,
    profileImage: null,
    createdAt: new Date("2024-01-17"),
  },
];

// Get user by username and password (for login)
export function getUserByCredentials(username: string, password: string) {
  return mockUsers.find(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() &&
      user.password === password,
  );
}

// Get user by ID
export function getUserById(id: number) {
  return mockUsers.find((user) => user.id === id);
}

// Get all users by role
export function getUsersByRole(role: string, mockUsersStore: any) {
  return mockUsers.filter((user) => user.role === role);
}

// Get faculty by department and subject
export function getFacultyBySubject(subjectCode: string) {
  return mockUsers.filter(
    (user) =>
      user.role === "faculty" &&
      user.subjects &&
      user.subjects.includes(subjectCode),
  );
}
