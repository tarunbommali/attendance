// src/components/auth-form.tsx
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"; // Removed CardFooter
import { ClipboardCheckIcon } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AuthFormProps {
  onSubmit: (username: string, password: string) => Promise<any>;
  isLoading: boolean;
  title?: string;
  description?: string;
  roleSpecificClass?: string;
  usernamePlaceholder?: string;
  passwordPlaceholder?: string;
}

const formSchema = z.object({
  username: z.string().min(3, "Username/ID must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function AuthForm({
  onSubmit,
  isLoading,
  title = "Attendly Login",
  description = "Enter your credentials to access your account",
  roleSpecificClass = "",
  usernamePlaceholder = "Enter your username",
  passwordPlaceholder = "Enter your password"
}: AuthFormProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    try {
      await onSubmit(data.username, data.password);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <Card className={`w-full ${roleSpecificClass}`}> {/* roleSpecificClass for border highlight */}
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <ClipboardCheckIcon className="h-8 w-8" />
            </div>
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm dark:bg-destructive/20 dark:text-red-300">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / ID</FormLabel>
                  <FormControl>
                    <Input placeholder={usernamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={passwordPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* CardFooter with demo credentials has been removed */}
    </Card>
  );
}