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
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ClipboardCheckIcon } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AuthFormProps {
  onSubmit: (username: string, password: string) => Promise<any>;
  isLoading: boolean;
}

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function AuthForm({ onSubmit, isLoading }: AuthFormProps) {
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
      setError(error.message || "Failed to login. Please try again.");
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          error.message || "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 text-white p-3 rounded-full">
              <ClipboardCheckIcon className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-thin text-center">
            Attendly
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" autoComplete="username" {...field} />
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
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center mb-2">
            Demo Credentials:
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="p-2 border rounded text-xs">
              <div className="font-semibold mb-1">Admin</div>
              <div>Username: admin</div>
              <div>Password: admin123</div>
            </div>
            <div className="p-2 border rounded text-xs">
              <div className="font-semibold mb-1">Faculty</div>
              <div>Username: johnson</div>
              <div>Password: faculty123</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
