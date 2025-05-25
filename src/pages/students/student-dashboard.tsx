// src/pages/StudentDashboard.tsx
import { useState, useEffect, Suspense, lazy } from "react";
import { useAuth, User } from "../../App";
import { useLocation } from "wouter";
import { useTheme } from "../../components/theme-provider"; // Assuming this is your custom hook from theme-provider.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { ClipboardCheckIcon, LogOutIcon, SunIcon, MoonIcon, LayoutDashboard, CalendarDays, ListChecks, MessageSquare, Newspaper } from "lucide-react";
import StudentAttendanceView from "./student-attendance-view";


export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading, logout: authLogout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [_location, navigate] = useLocation(); // For navigation if needed

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authLogout();
    // Navigation to /login is handled by useAuth or AppRouter
  };

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <p className="text-xl animate-pulse">Loading Student Dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== "student") {
    // Should be caught by routing, but good to have a fallback.
    navigate("/login", { replace: true });
    return null; 
  }
  
  const currentDisplayTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;


  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <ClipboardCheckIcon className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Attendly</h1>
              <h2 className="text-xs text-muted-foreground">JNTU-GV Student Portal</h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(currentDisplayTheme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${currentDisplayTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {currentDisplayTheme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOutIcon className="mr-1.5 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Tabs */}
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">Your personalized dashboard.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6 print:hidden">
            <TabsTrigger value="overview" className="text-xs sm:text-sm"><LayoutDashboard className="mr-1.5 h-4 w-4"/>Overview</TabsTrigger>
          </TabsList>

          <Suspense fallback={<div className="text-center p-10">Loading section...</div>}>
            <TabsContent value="overview">
              <StudentAttendanceView user={user} /> {/* Pass user as prop */}
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
       <footer className="py-4 border-t bg-background print:hidden">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} JNTU-GV Attendly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}