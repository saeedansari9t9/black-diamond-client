import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

const titleFromPath = (path) => {
  if (path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/clients")) return "Clients";
  if (path.startsWith("/reports/sales")) return "Sales Reports";
  return "Black Diamond ERP";
};

export default function Topbar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  const { user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    const p = user.name.split(" ");
    return (p[0]?.[0] || "") + (p[1]?.[0] || "");
  }, [user]);

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        {/* LEFT */}
        <div>
          <div className="sm:hidden -ml-2 mb-1">
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-700 hover:bg-gray-100"
            >
              ☰
            </button>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {title}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* User dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 hover:bg-gray-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {initials.toUpperCase()}
              </div>

              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role || "role"}
                </div>
              </div>

              <span className="text-gray-400">▾</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-lg">
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>

                <div className="border-t">
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => navigate("/settings")}
                  >
                    Settings
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
