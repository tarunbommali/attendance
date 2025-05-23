import { cn } from "../lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  color: "primary" | "secondary" | "accent" | "red";
  href?: string;
}

export function StatCard({ title, value, icon: Icon, change, color, href }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary-100 dark:bg-primary-900",
      text: "text-primary-600 dark:text-primary-400",
      link: "text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
    },
    secondary: {
      bg: "bg-secondary-100 dark:bg-secondary-900",
      text: "text-secondary-600 dark:text-secondary-400",
      link: "text-secondary-600 hover:text-secondary-500 dark:text-secondary-400 dark:hover:text-secondary-300"
    },
    accent: {
      bg: "bg-accent-100 dark:bg-accent-900",
      text: "text-accent-600 dark:text-accent-400",
      link: "text-accent-600 hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300"
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-600 dark:text-red-400",
      link: "text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
    }
  };
  
  const getChange = () => {
    if (!change) return null;
    
    return (
      <div className={cn(
        "ml-2 flex items-baseline text-sm font-semibold",
        change.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 self-center" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d={change.isPositive 
              ? "M5 10l7-7m0 0l7 7m-7-7v18" 
              : "M19 14l-7 7m0 0l-7-7m7 7V3"
            } 
          />
        </svg>
        <span className="ml-1">{change.value}</span>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", colorClasses[color].bg)}>
            <Icon className={cn("h-6 w-6", colorClasses[color].text)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {getChange()}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {href && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <div className="text-sm">
            <a href={href} className={cn("font-medium", colorClasses[color].link)}>
              View details
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
