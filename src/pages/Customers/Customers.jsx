import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Customers() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      await api.post("/customers", form);
      setOpen(false);
      setForm({ name: "", phone: "", address: "", notes: "" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold">Customers</div>
          <div className="text-sm text-gray-500">Save customers and view history</div>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
          + New Customer
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name/phone..."
            className="flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
          <button onClick={load} className="rounded-xl border bg-white px-4 py-2.5 text-sm hover:bg-gray-50">
            {loading ? "…" : "Search"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">Customer List</div>

        <div className="divide-y">
          {rows.map((c) => (
            <button
              key={c._id}
              onClick={() => nav(`/customers/${c._id}/ledger`)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50"
            >
              <div>
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.phone || "—"} • {c.address || "—"}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); nav(`/customers/${c._id}/ledger`) }}
                  className="rounded-lg border bg-green-50 text-green-700 px-3 py-1.5 text-sm font-medium hover:bg-green-100"
                >
                  Ledger
                </button>
                <span className="rounded-lg border px-3 py-1.5 text-sm">View</span>
              </div>
            </button>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No customers found</div>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">Create Customer</div>
                <div className="text-sm text-gray-500">Name + optional phone/address</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">✕</button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {["name", "phone", "address", "notes"].map((k) => (
                <div key={k}>
                  <div className="text-xs text-gray-500 capitalize">{k}</div>
                  <input
                    value={form[k]}
                    onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button disabled={saving || !form.name} onClick={create} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
