// src/pages/login.tsx
import { useState, useEffect } from "react"; // Added useEffect
import { AuthForm } from "../components/auth-form";
import { useAuth, User } from "../App";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";

export default function Login() {
  const { login, user, isLoading: authIsLoading } = useAuth(); // Get user and authIsLoading
  const [location, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed isLoading for clarity
  const { toast } = useToast();

  // This effect will run if the user is already authenticated when Login page mounts
  // (e.g., due to localStorage) and redirect them.
  useEffect(() => {
    if (!authIsLoading && user) { // if not checking auth and user exists
      toast({
        title: "Already logged in!",
        description: `Redirecting to your dashboard, ${user.name}.`,
      });
      if (user.role === "student") {
        setLocation("/student-view");
      } else {
        setLocation("/");
      }
    }
  }, [user, authIsLoading, setLocation, toast]);


  const handleLogin = async (username: string, password: string) => {
    setIsSubmitting(true);
    try {
      const loggedInUser: User = await login(username, password);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      });

      // Redirection based on role
      if (loggedInUser.role === "student") {
        setLocation("/student-view");
      } else if (loggedInUser.role === "admin" || loggedInUser.role === "faculty") {
        setLocation("/");
      } else {
        setLocation("/"); // Fallback
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid username or password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the form if the user is already logged in and we are about to redirect
  // or if initial auth check is still in progress
  if (authIsLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }
  if (user && !authIsLoading) { // User is loaded and exists, redirection should be happening
    return <div className="flex items-center justify-center min-h-screen text-lg">Redirecting...</div>;
  }


  return <AuthForm onSubmit={handleLogin} isLoading={isSubmitting} />;
}