import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { MdOutlineWidgets } from "react-icons/md";
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
  Settings,
  House
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
      icon: <MdOutlineWidgets size={20} />,
      roles: ["admin", "manager", "accountant", "sales", "inventory"],
    },
    {
      label: "Materials",
      icon: <Scissors size={20} />,
      roles: ["admin", "manager", "sales", "accountant", "inventory"],
      category: "masters",
      submenu: [
        {
          to: "/masters/materials",
          label: "Material List",
          roles: ["admin", "manager", "sales", "accountant", "inventory"],
        },
        {
          to: "/inventory/raw-materials",
          label: "Raw Material List",
          roles: ["admin", "manager", "inventory"],
        },
      ],
    },
    {
      label: "Products",
      icon: <PackageIcon size={20} />,
      roles: ["admin", "manager", "sales", "accountant", "inventory"],
      category: "products",
      submenu: [
        {
          to: "/masters/products",
          label: "Product List",
          roles: ["admin", "manager", "sales", "inventory"],
        },
        {
          to: "/masters/product-prices",
          label: "Price Update",
          roles: ["admin", "manager"],
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
  const linkBase = "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden";

  // Active/Inactive
  const activeStyle = "bg-indigo-100 text-indigo-700 shadow-sm dark:from-purple-600/30 dark:to-pink-600/10 dark:text-white dark:shadow-[0_0_20px_rgba(168,85,247,0.25)]";
  const inactiveStyle = "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 hover:pl-4";

  // Submenu items
  const subLinkBase = "block rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-200";
  const subLinkActive = "bg-indigo-100 text-indigo-600 font-semibold dark:bg-purple-500/20 dark:text-white pl-4";

  const renderNavItem = (item) => {
    // If it has a submenu
    if (item.category && item.submenu) {
      const isExpanded = expandedCategory === item.category;
      const allowedSubmenu = item.submenu.filter((s) =>
        s.roles.includes(user?.role || "sales")
      );

      return (
        <div key={item.category} className="mb-2 relative group/parent">
          <button
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
                setTimeout(() => setExpandedCategory(item.category), 50);
                return;
              }
              setExpandedCategory(isExpanded ? null : item.category);
            }}
            className={`${linkBase} ${isExpanded ? "bg-gray-50 text-gray-900 dark:bg-slate-800/50 dark:text-white" : inactiveStyle} w-full justify-start`}
          >
            <span className={`grid h-6 w-6 place-items-center transition-colors ${isExpanded ? "text-indigo-600 dark:text-purple-400" : "text-gray-400 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-purple-400"}`}>
              {item.icon}
            </span>

            {!collapsed && (
              <>
                <span className="flex-1 text-left ml-1">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 text-gray-400 ${isExpanded ? "rotate-180 text-indigo-500 dark:text-purple-400" : ""}`}
                />
              </>
            )}

            {/* Collapsed Hover Tooltip/Menu */}
            {collapsed && (
              <div className="absolute left-full top-0 ml-4 w-52 rounded-2xl border border-gray-100/50 bg-white/90 backdrop-blur-xl p-3 shadow-2xl opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all duration-300 z-50 dark:bg-slate-900/90 dark:border-slate-700/50">
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2 dark:border-slate-800">{item.label}</div>
                <div className="space-y-1">
                  {allowedSubmenu.map(sub => (
                    <NavLink key={sub.to} to={sub.to} className={({ isActive }) => `${subLinkBase} ${isActive ? subLinkActive : 'text-gray-500 dark:text-slate-400'}`}>
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
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
                <div className="mt-1 space-y-1 px-3 pb-1 border-l-2 border-gray-100 ml-6 dark:border-slate-800">
                  {allowedSubmenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `${subLinkBase} flex items-center gap-2 ${isActive ? subLinkActive : "text-gray-500 dark:text-slate-400"}`
                      }
                      onClick={onClose}
                    >
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
          `${linkBase} ${isActive ? activeStyle : inactiveStyle} mb-2`
        }
      >
        <span className={`grid h-6 w-6 place-items-center transition-colors ${location.pathname === item.to ? "" : "group-hover:text-indigo-500 dark:group-hover:text-purple-400"}`}>
          {item.icon}
        </span>
        {!collapsed && <span className="ml-1">{item.label}</span>}

        {/* Collapsed Tooltip */}
        {collapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 rounded-xl bg-gray-900/90 backdrop-blur px-4 py-2 text-sm font-medium text-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 whitespace-nowrap dark:bg-white/90 dark:text-slate-900 transform translate-x-[-10px] group-hover:translate-x-0">
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
        className={`hidden sm:flex flex-col h-screen transition-all duration-500 ease-spring relative ${collapsed ? 'w-24' : 'w-72'} 
        bg-white/80 backdrop-blur-2xl border-r border-gray-100 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.03)]
        dark:bg-[#0f172a] dark:border-slate-800/50 dark:shadow-[20px_0_40px_-10px_rgba(0,0,0,0.3)]`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg text-gray-400 hover:text-indigo-600 hover:scale-110 transition-all duration-300 dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300 dark:hover:text-purple-400"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Area */}
        <div className={`flex items-center justify-center transition-all duration-500 py-4`}>
          <img
            src="/Diamond.png"
            alt="BlackDiamond"
            className={`object-contain transition-all duration-500 ${collapsed ? "w-14" : "w-44"}`}
          />
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <nav className="flex flex-col">
            {allowedItems.map((n) => renderNavItem(n))}
          </nav>
        </div>

        {/* Footer: User & Theme Toggle */}
        <div className="p-4 mx-4 mb-4 rounded-3xl bg-gray-50/50 border border-gray-100 dark:bg-slate-800/30 dark:border-slate-700/50 backdrop-blur-sm">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 rounded-xl p-2.5 mb-3 transition-all duration-300 hover:bg-white hover:shadow-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300 ${collapsed ? 'justify-center' : ''}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span className="text-sm font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <div className={`flex items-center gap-3 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg border-2 border-white shadow-sm dark:from-blue-900 dark:to-indigo-900 dark:border-slate-600">
              👤
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="truncate text-sm font-bold text-gray-900 dark:text-white">{user?.name || "User"}</div>
                <div className="truncate text-xs text-gray-500 capitalize dark:text-slate-400">{user?.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <div
        className={`fixed inset-0 z-40 sm:hidden transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <aside
          className={`absolute left-0 top-0 bottom-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 transform transition-transform duration-500 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-[#0f172a]/95 dark:border-slate-800`}
        >
          <div className="flex items-center justify-center border-b border-gray-100/50 dark:border-slate-800 py-4">
            <img src="/Diamond.png" alt="BlackDiamond" className="w-44 object-contain" />
          </div>

          <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-80px)]">
            <nav className="flex flex-col gap-1">
              {allowedItems.map((n) => renderNavItem(n))}
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-slate-800 bg-white/50 backdrop-blur dark:bg-slate-900/50">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-3 rounded-xl p-3 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
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
