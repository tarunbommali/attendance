// src/App.tsx
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useState, useEffect, lazy, Suspense, ReactNode } from "react";
import { getUserByCredentials } from "./data/mockUser";

// --- Lazy load page components --- (as before)
const NotFound = lazy(() => import("./pages/not-found"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Login = lazy(() => import("./pages/login"));
const StudentDashboard = lazy(() => import("./pages/students/student-dashboard"));
const StudentManagement = lazy(() => import("./pages/student-management"))
const MarkAttendance = lazy(() => import("./pages/mark-attendance"));
const AttendanceReports = lazy(() => import("./pages/attendance-reports"));
const Students = lazy(() => import("./pages/students"));
const Classes = lazy(() => import("./pages/classes"));
const Faculty = lazy(() => import("./pages/admins/faculty"));

export interface User {
  currentSemester: ReactNode;
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
  department?: string;
  registrationNumber?: string;
  semester?: number;
  subjects?: string[];
}

const MOCK_DELAY = 300;
const LOCAL_STORAGE_USER_KEY = "loggedInUser";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial localStorage check
  const [_location, setLocation] = useLocation();

  useEffect(() => {
    console.log("useAuth: Initializing - checking localStorage for user...");
    setIsLoading(true); // Ensure loading is true during check
    try {
      const storedUserJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (storedUserJson) {
        const storedUser: User = JSON.parse(storedUserJson);
        setUser(storedUser);
        console.log("useAuth: User found in localStorage:", storedUser);
      } else {
        console.log("useAuth: No user in localStorage.");
        setUser(null); // Explicitly set to null if not found
      }
    } catch (error) {
      console.error("useAuth: Error reading user from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
    }
    // Simulate a small delay for the initial check if needed, then set loading to false
    // For immediate effect after localStorage read:
    setIsLoading(false);
    console.log("useAuth: Finished localStorage check.");
  }, []); // Empty dependency array ensures this runs once on mount

  const login = async (username: string, password: string): Promise<User> => {
    console.log("useAuth Mock: Attempting login with", username, password);
    setIsLoading(true);
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = getUserByCredentials(username, password);
        if (foundUser) {
          const loggedInUser: User = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            profileImage: foundUser.profileImage,
            department: (foundUser as any).department,
            registrationNumber: (foundUser as any).registrationNumber,
            semester: (foundUser as any).semester,
            subjects: (foundUser as any).subjects,
            currentSemester: undefined,
          };
          localStorage.setItem(
            LOCAL_STORAGE_USER_KEY,
            JSON.stringify(loggedInUser)
          );
          setUser(loggedInUser);
          setIsLoading(false);
          console.log("useAuth Mock: Logged in as", loggedInUser);
          resolve(loggedInUser);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY); // Clear on failed login too
          setUser(null);
          setIsLoading(false);
          console.error("useAuth Mock: Login failed for", username);
          reject(new Error("Invalid username or password"));
        }
      }, MOCK_DELAY);
    });
  };

  const logout = async () => {
    console.log("useAuth Mock: Simulating logout");
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setUser(null);
        setIsLoading(false);
        console.log("useAuth Mock: Logged out");
        setLocation("/login"); // Navigate to login after logout
        resolve();
      }, MOCK_DELAY / 2);
    });
  };

  return { user, isLoading, login, logout }; // Removed setLocation from return, use wouter's directly if needed
}

