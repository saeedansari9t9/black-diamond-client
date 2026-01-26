import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPurchases } from "../../api/purchases";

const money = (n) => Number(n || 0).toLocaleString();
const dateFmt = (d) => new Date(d).toLocaleDateString();

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPurchases({});
      setPurchases(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Purchases Overview</h1>
          <p className="text-sm text-gray-500">History of raw material expenses</p>
        </div>
        <Link
          to="/purchases/new"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Material Purchase
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-3 py-3">PO #</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Supplier</th>
                <th className="px-3 py-3">Materials</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">Due</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-semibold text-blue-600">{p.purchaseNo}</td>
                  <td className="px-3 py-3 text-gray-600">{dateFmt(p.createdAt)}</td>
                  <td className="px-3 py-3">
                    {p.supplierId ? (
                      <Link to={`/purchases/suppliers/${p.supplierId._id || p.supplierId}/ledger`} className="hover:text-blue-600 hover:underline">
                        {p.supplierSnapshot?.name || "—"}
                      </Link>
                    ) : (
                      <span>{p.supplierSnapshot?.name || "—"}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-gray-600 max-w-xs truncate">
                    {p.items?.map(i => `${i.description} (${i.qty}${i.unit})`).join(", ")}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">{money(p.grandTotal)}</td>
                  <td className="px-3 py-3 text-right text-red-600">{money(p.dueAmount)}</td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      to={`/purchases/${p._id}`}
                      className="rounded-lg border px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    No purchases found
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
