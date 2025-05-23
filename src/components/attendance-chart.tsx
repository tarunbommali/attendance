import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

interface ChartData {
  month: string;
  present: number;
  late: number;
  absent: number;
}

export function AttendanceChart() {
  const { data: chartData, isLoading, error } = useQuery<ChartData[]>({
    queryKey: ['/api/dashboard/chart'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Monthly attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Monthly attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-red-500">Failed to load chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>Monthly attendance statistics</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-80 w-full">
          <div className="flex justify-between mb-3">
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-primary-500 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-red-400 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Absent</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 rounded-full bg-yellow-400 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Late</span>
            </div>
          </div>
          
          {/* Chart Visualization */}
          <div className="relative h-60 flex items-end">
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {chartData.map((data: ChartData) => (
                <div key={data.month}>{data.month}</div>
              ))}
            </div>
            
            {/* Y-axis grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
              <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
              <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
              <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>100%</div>
              <div>75%</div>
              <div>50%</div>
              <div>25%</div>
              <div>0%</div>
            </div>
            
            {/* Chart bars */}
            <div className="flex-1 flex justify-around items-end pl-6 pb-6">
              {chartData.map((data: ChartData, index: number) => (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div 
                    className="w-8 bg-primary-500 rounded-t" 
                    style={{ height: `${data.present}%` }}
                  ></div>
                  <div 
                    className="w-8 bg-yellow-400 rounded-t" 
                    style={{ height: `${data.late}%` }}
                  ></div>
                  <div 
                    className="w-8 bg-red-400 rounded-t" 
                    style={{ height: `${data.absent}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
