import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (status.toLowerCase()) {
    case 'present':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'text-green-500'
      };
    case 'absent':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: 'text-red-500'
      };
    case 'late':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: 'text-yellow-500'
      };
    case 'excused':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'text-blue-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'text-gray-500'
      };
  }
}

export function getAlertTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'alert':
    case 'error':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    case 'success':
      return 'text-green-500';
    case 'info':
    default:
      return 'text-gray-400';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
