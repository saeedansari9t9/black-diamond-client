import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { updateProduct, deleteProduct } from "../../api/products";

export default function Products() {
  const [materials, setMaterials] = useState([]);

  const [materialId, setMaterialId] = useState("");
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [attributesValues, setAttributesValues] = useState({});

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const loadMaterials = async () => {
    try {
      const res = await api.get("/materials");
      setMaterials(res.data.data || []);
    } catch (e) { console.error(e) }
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
    if (!editingId) {
      setAttributesValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const selectedMaterial = useMemo(
    () => materials.find((m) => m._id === materialId),
    [materials, materialId]
  );

  const handleSubmit = async () => {
    if (!materialId) return toast.error("Select material");

    setSaving(true);
    try {
      const payload = {
        materialId,
        attributes: attributesValues,
        retailPrice: Number(retailPrice || 0),
        wholesalePrice: Number(wholesalePrice || 0),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully!");
      }

      setRetailPrice(0);
      setWholesalePrice(0);
      setAttributesValues({});
      setEditingId(null);
      setMaterialId("");
      await loadProducts();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMaterialId("");
    setRetailPrice(0);
    setWholesalePrice(0);
    setAttributesValues({});
  };

  const openEdit = (product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(product._id);
    setMaterialId(product.materialId?._id || product.materialId);
    setRetailPrice(product.retailPrice);
    setWholesalePrice(product.wholesalePrice);
    setAttributesValues(product.attributes || {});
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
        await deleteProduct(id);
        toast.success("Product deleted successfully.");
        loadProducts();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />
      <div>
        <div className="text-xl font-bold">Products</div>
      </div>

      {/* Create/Edit form */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-xs text-gray-500 mb-2">Select Material</div>
            <div className="flex gap-2">
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="mt-1 flex-1 rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                disabled={!!editingId}
              >
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <button disabled={!!editingId} onClick={loadMaterials} title="Reload materials" className="mt-1 inline-flex items-center px-3 rounded-xl border bg-white hover:bg-gray-50">⟳</button>
            </div>
          </div>

          {materialId && (
            <>
              {/* Dynamic attributes for selected material */}
              {selectedMaterial?.attributes?.length ? (
                selectedMaterial.attributes.map((a, idx) => {
                  const keyName = a.key && String(a.key).trim() ? String(a.key).trim() : `attr_${idx}`;
                  const label = a.label || keyName;
                  const opts = Array.isArray(a.options) ? a.options : [];
                  return (
                    <div key={keyName} className="lg:col-span-4">
                      <div className="text-xs text-gray-500 mb-2">{label}</div>
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

              <div className="lg:col-span-4">
                <div className="text-xs text-gray-500 mb-2">Wholesale Price</div>
                <input
                  type="number"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  min={0}
                />
              </div>

              <div className="lg:col-span-4">
                <div className="text-xs text-gray-500 mb-2">Retail Price</div>
                <input
                  type="number"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
                  min={0}
                />
              </div>

              <div className="lg:col-span-4 flex items-end gap-2">
                <button
                  disabled={saving}
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : (editingId ? "Update Product" : "Create Product")}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
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
          {/* Extract unique attribute keys from all products */}
          {(() => {
            const allAttrKeys = new Set();
            rows.forEach((p) => {
              if (p.attributes) {
                Object.keys(p.attributes).forEach((key) => allAttrKeys.add(key));
              }
            });
            const attrKeys = Array.from(allAttrKeys).sort();

            // Get labels for attributes from selected material or use keys
            const attrLabels = {};
            selectedMaterial?.attributes?.forEach((a) => {
              if (a.key) attrLabels[a.key] = a.label || a.key;
            });

            return (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Material</th>
                    {attrKeys.map((key) => (
                      <th key={key} className="px-3 py-2 capitalize">
                        {attrLabels[key] || key}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right">Whole Sale Price</th>
                    <th className="px-3 py-2 text-right">Retail Price</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{p.sku}</td>
                      <td className="px-3 py-2 font-medium">{p.materialId?.name || "—"}</td>
                      {attrKeys.map((key) => (
                        <td key={key} className="px-3 py-2 text-gray-700">
                          {p.attributes?.[key] || "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-medium">Rs. {p.wholesalePrice}</td>
                      <td className="px-3 py-2 text-right font-medium">Rs. {p.retailPrice}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 ? (
                    <tr><td className="px-3 py-6 text-gray-500 text-center" colSpan={7 + attrKeys.length}>No products found</td></tr>
                  ) : null}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
