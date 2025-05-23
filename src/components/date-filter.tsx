import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CalendarIcon } from "lucide-react";

interface DateFilterProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  onPeriodChange?: (period: string) => void;
}

export function DateFilter({ onDateRangeChange, onPeriodChange }: DateFilterProps) {
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("01/04/2023");
  const [endDate, setEndDate] = useState("30/04/2023");

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (onPeriodChange) {
      onPeriodChange(value);
    }

    // Automatically update date range based on period
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (value) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date(today.setDate(today.getDate() + 6));
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "semester":
        // Assuming a semester is 4 months
        start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 4) * 4, 1);
        end = new Date(today.getFullYear(), Math.floor(today.getMonth() / 4) * 4 + 4, 0);
        break;
      default:
        break;
    }

    if (value !== "custom") {
      const formattedStart = formatDate(start);
      const formattedEnd = formatDate(end);
      
      setStartDate(formattedStart);
      setEndDate(formattedEnd);
      
      if (onDateRangeChange) {
        onDateRangeChange(formattedStart, formattedEnd);
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (onDateRangeChange) {
      onDateRangeChange(e.target.value, endDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (onDateRangeChange) {
      onDateRangeChange(startDate, e.target.value);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-sm font-medium text-gray-700 mr-3 dark:text-gray-300">Viewing:</span>
            <div className="relative">
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10"
                placeholder="Start date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10"
                placeholder="End date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
