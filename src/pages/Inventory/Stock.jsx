import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchStock } from "../../api/inventory";
import { fetchMaterials } from "../../api/materials";
import { api } from "../../api/axios";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStock({});
      setStock(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load materials for filter
    (async () => {
      try {
        const data = await fetchMaterials();
        setMaterials(data || []);
      } catch (e) { }
    })();
    load();
  }, []);

  const filteredStock = useMemo(() => {
    const term = q.toLowerCase();
    return stock.filter(item => {
      const matchMat = materialId ? item.materialId === materialId || item.materialId?._id === materialId : true;
      const matchQ = !term || (
        (item.sku || "").toLowerCase().includes(term) ||
        (item.materialName || "").toLowerCase().includes(term)
      );
      return matchMat && matchQ;
    });
  }, [stock, materialId, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Link
            to="/inventory/adjust-stock"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Adjust Stock
          </Link>
          {/* <Link
            to="/purchases/new"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            + Add Stock (Purchase)
          </Link> */}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
          >
            <option value="">All Materials</option>
            {materials.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <div className="flex flex-1 gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SKU or Name..."
              className="flex-1 rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
            />
          </div>
        </div>

        <div className="overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Product Name</th>
                <th className="px-3 py-3 text-right">Wholesale</th>
                <th className="px-3 py-3 text-right">Retail</th>
                <th className="px-3 py-3 text-right">Stock Qty</th>
                <th className="px-3 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStock.map((p) => {
                const qty = p.stock || 0;
                const statusColor = qty <= 0 ? 'bg-red-100 text-red-800' : qty < 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
                const statusText = qty <= 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'In Stock';

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-semibold text-blue-600">{p.sku}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{p.materialName || "—"}</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {Object.entries(p.attributes || {}).map(([key, val]) => (
                          <span key={key} className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-gray-600">{p.wholesalePrice}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{p.retailPrice}</td>
                    <td className="px-3 py-3 text-right font-bold text-lg">{qty}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`rounded-lg px-2 py-1 text-xs font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredStock.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    No stock data found
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
