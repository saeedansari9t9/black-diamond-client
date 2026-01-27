import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../../api/axios";
import { fetchProducts } from "../../api/products";
import { adjustStock } from "../../api/inventory";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function ProductionEntry() {
    const nav = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Form
    const [items, setItems] = useState([]);

    // Status
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await fetchProducts("");
            setProducts(data || []);
            setLoading(false);
        })();
    }, []);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return products.slice(0, 30);
        return products.filter(p =>
            (p.sku || "").toLowerCase().includes(q) ||
            (p.materialId?.name || "").toLowerCase().includes(q)
        ).slice(0, 30);
    }, [products, search]);

    const addToBatch = (p) => {
        // Check if exists
        const exists = items.find(i => i.productId === p._id);
        if (exists) return;

        setItems(prev => [
            ...prev,
            {
                productId: p._id,
                sku: p.sku,
                material: p.materialId?.name,
                qty: ""
            }
        ]);
    };

    const updateItem = (id, val) => {
        setItems(prev => prev.map(i => i.productId === id ? { ...i, qty: val } : i));
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(i => i.productId !== id));
    };

    const handleSubmit = async () => {
        if (items.length === 0) return toast.error("No items added");

        const validItems = items.map(i => ({ ...i, qty: Number(i.qty) })).filter(i => i.qty > 0);
        if (validItems.length === 0) return toast.error("Enter valid quantities");

        const result = await Swal.fire({
            title: 'Confirm Production Entry?',
            text: `You are about to add stock for ${validItems.length} items.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, add stock',
            confirmButtonColor: '#10b981' // emerald-500
        });

        if (!result.isConfirmed) return;

        setSaving(true);
        try {
            // Process each item as an adjustment
            for (const item of validItems) {
                await adjustStock({
                    productId: item.productId,
                    type: "adjust",
                    qtyChange: item.qty, // Positive for production add
                    note: "Production Entry"
                });
            }

            toast.success(`Successfully added ${validItems.length} products to stock`);
            setItems([]);
        } catch (e) {
            toast.error("Failed to save entries");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-center" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Production Entry</h1>
                    <p className="text-sm text-gray-500">Record finished goods received from factory</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Product Picker */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Search size={18} className="text-blue-600" />
                        Select Product
                    </h3>
                    <div className="relative mb-4">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
                            placeholder="Search SKU..."
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-sm text-gray-400 animate-pulse">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-8 text-sm text-gray-400">No products found</div>
                        ) : (
                            filteredProducts.map(p => (
                                <button
                                    key={p._id}
                                    onClick={() => addToBatch(p)}
                                    className="group w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{p.sku}</div>
                                        <div className="text-xs text-gray-500">{p.materialId?.name}</div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Batch Entry */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit flex flex-col min-h-[600px]">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Check size={18} className="text-green-600" />
                        Today's Batch ({items.length})
                    </h3>

                    <div className="flex-1 overflow-hidden border border-gray-200 rounded-xl mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Product Info</th>
                                    <th className="px-4 py-3 w-40 text-center">Qty (Cones)</th>
                                    <th className="px-4 py-3 w-16 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map(it => (
                                    <tr key={it.productId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-900">{it.sku}</div>
                                            <div className="text-xs text-gray-500">{it.material}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={it.qty}
                                                onChange={e => updateItem(it.productId, e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-center font-bold text-blue-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => removeItem(it.productId)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                                <Plus size={24} className="text-gray-300" />
                                            </div>
                                            <p>Select products from the left to start entry</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={handleSubmit}
                            disabled={saving || items.length === 0}
                            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                        >
                            {saving ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Check size={18} /> Confirm Stock Entry
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
