import { useEffect, useState } from "react";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { api } from "../../api/axios";
import { createRawMaterial, fetchRawMaterials, updateRawMaterial, deleteRawMaterial } from "../../api/rawMaterials";

export default function RawMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [attributes, setAttributes] = useState([]); // [{ key, label, type, options, optionsStr }]
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchRawMaterials();
            setMaterials(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        setMsg(""); setErr("");
        if (!name.trim()) return setErr("Material name required");
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
                await updateRawMaterial(editingId, { name, attributes: attrs });
                setMsg("Raw Material updated ✅");
            } else {
                await createRawMaterial({ name, attributes: attrs });
                setMsg("Raw Material added ✅");
            }
            // Reset Form
            setName("");
            setAttributes([]);
            setEditingId(null);
            load();
        } catch (error) {
            setErr(error.response?.data?.message || "Failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await deleteRawMaterial(id);
            load();
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    const openEdit = (m) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setName(m.name);
        setAttributes(m.attributes?.map(a => ({
            ...a,
            options: a.options || (a.options || []).join(", ")
        })) || []);
        setEditingId(m._id);
        setErr("");
        setMsg("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName("");
        setAttributes([]);
        setErr("");
        setMsg("");
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold">Raw Materials Master</h1>
            </div>

            {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div> : null}
            {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <div className="text-xs text-gray-500">Material name</div>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Polyester Yarn"
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
                            {saving ? "Saving..." : (editingId ? "Update Raw Material" : "Add Raw Material")}
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
                <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">Raw Material List</div>
                <div className="divide-y">
                    {materials.map((m) => (
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
                    {!loading && materials.length === 0 && (
                        <div className="p-6 text-sm text-gray-500">No materials found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
