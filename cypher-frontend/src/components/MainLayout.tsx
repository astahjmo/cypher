import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Github,
  Home,
  LogOut,
  Settings,
  Folder,
  Play,
  PanelLeftClose,
  PanelRightClose,
  Menu,
  X,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const FRONTEND_VERSION = import.meta.env.PACKAGE_VERSION || '0.0.0';

export function MainLayout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Folder, label: 'Repositories', path: '/repositories' },
    { icon: Play, label: 'Builds', path: '/builds' },
    { icon: Box, label: 'Containers', path: '/containers' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background">
        <aside
          className={cn(
            'hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-16' : 'w-64',
          )}
        >
          <div className="p-4 border-b border-sidebar-border flex items-center gap-3 flex-shrink-0 h-16 overflow-hidden">
            <div className={cn('bg-white p-1 rounded flex-shrink-0', isCollapsed && 'mx-auto')}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <h1 className="font-bold text-xl whitespace-nowrap">Cypher Pipelines</h1>
            )}
          </div>

          <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center rounded-md transition-colors',
                          isCollapsed ? 'h-9 w-9 justify-center p-0' : 'px-4 py-2 gap-3',
                          (location.pathname.startsWith(item.path) && item.path !== '/') ||
                            location.pathname === item.path
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </nav>

          {!isCollapsed && (
            <div className="px-4 pb-2 mt-auto flex-shrink-0">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs text-sidebar-foreground/50">Version: {FRONTEND_VERSION}</p>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  Beta
                </Badge>
              </div>
            </div>
          )}

          {user && (
            <div className="p-4 border-t border-sidebar-border flex-shrink-0">
              <div
                className={cn(
                  'flex items-center mb-3',
                  isCollapsed ? 'flex-col space-y-2 items-center' : 'justify-between',
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user.avatar_url} alt={user.login} />
                      <AvatarFallback>{user.login?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{user.name || user.login}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden ml-3">
                    <p className="text-sm font-medium truncate whitespace-nowrap">
                      {user.name || user.login}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 truncate whitespace-nowrap">
                      {user.login}
                    </p>
                  </div>
                )}
                <ThemeToggle />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size={isCollapsed ? 'icon' : 'sm'}
                    className={cn(
                      'w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isCollapsed ? 'justify-center' : 'justify-start',
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className={cn(!isCollapsed && 'mr-2', 'flex-shrink-0')} />
                    {!isCollapsed && <span>Sign Out</span>}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}

          <div className="p-4 border-t border-sidebar-border flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <PanelRightClose size={16} className="flex-shrink-0" />
                  ) : (
                    <PanelLeftClose size={16} className="flex-shrink-0" />
                  )}
                  <span className="sr-only">
                    {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? 'right' : 'top'}>
                <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </aside>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between flex-shrink-0 border-b border-sidebar-border h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="font-bold text-lg">Cypher Pipelines</h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                {isMobileMenuOpen ? (
                  <X size={24} className="flex-shrink-0" />
                ) : (
                  <Menu size={24} className="flex-shrink-0" />
                )}
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 border-b border-sidebar-border flex-shrink-0">
              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
                          (location.pathname.startsWith(item.path) && item.path !== '/') ||
                            location.pathname === item.path
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )}
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {user && (
                  <div className="mt-4 pt-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 mb-3 px-4">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user.avatar_url} alt={user.login} />
                        <AvatarFallback>{user.login?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user.name || user.login}</p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">{user.login}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2 flex-shrink-0" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
              <div className="mt-4 pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-sidebar-foreground/50">Version: {FRONTEND_VERSION}</p>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    Beta
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 relative overflow-y-auto">
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
