import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  Grid,
  Scissors,
  Package as PackageIcon,
  BarChart2,
  FileText,
  Users,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShoppingCart,
  Settings
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.getItem("theme") === "dark") return true;
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Grid size={20} />,
      roles: ["admin", "manager", "accountant", "sales", "inventory"],
    },
    {
      label: "Masters",
      icon: <Scissors size={20} />,
      roles: ["admin", "manager", "sales", "accountant", "inventory"],
      category: "masters",
      submenu: [
        {
          to: "/masters/materials",
          label: "Add Materials",
          roles: ["admin", "manager", "sales", "accountant", "inventory"],
        },
        {
          to: "/inventory/raw-materials",
          label: "Add Raw Materials",
          roles: ["admin", "manager", "inventory"],
        },
        {
          to: "/masters/products",
          label: "Add Products",
          roles: ["admin", "manager", "sales", "inventory"],
        },
      ],
    },
    {
      label: "Sales & Ops",
      icon: <FileText size={20} />,
      roles: ["admin", "manager", "sales", "accountant"],
      category: "sales",
      submenu: [
        {
          to: "/sales/new",
          label: "Add New Sale",
          roles: ["admin", "manager", "sales", "accountant"],
        },
        {
          to: "/sales/invoices",
          label: "All Invoices List",
          roles: ["admin", "manager", "sales", "accountant"],
        },
      ],
    },
    {
      label: "Inventory",
      icon: <PackageIcon size={20} />,
      roles: ["admin", "manager", "inventory", "accountant"],
      category: "inventory",
      submenu: [
        {
          to: "/inventory/stock",
          label: "View Current Stock",
          roles: ["admin", "manager", "inventory", "sales"],
        },
        {
          to: "/inventory/production",
          label: "Stock Production Entry",
          roles: ["admin", "manager", "inventory"],
        },
        {
          to: "/inventory/adjust-stock",
          label: "Add/Remove Stock",
          roles: ["admin", "manager", "inventory"],
        },
      ],
    },
    {
      label: "Purchasing",
      icon: <ShoppingCart size={20} />,
      roles: ["admin", "manager", "inventory", "accountant"],
      category: "purchasing",
      submenu: [
        {
          to: "/purchases",
          label: "Purchases List",
          roles: ["admin", "manager", "inventory", "accountant"],
        },
        {
          to: "/purchases/new",
          label: "Add New Purchase",
          roles: ["admin", "manager", "inventory"],
        },
        {
          to: "/purchases/suppliers",
          label: "Suppliers List",
          roles: ["admin", "manager", "inventory", "accountant"],
        },
      ],
    },
    {
      label: "Reports",
      icon: <BarChart2 size={20} />,
      roles: ["admin", "manager", "accountant"],
      category: "reports",
      submenu: [
        {
          to: "/reports/sales",
          label: "Sales Report",
          roles: ["admin", "manager", "accountant"],
        },
      ],
    },
    {
      to: "/customers",
      label: "Customers",
      icon: <Users size={20} />,
      roles: ["admin", "manager", "sales", "accountant"],
    },
    {
      label: "Settings",
      icon: <Settings size={20} />,
      roles: ["admin"],
      category: "users",
      submenu: [
        {
          to: "/users",
          label: "Users",
          roles: ["admin"],
        },
      ],
    },
  ];

  const allowedItems = navItems.filter((n) =>
    n.roles.includes(user?.role || "sales")
  );

  // --- Styles ---

  // Base link style
  const linkBase = "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 relative";

  // Active/Inactive
  const activeStyle = "bg-gray-900 text-white shadow-md dark:bg-blue-600 dark:text-white";
  const inactiveStyle = "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";

  // Submenu items
  const subLinkBase = "block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-gray-100 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";
  const subLinkActive = "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/20 dark:text-blue-400";

  const renderNavItem = (item) => {
    // If it has a submenu
    if (item.category && item.submenu) {
      const isExpanded = expandedCategory === item.category;
      const allowedSubmenu = item.submenu.filter((s) =>
        s.roles.includes(user?.role || "sales")
      );

      return (
        <div key={item.category} className="mb-1 relative group/parent">
          <button
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
                setTimeout(() => setExpandedCategory(item.category), 50);
                return;
              }
              setExpandedCategory(isExpanded ? null : item.category);
            }}
            className={`${linkBase} ${isExpanded ? "bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-gray-100" : inactiveStyle} w-full justify-start`}
          >
            <span className={`grid h-6 w-6 place-items-center transition-colors ${isExpanded ? "text-gray-900 dark:text-gray-100" : "text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`}>
              {item.icon}
            </span>

            {!collapsed && (
              <>
                <span className="flex-1 text-left ml-1">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                />
              </>
            )}

            {/* Collapsed Hover Tooltip/Menu */}
            {collapsed && (
              <div className="absolute left-full top-0 ml-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all z-50 dark:bg-slate-800 dark:border-slate-700">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b mb-1 dark:border-slate-700">{item.label}</div>
                {allowedSubmenu.map(sub => (
                  <NavLink key={sub.to} to={sub.to} className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : ''}`}>
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </button>

          {/* Expanded Submenu - Smooth Transition */}
          {!collapsed && (
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
              <div className="overflow-hidden">
                <div className="mt-1 space-y-1 px-3 pb-1">
                  {allowedSubmenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `${subLinkBase} flex items-center gap-2 ${isActive ? subLinkActive : ""}`
                      }
                      onClick={onClose}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sub.label === 'Active' ? 'bg-current' : 'bg-gray-300 dark:bg-slate-600'}`}></span>
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Single Link
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? activeStyle : inactiveStyle} mb-1`
        }
      >
        <span className="grid h-6 w-6 place-items-center">
          {item.icon}
        </span>
        {!collapsed && <span className="ml-1">{item.label}</span>}

        {/* Collapsed Tooltip */}
        {collapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap dark:bg-white dark:text-slate-900">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden sm:flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300 relative ${collapsed ? 'w-24' : 'w-72'} dark:bg-slate-900 dark:border-slate-800`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 text-gray-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Area */}
        <div className={`flex h-24 items-center ${collapsed ? 'justify-center' : 'px-6'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-xl dark:bg-blue-600">
              <span className="text-xl font-bold">B</span>
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden whitespace-nowrap">
                <div className="text-lg font-bold text-gray-900 dark:text-white">BlackDiamond</div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Nav - Hidden Scrollbar & Smooth Transitions */}
        <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <nav className="flex flex-col gap-1">
            {allowedItems.map((n) => renderNavItem(n))}
          </nav>
        </div>

        {/* Footer: User & Theme Toggle */}
        <div className="border-t border-gray-100 p-4 dark:border-slate-800">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 rounded-xl p-3 mb-2 transition-colors hover:bg-gray-100 text-gray-600 dark:text-slate-400 dark:hover:bg-slate-800 ${collapsed ? 'justify-center' : ''}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span className="text-sm font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <div className={`flex items-center gap-3 rounded-2xl bg-gray-50 p-3 transition-all dark:bg-slate-800 ${collapsed ? 'justify-center p-2' : ''}`}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-lg dark:bg-slate-700">
              👤
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="truncate text-sm font-bold text-gray-900 dark:text-white">{user?.name || "User"}</div>
                <div className="truncate text-xs text-gray-500 capitalize dark:text-slate-500">{user?.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <div
        className={`fixed inset-0 z-40 sm:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <aside
          className={`absolute left-0 top-0 bottom-0 z-50 w-72 bg-white text-gray-900 transform transition-transform shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-slate-900 dark:text-white`}
        >
          <div className="flex h-20 items-center gap-3 px-6 border-b border-gray-100 dark:border-slate-800">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-xl dark:bg-blue-600">
              <span className="text-xl font-bold">B</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">BlackDiamond</div>
          </div>

          <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-80px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <nav className="flex flex-col gap-1">
              {allowedItems.map((n) => renderNavItem(n))}
            </nav>
          </div>

          {/* Theme Toggle Mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-3 rounded-xl p-3 bg-gray-50 text-gray-900 dark:bg-slate-800 dark:text-white"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
