import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { api } from "../../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Materials() {
  const [name, setName] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/materials");
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Material name required");
    setSaving(true);
    try {
      // normalize attributes: split options by comma
      const attrs = attributes.map((a) => ({
        key: (a.key || "").trim(),
        label: (a.label || "").trim(),
        type: a.type || "text",
        required: !!a.required,
        options: (a.options || "").split(",").map((s) => s.trim()).filter(Boolean),
      }));

      if (editingId) {
        await api.put(`/materials/${editingId}`, {
          name: name.trim(),
          attributes: attrs,
        });
        toast.success("Material updated successfully!");
      } else {
        await api.post("/materials", {
          name: name.trim(),
          attributes: attrs,
        });
        toast.success("Material added successfully!");
      }

      setName("");
      setAttributes([]);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setAttributes([]);
  };

  const openEdit = (m) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(m._id);
    setName(m.name);
    setAttributes((m.attributes || []).map(a => ({
      ...a,
      options: (a.options || []).join(", ")
    })));
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/materials/${id}`);
        toast.success("Material deleted successfully.");
        load();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />
      <div>
        <div className="text-xl font-bold">Materials</div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-gray-500">Material name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. viscose"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500">Attributes (optional)</div>
            <div className="space-y-2 mt-2">
              {attributes.map((a, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input value={a.key || ''} onChange={(e) => { const copy = [...attributes]; copy[idx].key = e.target.value; setAttributes(copy) }} placeholder="key" className="col-span-2 rounded-xl border px-2 py-1" />
                  <input value={a.label || ''} onChange={(e) => { const copy = [...attributes]; copy[idx].label = e.target.value; setAttributes(copy) }} placeholder="label" className="col-span-3 rounded-xl border px-2 py-1" />
                  <select value={a.type || 'text'} onChange={(e) => { const copy = [...attributes]; copy[idx].type = e.target.value; setAttributes(copy) }} className="col-span-2 rounded-xl border px-2 py-1">
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="select">select</option>
                  </select>
                  <input value={a.options || ''} onChange={(e) => { const copy = [...attributes]; copy[idx].options = e.target.value; setAttributes(copy) }} placeholder="options (comma)" className="col-span-3 rounded-xl border px-2 py-1" />
                  <label className="col-span-1 text-sm"> <input type="checkbox" checked={!!a.required} onChange={(e) => { const copy = [...attributes]; copy[idx].required = e.target.checked; setAttributes(copy) }} /> Req</label>
                  <button onClick={() => { setAttributes(attributes.filter((_, i) => i !== idx)) }} className="col-span-1 text-sm text-red-600">Remove</button>
                </div>
              ))}
              <div>
                <button onClick={() => setAttributes([...attributes, { key: '', label: '', type: 'text', required: false, options: '' }])} className="rounded-xl bg-gray-100 px-3 py-1 text-sm">Add attribute</button>
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : (editingId ? "Update Material" : "Add Material")}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">List</div>
        <div className="divide-y">
          {rows.map((m) => (
            <div key={m._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex-1">
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="mt-1">
                  {m.attributes?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {m.attributes.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          <span className="font-medium">{a.label}</span>
                          <span className="text-blue-400">({a.type})</span>
                          {a.options?.length > 0 && (
                            <span className="text-gray-500">[{a.options.join(", ")}]</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No attributes configured</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 sm:mt-0 flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    title="Edit"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? <div className="p-6 text-sm text-gray-500">No materials</div> : null}
        </div>
      </div>
    </div>
  );
}
