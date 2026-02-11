import { useEffect, useState, useMemo } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { X, Pencil, Trash2, Eye } from "lucide-react";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function Customers() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return rows;
    return rows.filter(c =>
      (c.name || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term)
    );
  }, [rows, q]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", form);
        toast.success("Customer created successfully");
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (e) {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", address: "", notes: "" });
    setEditingId(null);
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, phone: c.phone || "", address: c.address || "", notes: c.notes || "" });
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
        await api.delete(`/customers/${id}`);
        toast.success("Customer deleted");
        load();
      } catch (e) {
        toast.error("Failed to delete customer");
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Customers</h1>
          <p className="text-sm text-gray-500">Manage your customers list</p>
        </div>
        <button onClick={() => { resetForm(); setOpen(true); }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
          + Create New Customer
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name/phone..."
            className="flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">S.No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((c, i) => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => nav(`/customers/${c._id}/ledger`)}>
                  <td className="px-6 py-4 text-gray-400 font-medium">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff`}
                        className="h-9 w-9 rounded-full"
                        alt={c.name}
                      />
                      <div className="font-semibold text-gray-900">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.phone || "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{c.address || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(c); }}
                        className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                        className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nav(`/customers/${c._id}/ledger`) }}
                        className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                      >
                        Ledger
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nav(`/customers/${c._id}`) }}
                        className="flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-500 italic">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Customer" : "Create Customer"}</h2>
                <p className="text-xs text-gray-500">Name + optional phone/address</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {["name", "phone", "address", "notes"].map((k) => (
                <div key={k}>
                  <label className="text-xs font-medium text-gray-700 mb-1 block capitalize">{k}</label>
                  <input
                    value={form[k]}
                    onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                Cancel
              </button>
              <button
                disabled={saving || !form.name}
                onClick={handleSubmit}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10 disabled:opacity-60 transition-all"
              >
                {saving ? "Saving..." : (editingId ? "Update Customer" : "Create Customer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
