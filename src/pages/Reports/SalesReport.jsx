import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { api } from "../../api/axios";
import StatCard from "../../components/ui/StatCard";

const money = (n) => Number(n || 0).toLocaleString();
const formatDate = (d) => new Date(d).toLocaleDateString();
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function SalesReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [salesList, setSalesList] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [searchCustomer, setSearchCustomer] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/sales-summary?from=${from}&to=${to}`);
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const res = await api.get(`/sales?from=${from}&to=${to}`);
      setSalesList(res.data.data || []);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [from, to]);

  useEffect(() => {
    // Load all sales on mount
    loadSales();
  }, []);

  const filteredSales = salesList.filter((sale) => {
    const customerName = sale.customerSnapshot?.name || sale.customerName || "";
    const matchesSearch = customerName.toLowerCase().includes(searchCustomer.toLowerCase());
    const isWalkIn = customerName.toLowerCase() === "walk-in";

    if (customerTypeFilter === "walkin") return matchesSearch && isWalkIn;
    if (customerTypeFilter === "regular") return matchesSearch && !isWalkIn;
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-bold">Sales Report</div>
        <div className="text-sm text-gray-500">Custom date summary</div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs text-gray-500">From</div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">To</div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={run}
              disabled={!from || !to || loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Run Report"}
            </button>
          </div>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Sales" value={money(data.totalSales)} sub={`Orders: ${data.orders}`} />
          <StatCard title="Total Paid" value={money(data.totalPaid)} />
          <StatCard title="Total Due" value={money(data.totalDue)} />
          <StatCard title="Total Discount" value={money(data.totalDiscount)} />
        </div>
      ) : null}

      {/* Sales List Section */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Sales Details</div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-gray-500">Customer Type</div>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">All Customers</option>
              <option value="walkin">Walk-in</option>
              <option value="regular">Registered Customers</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500">Search Customer Name</div>
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Type customer name..."
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Date & Time</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Products Sold</th>
                <th className="px-3 py-2 text-right">Qty (Cones)</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-right">Due</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loadingSales ? (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={9}>
                    Loading...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={9}>
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const totalQty = sale.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
                  const productNames = sale.items?.map((item) => {
                    const productName = item.productId?.sku || "Unknown";
                    return `${productName} (${item.qty})`;
                  }).join(", ") || "—";

                  return (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-blue-600">{sale.invoiceNo}</td>
                      <td className="px-3 py-2 text-xs">
                        <div>{formatDate(sale.createdAt)}</div>
                        <div className="text-gray-500">{formatTime(sale.createdAt)}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div>{sale.customerSnapshot?.name || sale.customerName}</div>
                        {sale.customerSnapshot?.phone ? (
                          <div className="text-xs text-gray-500">{sale.customerSnapshot.phone}</div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs">{productNames}</td>
                      <td className="px-3 py-2 text-right font-medium">{totalQty}</td>
                      <td className="px-3 py-2 text-right font-semibold">{money(sale.grandTotal)}</td>
                      <td className="px-3 py-2 text-right text-green-600">{money(sale.paidAmount)}</td>
                      <td className="px-3 py-2 text-right text-red-600">
                        {sale.dueAmount > 0 ? money(sale.dueAmount) : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Link
                          to={`/sales/invoices/${sale._id}/print`}
                          className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title="View Invoice"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Showing {filteredSales.length} of {salesList.length} sales
        </div>
      </div>
    </div >
  );
}
