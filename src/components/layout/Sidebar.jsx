import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  Grid,
  Scissors,
  Palette,
  Package as PackageIcon,
  BarChart2,
  FileText,
  Users,
  User,
  Square,
  ChevronDown,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Grid size={16} />,
      roles: ["admin", "manager", "accountant", "sales", "inventory"],
    },
    {
      label: "Masters",
      icon: <Scissors size={16} />,
      roles: ["admin", "manager", "sales", "accountant", "inventory"],
      category: "masters",
      submenu: [
        {
          to: "/masters/materials",
          label: "Materials",
          roles: ["admin", "manager", "sales", "accountant", "inventory"],
        },
        {
          to: "/masters/products",
          label: "Products",
          roles: ["admin", "manager", "sales", "inventory"],
        },
      ],
    },
    {
      label: "Sales & Operations",
      icon: <FileText size={16} />,
      roles: ["admin", "manager", "sales", "accountant"],
      category: "sales",
      submenu: [
        {
          to: "/sales/new",
          label: "New Sale",
          roles: ["admin", "manager", "sales", "accountant"],
        },
        {
          to: "/sales/invoices",
          label: "All Invoices",
          roles: ["admin", "manager", "sales", "accountant"],
        },
      ],
    },
    {
      label: "Reports",
      icon: <BarChart2 size={16} />,
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
      icon: <Users size={16} />,
      roles: ["admin", "manager", "sales", "accountant"],
    },
    {
      label: "Users & Access",
      icon: <User size={16} />,
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

  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "text-blue-500 bg-blue-50/10 border-l-2 border-blue-500 pl-2.5"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
    ].join(" ");

  const categoryClass = (isExpanded) =>
    [
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
      isExpanded
        ? "text-blue-500 bg-blue-50/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
    ].join(" ");

  const allowedItems = navItems.filter((n) =>
    n.roles.includes(user?.role || "sales")
  );

  const renderNavItem = (item) => {
    if (item.category && item.submenu) {
      const isExpanded = expandedCategory === item.category;
      const allowedSubmenu = item.submenu.filter((s) =>
        s.roles.includes(user?.role || "sales")
      );

      return (
        <div key={item.category}>
          <button
            onClick={() =>
              setExpandedCategory(isExpanded ? null : item.category)
            }
            className={categoryClass(isExpanded)}
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-700/40 group-hover:bg-slate-700/60 group-hover:text-blue-400 transition-all duration-200 text-slate-400">
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : "text-slate-400"}`}
            />
          </button>
          {isExpanded && (
            <div className="mt-1.5 space-y-1 pl-4 border-l border-slate-700/40 ml-4">
              {allowedSubmenu.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={linkClass}
                  onClick={onClose}
                >
                  <span className="flex-1 text-sm">{sub.label}</span>
                  <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-blue-500">
                    ›
                  </span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
        <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-700/40 group-hover:bg-slate-700/60 group-hover:text-blue-400 transition-all duration-200 text-slate-400">
          {item.icon}
        </span>
        <span className="flex-1">{item.label}</span>
        <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-blue-500">
          →
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 shrink-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex-col h-screen border-r border-slate-700/40 shadow-lg">
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-700/40">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <span className="text-lg font-bold">BD</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">BlackDiamond</div>
            <div className="text-xs text-slate-400">ERP System</div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </div>

          <nav className="space-y-1">
            {allowedItems.map((n) => renderNavItem(n))}
          </nav>
        </div>

        <div className="px-4 pb-5 pt-4 border-t border-slate-700/40">
          <div className="rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 p-3 text-xs text-slate-300 border border-slate-600/30">
            <div className="font-semibold text-slate-100">👤 {user?.name || "User"}</div>
            <div className="mt-1.5 text-slate-400 capitalize">
              {user?.role || "role"}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <div
        className={`fixed inset-0 z-40 sm:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        <aside
          className={`absolute left-0 top-0 bottom-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transform transition-transform border-r border-slate-700/40 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-700/40">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <span className="text-lg font-bold">BD</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">BlackDiamond</div>
              <div className="text-xs text-slate-400">ERP System</div>
            </div>
          </div>

          <div className="px-3 py-4">
            <div className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Navigation
            </div>

            <nav className="space-y-1">
              {allowedItems.map((n) => renderNavItem(n))}
            </nav>
          </div>

          <div className="px-4 pb-5 pt-4 border-t border-slate-700/40">
            <div className="rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 p-3 text-xs text-slate-300 border border-slate-600/30">
              <div className="font-semibold text-slate-100">👤 {user?.name || "User"}</div>
              <div className="mt-1.5 text-slate-400 capitalize">
                {user?.role || "role"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
