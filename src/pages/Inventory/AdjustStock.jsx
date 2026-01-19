import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { fetchProducts } from "../../api/products";
import { adjustStock } from "../../api/inventory";
import toast, { Toaster } from 'react-hot-toast';

export default function AdjustStock() {
  const nav = useNavigate();
  // Form
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("adjust"); // adjust (can be + or - handled visually, actually backend takes 'adjust' and qtyChange)
  // Wait, backend enum is ["purchase_add", "sale_out", "adjust"].
  // If "adjust", qtyChange can be positive or negative.
  // To make it user friendly: "Add" or "Remove".
  const [action, setAction] = useState("add"); // "add" | "remove"
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState("");

  // Product Search
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingP, setLoadingP] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingP(true);
      const data = await fetchProducts("");
      setProducts(data || []);
      setLoadingP(false);
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products.slice(0, 50);
    return products.filter(p =>
      (p.sku || "").toLowerCase().includes(q) ||
      (p.materialId?.name || "").toLowerCase().includes(q)
    ).slice(0, 50);
  }, [products, search]);

  const handleSubmit = async () => {
    if (!productId) return toast.error("Select a product");
    if (!qty || qty <= 0) return toast.error("Enter valid quantity");

    setSaving(true);
    try {
      const qtyChange = action === "remove" ? -Math.abs(qty) : Math.abs(qty);
      await adjustStock({
        productId,
        type: "adjust", // Manual adjustment
        qtyChange,
        note
      });
      toast.success("Stock adjusted successfully ✅");
      setQty(0);
      setNote("");
      setProductId("");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(p => p._id === productId);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Adjust Stock</h1>
        <Link to="/inventory/stock" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Inventory
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="space-y-4">
          {/* Product Selector */}
          <div>
            <label className="text-xs font-medium text-gray-500">Find Product</label>
            <input
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
              placeholder="Search SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {search && !selectedProduct && (
              <div className="mt-2 max-h-40 overflow-auto rounded-xl border bg-white shadow-sm">
                {filteredProducts.map(p => (
                  <button
                    key={p._id}
                    onClick={() => { setProductId(p._id); setSearch(""); }}
                    className="block w-full border-b px-3 py-2 text-left hover:bg-gray-50 text-sm"
                  >
                    <span className="font-semibold text-gray-800">{p.sku}</span> <span className="text-gray-500 text-xs"> - {p.materialId?.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 border border-blue-100">
              <div>
                <div className="font-bold text-blue-900">{selectedProduct.sku}</div>
                <div className="text-xs text-blue-700">{selectedProduct.materialId?.name}</div>
              </div>
              <button onClick={() => setProductId("")} className="text-xs text-blue-600 underline">Change</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Action</label>
              <div className="mt-1 flex rounded-xl border bg-gray-50 p-1">
                <button
                  onClick={() => setAction("add")}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${action === "add" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Add (+)
                </button>
                <button
                  onClick={() => setAction("remove")}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${action === "remove" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Remove (-)
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Reason / Note</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
              placeholder="e.g. Damage, Found extra, etc."
            />
          </div>

          <div className="pt-2">
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
