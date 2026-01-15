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
          to: "/masters/shades",
          label: "Shades",
          roles: ["admin", "manager", "sales", "inventory"],
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
      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-200/80 hover:bg-white/5 hover:text-white",
    ].join(" ");

  const categoryClass = (isExpanded) =>
    [
      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition cursor-pointer",
      isExpanded
        ? "bg-white/10 text-white"
        : "text-slate-200/80 hover:bg-white/5 hover:text-white",
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
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-base">
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1 pl-4">
              {allowedSubmenu.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={linkClass}
                  onClick={onClose}
                >
                  <span className="flex-1">{sub.label}</span>
                  <span className="opacity-0 transition group-hover:opacity-100">
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
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-base">
          {item.icon}
        </span>
        <span className="flex-1">{item.label}</span>
        <span className="opacity-0 transition group-hover:opacity-100">
          ›
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 shrink-0 bg-gradient-to-b from-slate-950 to-slate-900 text-white flex-col h-screen">
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
            <span className="text-lg">
              <Square size={18} />
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">BlackDiamond</div>
            <div className="text-xs text-slate-300/70">ERP Dashboard</div>
          </div>
        </div>

        <div className="px-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300/60">
            Menu
          </div>

          <nav className="space-y-1">
            {allowedItems.map((n) => renderNavItem(n))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-4 pt-6">
          <div className="rounded-2xl bg-white/5 p-3 text-xs text-slate-200/80">
            <div className="font-semibold text-white">Logged in</div>
            <div className="mt-1">
              {user?.name || "User"}{" "}
              <span className="text-slate-300/70">({user?.role || "role"})</span>
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
          className={`absolute left-0 top-0 bottom-0 z-50 w-64 bg-gradient-to-b from-slate-950 to-slate-900 text-white transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-16 items-center gap-3 px-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <span className="text-lg">
                <Square size={18} />
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">BlackDiamond</div>
              <div className="text-xs text-slate-300/70">ERP Dashboard</div>
            </div>
          </div>

          <div className="px-3">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300/60">
              Menu
            </div>

            <nav className="space-y-1">
              {allowedItems.map((n) => renderNavItem(n))}
            </nav>
          </div>

          <div className="mt-auto px-4 pb-4 pt-6">
            <div className="rounded-2xl bg-white/5 p-3 text-xs text-slate-200/80">
              <div className="font-semibold text-white">Logged in</div>
              <div className="mt-1">
                {user?.name || "User"}{" "}
                <span className="text-slate-300/70">({user?.role || "role"})</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
