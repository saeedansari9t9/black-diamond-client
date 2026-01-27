import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import { CirclePlus, Pencil, Trash2, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { updateProduct, deleteProduct } from "../../api/products";

export default function Products() {
  const [materials, setMaterials] = useState([]);

  const [materialId, setMaterialId] = useState("");
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [initialStock, setInitialStock] = useState(0);
  const [attributesValues, setAttributesValues] = useState({});

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
        initialStock: Number(initialStock || 0),
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
      setInitialStock(0);
      setAttributesValues({});
      setEditingId(null);
      setMaterialId("");
      setShowForm(false);
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
    setInitialStock(0);
    setInitialStock(0);
    setAttributesValues({});
    setShowForm(false);
  };

  const openEdit = (product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(product._id);
    setMaterialId(product.materialId?._id || product.materialId);
    setRetailPrice(product.retailPrice);
    setWholesalePrice(product.wholesalePrice);
    setWholesalePrice(product.wholesalePrice);
    setAttributesValues(product.attributes || {});
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
        await deleteProduct(id);
        toast.success("Product deleted successfully.");
        loadProducts();
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
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog and pricing</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null);
              setMaterialId("");
              setRetailPrice(0);
              setWholesalePrice(0);
              setInitialStock(0);
              setAttributesValues({});
              setShowForm(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            + Add Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Product" : "Create Product"}</h2>
                <p className="text-xs text-gray-500">Configure product attributes and pricing</p>
              </div>
              <button onClick={cancelEdit} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <label className="text-sm font-medium text-gray-700">Select Material</label>
                  <div className="flex gap-2">
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      className="mt-1.5 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      disabled={!!editingId}
                    >
                      <option value="">Select material</option>
                      {materials.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
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
                            <label className="text-sm font-medium text-gray-700">{label}</label>
                            {a.type === 'select' ? (
                              <select
                                value={attributesValues[keyName] || ''}
                                onChange={(e) => setAttributesValues({ ...attributesValues, [keyName]: e.target.value })}
                                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              >
                                <option value="">(select)</option>
                                {opts.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                              </select>
                            ) : (
                              <input
                                value={attributesValues[keyName] || ''}
                                onChange={(e) => setAttributesValues({ ...attributesValues, [keyName]: e.target.value })}
                                type={a.type === 'number' ? 'number' : 'text'}
                                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />
                            )}
                          </div>
                        );
                      })
                    ) : null}

                    <div className="lg:col-span-4">
                      <label className="text-sm font-medium text-gray-700">Wholesale Price</label>
                      <input
                        type="number"
                        value={wholesalePrice}
                        onChange={(e) => setWholesalePrice(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        min={0}
                      />
                    </div>

                    <div className="lg:col-span-4">
                      <label className="text-sm font-medium text-gray-700">Retail Price</label>
                      <input
                        type="number"
                        value={retailPrice}
                        onChange={(e) => setRetailPrice(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        min={0}
                      />
                    </div>

                    {!editingId && (
                      <div className="lg:col-span-4">
                        <label className="text-sm font-medium text-gray-700">Initial Stock</label>
                        <input
                          type="number"
                          value={initialStock}
                          onChange={(e) => setInitialStock(Number(e.target.value))}
                          className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          min={0}
                        />
                      </div>
                    )}
                  </>
                )}
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
                {saving ? "Saving..." : (editingId ? "Update Product" : "Save Product")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-2 bg-white">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU (e.g. VIS-3000)"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={loadProducts}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
          >
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
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
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Material</th>
                    {attrKeys.map((key) => (
                      <th key={key} className="px-4 py-3 capitalize">
                        {attrLabels[key] || key}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Whole Sale</th>
                    <th className="px-4 py-3 text-right">Retail</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-600">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.materialId?.name || "—"}</td>
                      {attrKeys.map((key) => (
                        <td key={key} className="px-4 py-3 text-gray-600">
                          {p.attributes?.[key] || "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right font-medium text-gray-700">Rs. {p.wholesalePrice}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">Rs. {p.retailPrice}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-100 hover:border-green-300 transition-all"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 hover:border-red-300 transition-all"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 ? (
                    <tr><td className="px-4 py-12 text-gray-500 text-center" colSpan={7 + attrKeys.length}>No products found. Start by selecting a material to create one.</td></tr>
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
