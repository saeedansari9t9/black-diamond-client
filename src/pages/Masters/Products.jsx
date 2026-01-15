import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";

export default function Products() {
  const [materials, setMaterials] = useState([]);
  const [shades, setShades] = useState([]);

  const [materialId, setMaterialId] = useState("");
  const [shadeId, setShadeId] = useState("");

  const [qualityType, setQualityType] = useState("fresh");
  const [variant, setVariant] = useState(""); // polyester only
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [attributesValues, setAttributesValues] = useState({});

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadMaterials = async () => {
    const res = await api.get("/materials");
    setMaterials(res.data.data || []);
  };

  const loadShades = async (mid) => {
    if (!mid) {
      setShades([]);
      return;
    }
    const res = await api.get(`/shades?materialId=${mid}`);
    setShades(res.data.data || []);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/products?${params.toString()}`);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    loadProducts();
  }, []);

  useEffect(() => {
    setShadeId("");
    loadShades(materialId);
    // reset dynamic attributes values when material changes
    setAttributesValues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const selectedMaterial = useMemo(
    () => materials.find((m) => m._id === materialId),
    [materials, materialId]
  );

  const selectedShade = useMemo(
    () => shades.find((s) => s._id === shadeId),
    [shades, shadeId]
  );

  const isPoly = useMemo(() => {
    const n = (selectedMaterial?.name || "").toLowerCase();
    return n.includes("pol"); // polister/polyester
  }, [selectedMaterial]);


  const create = async () => {
    setMsg(""); setErr("");
    if (!materialId) return setErr("Select material");
    if (selectedMaterial?.useShade !== false && !shadeId) return setErr("Select shade code");
    if (selectedMaterial?.useQuality !== false && !qualityType) return setErr("Select quality type");

    setSaving(true);
    try {
      const payload = {
        materialId,
        variant: isPoly ? variant : "",
        attributes: attributesValues,
        retailPrice: Number(retailPrice || 0),
        wholesalePrice: Number(wholesalePrice || 0),
      };

      // Only include shadeId if material uses shades
      if (selectedMaterial?.useShade !== false) {
        payload.shadeId = shadeId;
      }

      // Only include qualityType if material uses quality
      if (selectedMaterial?.useQuality !== false) {
        payload.qualityType = qualityType;
      }

      await api.post("/products", payload);

      setMsg("Product created ✅ (SKU auto generated)");
      setQualityType("fresh");
      setVariant("");
      setRetailPrice(0);
      setWholesalePrice(0);
      await loadProducts();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xl font-bold">Products</div>
        <div className="text-sm text-gray-500">
          Material + Shade + Quality. SKU auto generate hota hai.
        </div>
      </div>

      {msg ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div> : null}
      {err ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

      {/* Create form */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="text-xs text-gray-500">Material</div>
            <div className="flex gap-2">
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="mt-1 flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <button onClick={loadMaterials} title="Reload materials" className="mt-1 inline-flex items-center px-3 rounded-xl border bg-white hover:bg-gray-50">⟳</button>
            </div>
          </div>

          {selectedMaterial?.useShade !== false ? (
            <div className="lg:col-span-3">
              <div className="text-xs text-gray-500">Shade Number</div>
              <select
                value={shadeId}
                onChange={(e) => setShadeId(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                disabled={!materialId}
              >
                <option value="">{materialId ? "Select shade code" : "Select material first"}</option>
                {shades.map((s) => (
                  <option key={s._id} value={s._id}>{s.shadeCode}</option>
                ))}
              </select>
            </div>
          ) : null}

          {selectedMaterial?.useShade !== false && shadeId ? (
            <div className="lg:col-span-3">
              <div className="text-xs text-gray-500">Shade Name</div>
              <input
                value={selectedShade?.shadeName || ""}
                readOnly
                placeholder="Auto"
                className="mt-1 w-full rounded-xl border bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none"
              />
            </div>
          ) : null}

          {selectedMaterial?.useQuality !== false ? (
            <div className="lg:col-span-3">
              <div className="text-xs text-gray-500">Quality Type</div>
              <select
                value={qualityType}
                onChange={(e) => setQualityType(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="fresh">fresh</option>
                <option value="redyeing">redyeing</option>
              </select>
            </div>
          ) : null}
          {/* Polyester variant only */}
          {isPoly ? (
            <div className="lg:col-span-3">
              <div className="text-xs text-gray-500">Polyester Variant</div>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="">(optional)</option>
                <option value="small">small</option>
                <option value="big">big</option>
              </select>
            </div>
          ) : null}

          {/* Dynamic attributes for selected material */}
          {selectedMaterial?.attributes?.length ? (
            selectedMaterial.attributes.map((a, idx) => {
              const keyName = a.key && String(a.key).trim() ? String(a.key).trim() : `attr_${idx}`;
              const label = a.label || keyName;
              const opts = Array.isArray(a.options) ? a.options : [];
              return (
                <div key={keyName} className="lg:col-span-3">
                  <div className="text-xs text-gray-500">{label}</div>
                  {a.type === 'select' ? (
                    <select
                      value={attributesValues[keyName] || ''}
                      onChange={(e) => setAttributesValues({ ...attributesValues, [keyName]: e.target.value })}
                      className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                    >
                      <option value="">(select)</option>
                      {opts.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  ) : (
                    <input
                      value={attributesValues[keyName] || ''}
                      onChange={(e) => setAttributesValues({ ...attributesValues, [keyName]: e.target.value })}
                      type={a.type === 'number' ? 'number' : 'text'}
                      className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                    />
                  )}
                </div>
              );
            })
          ) : null}

          <div className="lg:col-span-3">
            <div className="text-xs text-gray-500">Wholesale Price</div>
            <input
              type="number"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              min={0}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs text-gray-500">Retail Price</div>
            <input
              type="number"
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              min={0}
            />
          </div>

          <div className="lg:col-span-3 flex items-end">
            <button
              disabled={saving}
              onClick={create}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU (e.g. VIS-3000)"
            className="flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
          />
          <button onClick={loadProducts} className="rounded-xl border bg-white px-4 py-2.5 text-sm hover:bg-gray-50">
            Search
          </button>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Shade</th>
                <th className="px-3 py-2">Quality</th>

                <th className="px-3 py-2">Variant</th>
                <th className="px-3 py-2 text-right">W.Price</th>
                <th className="px-3 py-2 text-right">R.Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">{p.sku}</td>
                  <td className="px-3 py-2">{p.materialId?.name}</td>
                  <td className="px-3 py-2">
                    {p.shadeId?.shadeCode} {p.shadeId?.shadeName ? `(${p.shadeId.shadeName})` : ""}
                  </td>
                  <td className="px-3 py-2">{p.qualityType}</td>
                  <td className="px-3 py-2">{p.variant || "—"}</td>

                  <td className="px-3 py-2 text-right">{p.wholesalePrice}</td>
                  <td className="px-3 py-2 text-right">{p.retailPrice}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-gray-500" colSpan={7}>No products</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
