import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";

const money = (n) => Number(n || 0).toLocaleString();

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/customers/${id}/history`);
        setHistory(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">Customer History</div>
          <div className="text-sm text-gray-500">All invoices for this customer</div>
        </div>
        <button onClick={() => nav("/customers")} className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50">
          Back
        </button>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">Invoices</div>

        <div className="divide-y">
          {history.map((s) => (
            <div key={s._id} className="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <div className="text-sm font-semibold">{s.invoiceNo}</div>
                <div className="text-xs text-gray-500">
                  {new Date(s.createdAt).toLocaleString()} • {s.saleType}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Total: <span className="font-semibold text-gray-900">{money(s.grandTotal)}</span> • Paid: {money(s.paidAmount)} • Due: {money(s.dueAmount)}
                </div>
              </div>
              <button
                onClick={() => nav(`/invoices/${s._id}`)}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Print
              </button>
            </div>
          ))}
          {!loading && history.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No sales found</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
