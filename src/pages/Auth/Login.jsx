import { useState } from "react";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@blackdiamond.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setAuth = useAuthStore((s) => s.setAuth);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setAuth(res.data.data);
      nav("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* LEFT BRAND PANEL */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(600px_circle_at_20%_20%,#ffffff1a,transparent_40%),radial-gradient(600px_circle_at_80%_60%,#ffffff12,transparent_35%)]" />

          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <span className="text-xl">◼</span>
              </div>
              <div>
                <div className="text-lg font-semibold">Black Diamond</div>
                <div className="text-sm text-white/60">Sales • Inventory • Reports</div>
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold leading-tight">
                Professional ERP Dashboard
                <br />
                for Yarn & Cones Business
              </div>
              <div className="mt-3 max-w-md text-sm text-white/70">
                Track stock by material & shade, manage fresh/redyeing sales,
                and view daily/weekly/monthly performance in one place.
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-white/70">Fast Search</div>
                  <div className="mt-1 font-semibold">SKU / Shade Code</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-white/70">Reports</div>
                  <div className="mt-1 font-semibold">Today / Week / Month</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-white/70">Inventory</div>
                  <div className="mt-1 font-semibold">Live Stock Ledger</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-white/70">Sales</div>
                  <div className="mt-1 font-semibold">Invoices & Customers</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-white/50">
              © {new Date().getFullYear()} Black Diamond ERP
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            {/* mobile brand header */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                <span className="text-lg">◼</span>
              </div>
              <div>
                <div className="text-base font-semibold">Black Diamond</div>
                <div className="text-xs text-white/60">ERP Login</div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="mb-6">
                <div className="text-xl font-bold">Sign in</div>
                <div className="mt-1 text-sm text-white/60">
                  Enter your credentials to continue
                </div>
              </div>

              {err ? (
                <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {err}
                </div>
              ) : null}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <div className="text-xs text-white/60">Email</div>
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@blackdiamond.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">Password</div>
                    <button
                      type="button"
                      className="text-xs text-white/50 hover:text-white/70"
                      onClick={() => alert("Forgot password: Admin can reset users later")}
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="text-center text-xs text-white/40">
                  Role-based access enabled (Admin / Accountant / Sales)
                </div>
              </form>
            </div>

            <div className="mt-4 text-center text-xs text-white/40">
              Tip: pehle admin se login karo, phir users create karna start karo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