function AppRouter() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    // This effect runs when auth state or location changes
    if (!isAuthLoading) {
      // Only proceed if the initial auth check is complete
      console.log(
        "AppRouter Effect: Auth check complete. User:",
        user,
        "Location:",
        location
      );
      if (user && location === "/login") {
        console.log("AppRouter: User logged in and on /login. Redirecting.");
        if (user.role === "student") navigate("/student-view");
        else navigate("/");
      } else if (
        !user &&
        location !== "/login" &&
        location !== "/student-view" &&
        location !== "/unauthorized"
      ) {
        // If no user and trying to access a protected path (not login, student-view, or unauthorized)
        console.log(
          "AppRouter: No user, attempting to access restricted page",
          location,
          ". Redirecting to /login."
        );
        // This will be caught by ProtectedRoute, but as a fallback:
        // navigate("/login"); // Commented out: ProtectedRoute handles this better
      }
    }
  }, [user, isAuthLoading, location, navigate]);

  if (isAuthLoading) {
    // Shows "Initializing App..." when useAuth's isLoading is true (during initial localStorage check)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Initializing App...
      </div>
    );
  }

  const routeFallback = (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Loading page...
    </div>
  );

  interface ProtectedRouteProps {
    path: string;
    component?: React.ComponentType<any>;
    children?: React.ReactNode;
    allowedRoles?: string[];
  }

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    component: Component,
    children,
    allowedRoles,
    ...rest
  }) => {
    const { user: currentUserFromHook, isLoading: authOpInProgress } =
      useAuth();

    // If any auth operation (like login/logout triggered elsewhere) is happening, show processing.
    // Note: This might momentarily flash if navigation happens faster than state update.
    if (authOpInProgress && !currentUserFromHook) {
      // Show processing if loading AND no user yet
      return (
        <div className="flex items-center justify-center min-h-screen text-lg">
          Processing...
        </div>
      );
    }

    if (!currentUserFromHook) {
      // If no user after all checks/ops, redirect to login
      console.log(
        `ProtectedRoute (${rest.path}): No user, redirecting to /login.`
      );
      return <Redirect to="/login" />;
    }
    if (allowedRoles && !allowedRoles.includes(currentUserFromHook.role)) {
      console.log(
        `ProtectedRoute (${rest.path}): User role ${currentUserFromHook.role} not in allowed: ${allowedRoles.join(", ")}. Redirecting to /unauthorized.`
      );
      return <Redirect to="/unauthorized" />;
    }
    // console.log(`ProtectedRoute (${rest.path}): Access granted for user role ${currentUserFromHook.role}.`);
    return <Route {...rest}>{Component ? <Component /> : children}</Route>;
  };

  const AdminRoute: React.FC<Omit<ProtectedRouteProps, "allowedRoles">> = (
    props
  ) => <ProtectedRoute {...props} allowedRoles={["admin"]} />;

  const FacultyAdminRoute: React.FC<
    Omit<ProtectedRouteProps, "allowedRoles">
  > = (props) => (
    <ProtectedRoute {...props} allowedRoles={["faculty", "admin"]} />
  );

  const StudentRoute: React.FC<Omit<ProtectedRouteProps, "allowedRoles">> = (
    props
  ) => <ProtectedRoute {...props} allowedRoles={["student"]} />;

  const UnauthorizedPage = () => {
    const { user: currentUserForUnauthorized } = useAuth();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">
          🚫 Unauthorized Access
        </h1>
        <p className="text-lg mb-6">
          You do not have the necessary permissions to view this page.
        </p>
        <button
          onClick={() =>
            navigate(
              currentUserForUnauthorized
                ? currentUserForUnauthorized.role === "student"
                  ? "/student/home"
                  : "/"
                : "/login"
            )
          }
          className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          {currentUserForUnauthorized ? "Go to My Dashboard" : "Go to Login"}
        </button>
        {currentUserForUnauthorized && (
          <button
            onClick={logout}
            className="mt-4 px-6 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    );
  };

  return (
    <Suspense fallback={routeFallback}>
      <Switch>
        <Route path="/login">
          {/* If user is already loaded from localStorage and exists, redirect from login page */}
          {/* The effect in AppRouter also handles this, but this provides an immediate redirect if possible */}
          {!isAuthLoading && user ? (
            user.role === "student" ? (
              <Redirect to="/student/home" />
            ) : (
              <Redirect to="/" />
            )
          ) : (
            <Login />
          )}
        </Route>

        <Route path="/unauthorized" component={UnauthorizedPage} />
        {/* Protected Routes */}
        <FacultyAdminRoute path="/" component={Dashboard} />
        <StudentRoute path="/student/home" component={StudentDashboard} />

        <FacultyAdminRoute path="/mark-attendance" component={MarkAttendance} />
        <FacultyAdminRoute
          path="/attendance-reports"
          component={AttendanceReports}
        />
        <AdminRoute path="/students" component={Students} />
        <FacultyAdminRoute path="/classes" component={Classes} />
        <AdminRoute path="/faculty" component={Faculty} />
        <AdminRoute path="/student-management" component={StudentManagement} />

        {/* Fallback Route: If user exists, show NotFound, else redirect to login */}
        <Route>{user ? <NotFound /> : <Redirect to="/login" />}</Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
