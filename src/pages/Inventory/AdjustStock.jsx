import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, Search } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    if (!q) return products;
    return products.filter(p =>
      (p.sku || "").toLowerCase().includes(q) ||
      (p.materialId?.name || "").toLowerCase().includes(q)
    );
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
      toast.success("Stock adjusted successfully");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Adjust Stock</h1>
          <p className="text-sm text-gray-500">Manually update inventory levels</p>
        </div>
        <Link
          to="/inventory/stock"
          className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <ArrowLeft size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" /> Back to Inventory
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-6">

          {/* Product Selector */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Product</label>

            {/* Toggle Button */}
            {!selectedProduct ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 transition-colors outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <span>{loadingP ? "Loading products..." : "Select a product..."}</span>
                <Search size={16} />
              </button>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-blue-50/50 px-5 py-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{selectedProduct.sku}</div>
                    <div className="text-sm text-gray-500">{selectedProduct.materialId?.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setProductId(""); setIsDropdownOpen(true); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && !selectedProduct && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      autoFocus
                      className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      placeholder="Search..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredProducts.map(p => (
                    <button
                      key={p._id}
                      onClick={() => { setProductId(p._id); setIsDropdownOpen(false); setSearch(""); }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{p.sku}</div>
                        <div className="text-xs text-gray-500">{p.materialId?.name}</div>
                      </div>
                      {p.currentStock <= 0 && <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">Out</span>}
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 italic">No products found</div>
                  )}
                </div>
              </div>
            )}

            {/* Backdrop to close dropdown */}
            {isDropdownOpen && !selectedProduct && (
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Action</label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1.5 h-[50px]">
                <button
                  onClick={() => setAction("add")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${action === "add" ? "bg-white text-emerald-600 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Plus size={16} /> Add Stock
                </button>
                <button
                  onClick={() => setAction("remove")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${action === "remove" ? "bg-white text-red-600 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Minus size={16} /> Remove Stock
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all h-[50px]"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Reason / Note</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-normal placeholder:text-gray-400"
              placeholder="e.g. Broken items, Inventory count correction..."
            />
          </div>

          <div className="pt-4 border-t border-gray-50">
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {saving ? "Processing..." : "Confirm Stock Adjustment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
