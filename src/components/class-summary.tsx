import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClassSummary {
  id: number;
  name: string;
  instructor: string;
  attendanceRate: number;
}

export function ClassSummary() {
  const { data: classSummaryData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/class-summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance Summary</CardTitle>
          <CardDescription>Top 5 classes by attendance rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p>Loading summary data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !classSummaryData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance Summary</CardTitle>
          <CardDescription>Top 5 classes by attendance rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[16rem]">
            <p className="text-red-500">Failed to load summary data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 80) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="divide-y divide-gray-200 dark:divide-gray-700">
      <CardHeader>
        <CardTitle>Class Attendance Summary</CardTitle>
        <CardDescription>Top 5 classes by attendance rate</CardDescription>
      </CardHeader>
      
      {classSummaryData.map((classData: ClassSummary) => (
        <CardContent key={classData.id} className="px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{classData.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{classData.instructor}</p>
            </div>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                <div 
                  className={`${getProgressColor(classData.attendanceRate)} h-2 rounded-full`} 
                  style={{ width: `${classData.attendanceRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{classData.attendanceRate}%</span>
            </div>
          </div>
        </CardContent>
      ))}
      
      <CardFooter className="px-5 py-4">
        <Button variant="link" className="text-primary-600 dark:text-primary-400 p-0">
          View all classes →
        </Button>
      </CardFooter>
    </Card>
  );
}
