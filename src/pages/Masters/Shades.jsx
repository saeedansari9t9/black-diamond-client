import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";

export default function Shades() {
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState("");

  const [shadeCode, setShadeCode] = useState("");
  const [shadeName, setShadeName] = useState("");

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadMaterials = async () => {
    const res = await api.get("/materials");
    setMaterials(res.data.data || []);
  };

  const loadShades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (materialId) params.set("materialId", materialId);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/shades?${params.toString()}`);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    loadShades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const create = async () => {
    setMsg(""); setErr("");
    if (!materialId) return setErr("Select material");
    if (!shadeCode.trim()) return setErr("Shade code required");
    setSaving(true);
    try {
      await api.post("/shades", {
        materialId,
        shadeCode: shadeCode.trim(),
        shadeName: shadeName.trim(),
      });
      setShadeCode("");
      setShadeName("");
      setMsg("Shade added ✅");
      await loadShades();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const selectedMaterialName = useMemo(() => {
    return materials.find((m) => m._id === materialId)?.name || "";
  }, [materials, materialId]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xl font-bold">Shades</div>
        <div className="text-sm text-gray-500">Add shade codes & names per material</div>
      </div>

      {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div> : null}
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-xs text-gray-500">Material</div>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            >
              <option value="">Select material</option>
              {materials.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            {selectedMaterialName ? (
              <div className="mt-1 text-xs text-gray-400">Selected: {selectedMaterialName}</div>
            ) : null}
          </div>

          <div className="md:col-span-3">
            <div className="text-xs text-gray-500">Shade Code</div>
            <input
              value={shadeCode}
              onChange={(e) => setShadeCode(e.target.value)}
              placeholder="e.g. 3000"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>

          <div className="md:col-span-3">
            <div className="text-xs text-gray-500">Shade Name (optional)</div>
            <input
              value={shadeName}
              onChange={(e) => setShadeName(e.target.value)}
              placeholder="e.g. black"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              disabled={saving}
              onClick={create}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Shade"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shade code..."
            className="flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
          <button onClick={loadShades} className="rounded-xl border bg-white px-4 py-2.5 text-sm hover:bg-gray-50">
            Search
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">List</div>
        <div className="divide-y">
          {rows.map((s) => (
            <div key={s._id} className="px-4 py-3">
              <div className="text-sm font-semibold">
                {s.shadeCode} {s.shadeName ? `— ${s.shadeName}` : ""}
              </div>
              <div className="text-xs text-gray-500">
                Material: {s.materialId?.name || "—"} • {s._id}
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 ? <div className="p-6 text-sm text-gray-500">No shades</div> : null}
        </div>
      </div>
    </div>
  );
}
