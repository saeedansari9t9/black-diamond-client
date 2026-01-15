import { useEffect, useState } from "react";
import { api } from "../../api/axios";

export default function Materials() {
  const [name, setName] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [useShade, setUseShade] = useState(true);
  const [useQuality, setUseQuality] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

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

  const create = async () => {
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
      await api.post("/materials", {
        name: name.trim(),
        materialType: materialType.trim(),
        attributes: attrs,
        useShade: !!useShade,
        useQuality: !!useQuality,
      });
      setName("");
      setMaterialType("");
      setAttributes([]);
      setUseShade(true);
      setUseQuality(true);
      setMsg("Material added ✅");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xl font-bold">Materials</div>
        <div className="text-sm text-gray-500">Add materials (viscose / polister / zari)</div>
      </div>

      {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div> : null}
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500">Material name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. viscose"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">Material Type</div>
            <input
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              placeholder="e.g. NEEDLE or POLY"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
          <div className="sm:col-span-3">
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
          <div className="sm:col-span-3 flex items-center gap-4">
            <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={useShade} onChange={(e) => setUseShade(e.target.checked)} /> Use Shade</label>
            <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={useQuality} onChange={(e) => setUseQuality(e.target.checked)} /> Use Quality</label>
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              onClick={create}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Material"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">List</div>
        <div className="divide-y">
          {rows.map((m) => (
            <div key={m._id} className="flex items-center justify-between px-4 py-3">
              <div className="text-sm font-semibold">{m.name}</div>
              <div className="text-xs text-gray-500">{m._id}</div>
            </div>
          ))}
          {!loading && rows.length === 0 ? <div className="p-6 text-sm text-gray-500">No materials</div> : null}
        </div>
      </div>
    </div>
  );
}
