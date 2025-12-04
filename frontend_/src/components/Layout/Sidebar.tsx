import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Home,
  UserCog,
  UserPen,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../Logo";
import Button from "../Button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: number;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems: NavItem[] = [
    { name: "Home", href: "/", icon: Home, roles: ["admin", "telecaller", "packaging", "dispatch"] },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
    { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "telecaller"] },
    { name: "Orders", href: "/orders", icon: ClipboardList, roles: ["admin", "telecaller"] },
    { name: "Admin Review", href: "/review", icon: UserPen, roles: ["admin"] },
    { name: "Packaging", href: "/packaging", icon: Package, roles: ["admin", "packaging"] },
    { name: "Dispatch", href: "/dispatch", icon: Truck, roles: ["admin", "dispatch"] },
    { name: "Finance", href: "/admin/finance", icon: DollarSign, roles: ["admin"] },
    { name: "Governance", href: "/admin/governance", icon: UserCog, roles: ["admin"] },
    { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors  "
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          /* Mobile: Fixed overlay drawer */
          fixed lg:static
          left-0 top-0 z-40
          flex flex-col h-screen transition-all duration-300 border-r border-gray-200 bg-white shadow-lg lg:shadow-sm

          /* Mobile drawer behavior */
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

          /* Width */
    ${isCollapsed ? "w-16" : "w-64"}
  `}
      >
        {/* HEADER */}
        <div
          className={`flex items-center px-4 py-4 border-b border-gray-100 ${isCollapsed ? "justify-center" : "justify-between"
            }`}
        >
          {!isCollapsed && <Logo size="md" />}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition hidden lg:block"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive: active }) =>
                  `
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg relative
                  text-sm font-medium cursor-pointer select-none
                  
                  transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                  
                  ${active ? `
                    bg-blue-50 text-blue-700 shadow-sm 
                    scale-[1.02]
                  ` : `
                    text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  `}
                `
                }
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-md
                  ${isActive(item.href)
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-500 group-hover:text-gray-700"
                    }
              `}
                >
                  <Icon className="w-5 h-5" />
                </span>

                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* USER SECTION */}
        <div className="p-4 border-t border-gray-100">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-2" : "justify-between"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-semibold shrink-0">
                {user?.name?.charAt(0).toUpperCase() || <UserCircle className="w-5 h-5" />}
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
              )}
            </div>

            <Button
              onClick={logout}
              variant="secondary"
              size="sm"
              className={`flex items-center gap-1
                ${isCollapsed
                  ? "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  : "px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                }
            `}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
