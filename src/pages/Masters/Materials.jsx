import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Trash2, X } from "lucide-react";
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

  const [showForm, setShowForm] = useState(false);

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
    if (!attributes.length) return toast.error("At least one attribute is required");
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
      setShowForm(false);
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
    setShowForm(false);
  };

  const openEdit = (m) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(m._id);
    setName(m.name);
    setAttributes((m.attributes || []).map(a => ({
      ...a,
      options: (a.options || []).join(", ")
    })));
    setShowForm(true);
  };

  const openNew = () => {
    setName("");
    setAttributes([{ key: 'prodName', label: 'Product Name', type: 'text', required: true, options: '' }]);
    setEditingId(null);
    setShowForm(true);
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
    <div className="space-y-6">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-800">Materials</div>
          <p className="text-sm text-gray-500">Manage your raw materials inventory</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <CirclePlus size={18} /> Add New Material
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Material" : "Create Material"}</h2>
                <p className="text-xs text-gray-500">Define material name and attributes</p>
              </div>
              <button onClick={cancelEdit} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Material Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Viscose Fabric"
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">Attributes Configuration</label>
                  <div className="space-y-3">
                    {attributes.map((a, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="sm:col-span-2">
                          <input
                            value={a.key || ''}
                            disabled={a.key === 'prodName'}
                            onChange={(e) => { const copy = [...attributes]; copy[idx].key = e.target.value; setAttributes(copy) }}
                            placeholder="Key"
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${a.key === 'prodName' ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-200'}`}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            value={a.label || ''}
                            disabled={a.key === 'prodName'}
                            onChange={(e) => { const copy = [...attributes]; copy[idx].label = e.target.value; setAttributes(copy) }}
                            placeholder="Label"
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${a.key === 'prodName' ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-200'}`}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <select
                            value={a.type || 'text'}
                            disabled={a.key === 'prodName'}
                            onChange={(e) => { const copy = [...attributes]; copy[idx].type = e.target.value; setAttributes(copy) }}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${a.key === 'prodName' ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-200'}`}
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="select">Dropdown</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            value={a.options || ''}
                            disabled={a.key === 'prodName'}
                            onChange={(e) => { const copy = [...attributes]; copy[idx].options = e.target.value; setAttributes(copy) }}
                            placeholder="Options (comma sep)"
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 ${a.key === 'prodName' ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-200'}`}
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-between gap-2 h-full py-2">
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input type="checkbox" disabled={a.key === 'prodName'} checked={!!a.required} onChange={(e) => { const copy = [...attributes]; copy[idx].required = e.target.checked; setAttributes(copy) }} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-xs font-medium">Req</span>
                          </label>
                          {a.key !== 'prodName' && (
                            <button onClick={() => { setAttributes(attributes.filter((_, i) => i !== idx)) }} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setAttributes([...attributes, { key: '', label: '', type: 'text', required: false, options: '' }])}
                      className="w-full py-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <CirclePlus size={16} /> Add Attribute Field
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={cancelEdit}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10 disabled:opacity-60 transition-all"
              >
                {saving ? "Saving..." : (editingId ? "Update Material" : "Save Material")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Material List</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map((m) => (
            <div key={m._id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="text-base font-semibold text-gray-900">{m.name}</div>
                </div>
                <div>
                  {m.attributes?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {m.attributes.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          {a.label}
                          <span className="text-indigo-400 opacity-75">| {a.type}</span>
                          {a.options?.length > 0 && (
                            <span className="text-gray-500 ml-0.5" title={a.options.join(", ")}>• {a.options.length} opts</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No attributes configured</span>
                  )}
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <button
                  onClick={() => openEdit(m)}
                  className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-100 hover:border-green-300 transition-all"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="rounded-full bg-gray-50 p-4 mb-3">
                <CirclePlus size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">No materials found</p>
              <p className="text-xs text-gray-400 mt-1">Get started by creating a new material.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
