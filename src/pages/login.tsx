// src/pages/login.tsx
import React, { useState, useEffect } from "react";
import { AuthForm } from "../components/auth-form";
import { useAuth, User } from "../App";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";
import {
  ClipboardCheckIcon,
  UserCog,      // Keep if you might add HOD back
  ShieldPlus,   // Student icon as per your code
  Briefcase,
  ShieldCheck,
  LogInIcon,
  InfoIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

type LoginRole = "student" | "faculty" | "admin";

interface RoleConfig {
  title: string;
  description: string;
  details: string[];
  highlightClass: string;    // For form card's top border
  accentClass: string;       // For text & icon highlights in the info panel
  activeButtonClass: string; // Tailwind classes for active button (bg, text, hover)
  ringColorClass: string;    // Tailwind classes for the active button's ring
  usernamePlaceholder: string;
  icon: React.ElementType;
  formTitleSuffix: string;
}

const roleConfigs: Record<LoginRole, RoleConfig> = {
  student: {
    title: "Student",
    description: "Access your academic world.",
    details: [
      "View your attendance records in detail.",
      "Check your class timetable and schedule.",
      "Stay updated with university events and announcements.",
    ],
    highlightClass: "border-blue-500 dark:border-blue-400",
    accentClass: "text-blue-500 dark:text-blue-400",
    activeButtonClass: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
    ringColorClass: "ring-blue-500 dark:ring-blue-400",
    usernamePlaceholder: "Enter Registration No. / Username",
    icon: ShieldPlus,
    formTitleSuffix: "Sign In",
  },
  faculty: {
    title: "Faculty",
    description: "Manage your academic responsibilities.",
    details: [
      "Mark and manage student attendance seamlessly.",
      "Access class schedules and course materials.",
      "Generate insightful attendance reports.",
    ],
    highlightClass: "border-green-500 dark:border-green-400",
    accentClass: "text-green-500 dark:text-green-400",
    activeButtonClass: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white",
    ringColorClass: "ring-green-500 dark:ring-green-400",
    usernamePlaceholder: "Enter Faculty Username",
    icon: Briefcase,
    formTitleSuffix: "Sign In",
  },
  admin: {
    title: "Admin",
    description: "Oversee and manage the entire system.",
    details: [
      "Full access to user and course management.",
      "Monitor system-wide statistics and reports.",
      "Configure system settings and academic parameters.",
    ],
    highlightClass: "border-purple-500 dark:border-purple-400",
    accentClass: "text-purple-500 dark:text-purple-400",
    activeButtonClass: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white",
    ringColorClass: "ring-purple-500 dark:ring-purple-400",
    usernamePlaceholder: "Enter Admin Username",
    icon: ShieldCheck,
    formTitleSuffix: "Sign In",
  },
};

export default function Login() {
  const { login, user, isLoading: authIsLoading } = useAuth();
  const [_location, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const { toast } = useToast();

  useEffect(() => {
    if (!authIsLoading && user) {
      if (user.role === "student") {
        setLocation("/student-view");
      } else {
        setLocation("/");
      }
    }
  }, [user, authIsLoading, setLocation]);

  const handleLogin = async (username: string, password: string) => {
    setIsSubmitting(true);
    try {
      const loggedInUser: User = await login(username, password);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      });
      if (loggedInUser.role === "student") {
        setLocation("/student-view");
      } else if (loggedInUser.role === "admin" || loggedInUser.role === "faculty") {
        setLocation("/");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-lg animate-pulse">Initializing...</div>;
  }

  const currentRoleConfig = roleConfigs[selectedRole];
  const SelectedRoleIcon = currentRoleConfig.icon;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-800 flex flex-col justify-center items-center p-4 lg:p-8 selection:bg-primary/40 selection:text-primary-foreground overflow-hidden">
      <div className="w-full max-w-6xl mx-auto animate-fadeIn">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left Branding Panel */}
          <div className="flex flex-col text-center lg:text-left pt-8 lg:pt-0">
            <div className="inline-flex items-center gap-3 mb-6 lg:mb-8 self-center lg:self-start">
              <ClipboardCheckIcon className="h-12 w-12 text-primary animate-bounceSlow" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-thin tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-blue-400">
                  Attendly
                </h1>
                <p className="text-base lg:text-lg text-muted-foreground">JNTU-GV Smart Attendance Portal</p>
              </div>
            </div>
 
            <div className="mt-8 p-4 rounded-lg bg-muted/30 dark:bg-slate-800/30 border border-dashed border-border text-xs text-muted-foreground">
                <div className="flex items-center mb-2">
                    <InfoIcon className="h-4 w-4 mr-2 text-primary/80" />
                    <h4 className="font-semibold text-foreground/80">Demo Credentials:</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div>Admin: <code className="font-mono text-primary/90">admin</code> / <code className="font-mono text-primary/90">admin123</code></div>
                    <div>Faculty: <code className="font-mono text-primary/90">haritha</code> / <code className="font-mono text-primary/90">faculty123</code></div>
                    <div>Student: <code className="font-mono text-primary/90">24vv1f0001</code> / <code className="font-mono text-primary/90">student123</code></div>
                </div>
            </div>
          </div>

          {/* Right Login Form Panel */}
          <div className="w-full max-w-md mx-auto lg:mx-0 flex flex-col">
            <div className={`bg-card p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 ${currentRoleConfig.highlightClass} transition-all duration-500 ease-in-out`}>
              <AuthForm
                onSubmit={handleLogin}
                isLoading={isSubmitting}
                title={`${currentRoleConfig.title} ${currentRoleConfig.formTitleSuffix}`}
                description="Please enter your credentials below."
                usernamePlaceholder={currentRoleConfig.usernamePlaceholder}
                passwordPlaceholder="Enter your password"
              />
            </div>

            {/* Role Selection Buttons - Moved to bottom of this panel */}
            <div className="mt-8 w-full">
              <p className="text-left text-sm text-muted-foreground mb-3">Sign in as a different role:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(roleConfigs) as LoginRole[]).map((roleKey) => {
                  const ConfigIcon = roleConfigs[roleKey].icon;
                  const isActive = selectedRole === roleKey;
                  return (
                    <Button
                      key={roleKey}
                      variant={isActive ? undefined : "outline"} // Remove variant for active, rely on custom classes
                      onClick={() => setSelectedRole(roleKey)}
                      className={cn(
                        "w-full justify-center py-3 text-sm h-auto transition-all duration-200 ease-in-out group hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isActive 
                          ? `${roleConfigs[roleKey].activeButtonClass} ${roleConfigs[roleKey].ringColorClass}` // Apply active bg, text, hover and ring
                          : "bg-background hover:bg-muted/50 dark:bg-slate-800 dark:hover:bg-slate-700/50 border border-input" // Explicit non-active styling
                      )}
                    >
                      <ConfigIcon className={cn(
                        "h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110",
                        // Icon color will be inherited from button's text color (e.g., text-white in activeButtonClass)
                        // or use accentClass for non-active icons if their button text is not accent.
                        !isActive && roleConfigs[roleKey].accentClass 
                      )} />
                      {roleConfigs[roleKey].title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 py-3 text-center w-full text-xs text-muted-foreground print:hidden opacity-70">
        © {new Date().getFullYear()} JNTU-GV Attendly Portal. All rights reserved.
      </footer>
    </div>
  );
}