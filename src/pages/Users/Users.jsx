import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/authStore";

const roles = ["admin", "manager", "accountant", "sales", "inventory"];

const Badge = ({ children, tone = "gray" }) => {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};

const roleTone = (r) => {
  if (r === "admin") return "purple";
  if (r === "accountant") return "blue";
  if (r === "sales") return "green";
  if (r === "inventory") return "orange";
  if (r === "manager") return "gray";
  return "gray";
};

export default function Users() {
  const me = useAuthStore((s) => s.user);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState(""); // "", "true", "false"

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales" });
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const canView = me?.role === "admin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      if (active) params.set("active", active);

      const res = await api.get(`/users?${params.toString()}`);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const filteredCount = useMemo(() => rows.length, [rows]);

  const handleSubmit = async () => {
    setErr("");
    setSaving(true);
    try {
      if (editingId) {
        // Update
        await api.put(`/users/${editingId}`, form);
      } else {
        // Create
        await api.post("/users", form);
      }
      setOpen(false);
      resetForm();
      await fetchUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || `Failed to ${editingId ? "update" : "create"} user`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, role: u.role, password: "" }); // password empty
    setErr("");
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${id}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (e) {
        toast.error("Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "sales" });
    setEditingId(null);
    setErr("");
  };

  const toggleActive = async (id, next) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: next });
      toast.success(next ? "User enabled successfully" : "User disabled successfully");
      await fetchUsers();
    } catch (e) {
      toast.error("Failed to active/disable user");
    }
  };

  if (!canView) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Access denied</div>
        <div className="mt-1 text-sm text-gray-500">Only Admin can manage users.</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold">Users</div>
          <div className="text-sm text-gray-500">Create and manage staff accounts</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setOpen(true); }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            + New User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name/email..."
              className="w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            >
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <button
              onClick={fetchUsers}
              className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm hover:bg-gray-50"
            >
              {loading ? "…" : "Go"}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Showing: <span className="font-semibold text-gray-900">{filteredCount}</span>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
          User List
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="border-b bg-white">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{u.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{u.email}</td>
                  <td className="px-5 py-4">
                    <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-gray-100"
                        title="Edit User"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(u._id, !u.isActive)}
                        className={`rounded-lg border px-3 py-1 text-xs font-medium hover:bg-gray-100 ${u.isActive ? "text-orange-600" : "text-green-600"}`}
                        disabled={u.role === "admin"}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-3 py-1 text-xs font-medium hover:bg-red-100"
                        disabled={u.role === "admin"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading ? (
                <tr>
                  <td className="px-5 py-8 text-sm text-gray-500" colSpan={5}>
                    No users found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {rows.map((u) => (
            <div key={u._id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(u._id, !u.isActive)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                    disabled={u.role === "admin"}
                  >
                    {u.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                {u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}
              </div>
            </div>
          ))}
          {rows.length === 0 && !loading ? (
            <div className="p-6 text-sm text-gray-500">No users found</div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">{editingId ? "Edit User" : "Create User"}</div>
                <div className="text-sm text-gray-500">{editingId ? "Update user details" : "Add accountant/sales/inventory users"}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                ✕
              </button>
            </div>

            {err ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  placeholder="e.g. Ahmed Accountant"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500">Email</div>
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  placeholder="e.g. accounts@blackdiamond.com"
                  type="email"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500">Password {editingId && "(Leave empty to keep current)"}</div>
                <input
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  placeholder={editingId ? "New password (optional)" : "Set initial password"}
                  type="password"
                />
              </div>

              <div>
                <div className="text-xs text-gray-500">Role</div>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                >
                  {roles
                    .filter((r) => r !== "admin") // admin create only if you want
                    .map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {saving ? "Saving..." : (editingId ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
