import React, { useState, useEffect } from "react";
import { api } from "../../api/axios";
import { toast } from "react-hot-toast";

export default function ProductPrices() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Track modified prices: { [productId]: { retailPrice: number, wholesalePrice: number } }
    const [changes, setChanges] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            if (res.data.ok) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (productId, field, value) => {
        setChanges((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
                // Preserve other field if already edited, or default to current product value
                ...(field === "retailPrice" && !prev[productId]?.wholesalePrice
                    ? {
                        wholesalePrice:
                            products.find((p) => p._id === productId)?.wholesalePrice || 0,
                    }
                    : {}),
                ...(field === "wholesalePrice" && !prev[productId]?.retailPrice
                    ? {
                        retailPrice:
                            products.find((p) => p._id === productId)?.retailPrice || 0,
                    }
                    : {}),
            },
        }));
    };

    const saveChanges = async () => {
        if (Object.keys(changes).length === 0) {
            toast("No changes to save");
            return;
        }

        setSaving(true);
        try {
            // Convert changes object to array for backend
            // Backend expects: [{ id, retailPrice, wholesalePrice }, ...]
            // We need to ensure we send both prices even if only one changed, 
            // but my handlePriceChange logic tries to fill gaps. 
            // Better approach: merge current product data with changes.

            const updates = Object.keys(changes).map(id => {
                const product = products.find(p => p._id === id);
                const change = changes[id];
                return {
                    id,
                    retailPrice: change.retailPrice ?? product.retailPrice,
                    wholesalePrice: change.wholesalePrice ?? product.wholesalePrice
                };
            });

            const res = await api.put("/products/bulk", updates);
            if (res.data.ok) {
                toast.success("Prices updated successfully");
                setChanges({});
                fetchProducts(); // Refresh to ensure sync
            }
        } catch (error) {
            console.error("Failed to save prices", error);
            toast.error(error.response?.data?.message || "Failed to update prices");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading products...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Price Update</h1>
                    <p className="text-sm text-gray-500">Bulk update retail and wholesale prices</p>
                </div>
                <button
                    onClick={saveChanges}
                    disabled={saving || Object.keys(changes).length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {saving ? "Saving..." : `Save Changes (${Object.keys(changes).length})`}
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-700">Product Info</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">SKU</th>
                                <th className="px-4 py-3 font-semibold text-right w-40">Wholesale Price</th>
                                <th className="px-4 py-3 font-semibold text-right w-40">Retail Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p) => {
                                const isModified = !!changes[p._id];
                                const displayRetail = changes[p._id]?.retailPrice ?? p.retailPrice;
                                const displayWholesale = changes[p._id]?.wholesalePrice ?? p.wholesalePrice;

                                return (
                                    <tr key={p._id} className={`hover:bg-gray-50/50 transition-colors ${isModified ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">
                                                {p.materialId?.name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Qual: {p.qualityType || "-"} | Size: {p.size || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                                            {p.sku}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                value={displayWholesale}
                                                onChange={(e) =>
                                                    handlePriceChange(p._id, "wholesalePrice", e.target.value)
                                                }
                                                className={`w-full text-right bg-white border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${changes[p._id]?.wholesalePrice !== undefined ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-200"
                                                    }`}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <input
                                                type="number"
                                                value={displayRetail}
                                                onChange={(e) =>
                                                    handlePriceChange(p._id, "retailPrice", e.target.value)
                                                }
                                                className={`w-full text-right bg-white border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${changes[p._id]?.retailPrice !== undefined ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-200"
                                                    }`}
                                            />
                                        </td>

                                    </tr>
                                );
                            })}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}
