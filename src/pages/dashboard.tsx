import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardCheckIcon,
  UsersIcon,
  CalendarIcon,
  AlertCircleIcon
} from "lucide-react";
import { Layout } from "../components/layout";
import { StatCard } from "../components/stat-card";
import { DateFilter } from "../components/date-filter";
import { AttendanceChart } from "../components/attendance-chart";
import { ClassSummary } from "../components/class-summary";
import { RecentAttendance } from "../components/recent-attendance";
import { AttendanceAlerts } from "../components/attendance-alerts";
import { Button } from "../components/ui/button";
import { Download, Plus } from "lucide-react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({ startDate: "01/04/2023", endDate: "30/04/2023" });
  
  type DashboardStats = {
    attendanceRate: number;
    totalStudents: number;
    classesToday: number;
    absentStudents: number;
    // add other properties if needed
  };

  const { data: dashboardStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">An overview of attendance statistics and insights.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Export Report
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>
      
      {/* Date Filter */}
      <DateFilter onDateRangeChange={handleDateRangeChange} />
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <StatCard 
          title="Attendance Rate" 
          value={isLoading ? "Loading..." : `${dashboardStats?.attendanceRate}%`}
          icon={ClipboardCheckIcon}
          change={{ value: "3.2%", isPositive: true }}
          color="primary"
          href="/attendance-reports"
        />
        
        <StatCard 
          title="Total Students" 
          value={isLoading ? "Loading..." : dashboardStats?.totalStudents || 0}
          icon={UsersIcon}
          change={{ value: "12", isPositive: true }}
          color="secondary"
          href="/students"
        />
        
        <StatCard 
          title="Classes Today" 
          value={isLoading ? "Loading..." : dashboardStats?.classesToday || 0}
          icon={CalendarIcon}
          change={{ value: "2", isPositive: false }}
          color="accent"
          href="/classes"
        />
        
        <StatCard 
          title="Absent Students" 
          value={isLoading ? "Loading..." : dashboardStats?.absentStudents || 0}
          icon={AlertCircleIcon}
          change={{ value: "8", isPositive: false }}
          color="red"
          href="/attendance-reports"
        />
      </div>
      
      {/* Attendance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <AttendanceChart />
        </div>
        
        {/* Class Summary */}
        <div>
          <ClassSummary />
        </div>
      </div>
      
      {/* Recent Attendance & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAttendance />
        <AttendanceAlerts />
      </div>
    </Layout>
  );
}
