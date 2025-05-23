import { useState } from "react";
import { BellIcon, MenuIcon, SearchIcon, ChevronDownIcon } from "lucide-react";
import { useAuth } from "../App";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { useTheme } from "../components/theme-provider";
import { cn } from "../lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile menu button */}
        <button 
          type="button" 
          className="lg:hidden text-gray-500 focus:outline-none dark:text-gray-400"
          onClick={onToggleSidebar}
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        
        {/* Search */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-8 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                className={cn(
                  "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500",
                  "focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                )}
                placeholder="Search students, classes, or reports..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <h3 className="font-medium text-base">Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">You have 3 unread notifications</p>
              </div>
              <DropdownMenuSeparator />
              <div className="py-2 max-h-80 overflow-y-auto">
                <DropdownMenuItem className="p-3 cursor-default">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Low attendance rate</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">John Brown has missed 5 consecutive classes.</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">5 minutes ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-default">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Attendance dropping</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Emily Clark's attendance has dropped by 20% this month.</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">1 hour ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-default">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Class attendance report</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Economics 101 has below average attendance this semester.</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Yesterday</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" size="sm" className="w-full">View all notifications</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={user?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="User profile" 
                />
                <span className="hidden md:block text-sm font-medium dark:text-white">{user?.name}</span>
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
