import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        <div className="space-y-5">
            <Toaster position="top-center" />
            <div>
                <h1 className="text-xl font-bold">Production Entry (Add Stock)</h1>
                <p className="text-sm text-gray-500">Enter finished goods receiving from factory.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Product Picker */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm h-fit">
                    <h3 className="font-semibold text-sm mb-3">Select Product</h3>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                        placeholder="Search SKU..."
                    />
                    <div className="mt-3 max-h-[400px] overflow-auto border rounded-xl">
                        {filteredProducts.map(p => (
                            <button
                                key={p._id}
                                onClick={() => addToBatch(p)}
                                className="w-full text-left px-3 py-2 border-b hover:bg-gray-50 text-sm flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-medium text-gray-800">{p.sku}</div>
                                    <div className="text-xs text-gray-500">{p.materialId?.name}</div>
                                </div>
                                <span className="text-blue-600 text-xs font-bold">+</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Batch Entry */}
                <div className="lg:col-span-2 rounded-2xl border bg-white p-4 shadow-sm h-fit">
                    <h3 className="font-semibold text-sm mb-3">Today's Batch</h3>

                    <div className="overflow-hidden border rounded-xl mb-4">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                                <tr>
                                    <th className="px-3 py-2">Product</th>
                                    <th className="px-3 py-2 w-32">Qty (Cones)</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map(it => (
                                    <tr key={it.productId}>
                                        <td className="px-3 py-2">
                                            <div className="font-medium">{it.sku}</div>
                                            <div className="text-xs text-gray-500">{it.material}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={it.qty}
                                                onChange={e => updateItem(it.productId, e.target.value)}
                                                className="w-full rounded-lg border bg-gray-50 px-2 py-1 text-sm text-center font-bold"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <button onClick={() => removeItem(it.productId)} className="text-red-500 hover:text-red-700">✕</button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-400">Select products received from factory</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                        >
                            {saving ? "Saving Stock..." : "Confirm Stock Entry"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
