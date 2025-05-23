import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { 
  HomeIcon, 
  ClipboardCheckIcon, 
  FileTextIcon, 
  UsersIcon, 
  BuildingIcon, 
  UserCircleIcon, 
  SettingsIcon, 
  HelpCircleIcon,
  CheckSquareIcon,
  BarChart3Icon
} from "lucide-react";
import { useAuth } from "../App";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { 
      section: "Attendance",
      items: [
        { name: "Mark Attendance", href: "/mark-attendance", icon: CheckSquareIcon },
        { name: "Attendance Reports", href: "/attendance-reports", icon: BarChart3Icon },
      ] 
    },
    {
      section: "Management",
      items: [
        { name: "Students", href: "/students", icon: UsersIcon },
        { name: "Classes", href: "/classes", icon: BuildingIcon },
        { name: "Faculty", href: "/faculty", icon: UserCircleIcon },
      ]
    },
    {
      section: "Settings",
      items: [
        { name: "Settings", href: "/settings", icon: SettingsIcon },
        { name: "Help & Support", href: "/help", icon: HelpCircleIcon },
      ]
    }
  ];

  return (
    <aside className={cn("hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-full dark:bg-gray-800 dark:border-gray-700", className)}>
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="bg-primary-500 text-white p-2 rounded">
            <ClipboardCheckIcon className="h-6 w-6" />
          </div>
          <h1 className="ml-3 text-xl font-bold dark:text-white">Attendly</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item, i) => {
            if ('section' in item) {
              return (
                <div key={i}>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 dark:text-gray-400">
                    {item.section}
                  </p>
                  
                  {item.items && item.items.map((subItem, j) => (
                    <Link 
                      key={j}
                      href={subItem.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg",
                        isActive(subItem.href)
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      )}
                    >
                      <subItem.icon className="h-5 w-5 mr-3" />
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              );
            }
            
            return (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg",
                  isActive(item.href)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img 
              className="h-8 w-8 rounded-full" 
              src={user.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
              alt="User profile" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
