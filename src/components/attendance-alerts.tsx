import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon, CheckCircleIcon } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
}

export function AttendanceAlerts() {
  const { data: alertsData, isLoading, error } = useQuery<Alert[]>({
    queryKey: ['/api/dashboard/alerts'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/alerts');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Attendance Alerts</CardTitle>
            <CardDescription>Students needing attention</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p>Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !alertsData) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>Attendance Alerts</CardTitle>
            <CardDescription>Students needing attention</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p className="text-red-500">Failed to load alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <InfoIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-start border-b">
        <div>
          <CardTitle>Attendance Alerts</CardTitle>
          <CardDescription>Students needing attention</CardDescription>
        </div>
        <Button variant="link" className="text-primary-600 dark:text-primary-400 p-0">
          Manage alerts
        </Button>
      </CardHeader>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
        {alertsData.map((alert: Alert) => (
          <CardContent key={alert.id} className="px-5 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getAlertIcon(alert.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                <div className="mt-2 flex space-x-2">
                  <Button size="sm" variant="secondary" className="text-xs">
                    Contact Student
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        ))}
      </div>
    </Card>
  );
}
