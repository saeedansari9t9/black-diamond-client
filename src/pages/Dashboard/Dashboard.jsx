import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, TrendingUp, Calendar, Clock, Plus, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import StatCard from "../../components/ui/StatCard";

const money = (n) => Number(n || 0).toLocaleString();

export default function Dashboard() {
  const navigate = useNavigate();
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState(null);
  const [month, setMonth] = useState(null);
  const [lastMonth, setLastMonth] = useState(null);

  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [todaySalesList, setTodaySalesList] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(now.setHours(23, 59, 59, 999)).toISOString();

        const [t, w, m, lm, tp, tc, ts] = await Promise.all([
          api.get("/reports/sales-summary?range=today"),
          api.get("/reports/sales-summary?range=week"),
          api.get("/reports/sales-summary?range=month"),
          api.get("/reports/sales-summary?range=lastMonth"),
          api.get("/reports/top-products?limit=10"),
          api.get("/reports/top-customers?range=month&limit=10"),
          api.get(`/sales?from=${start}&to=${end}`),
        ]);

        setToday(t.data.data);
        setWeek(w.data.data);
        setMonth(m.data.data);
        setLastMonth(lm.data.data);
        setTopProducts(tp.data.data || []);
        setTopCustomers(tc.data.data || []);

        // Flatten today's sales into list of items
        const rawSales = ts.data.data || [];
        const flatItems = [];
        rawSales.forEach(sale => {
          sale.items.forEach(item => {
            flatItems.push({
              productName: item.productId?.materialId?.name || "Unknown Product",
              sku: item.productId?.sku || "-",
              quality: item.productId?.qualityType || "-",
              qty: item.qty,
              total: item.lineTotal,
              customerName: sale.customerSnapshot?.name || sale.customerName || "Walk-in",
              customerPhone: sale.customerSnapshot?.phone || "",
              isRegistered: !!sale.customerId && !sale.isNewCustomer // Only true if existing customer
            });
          });
        });
        setTodaySalesList(flatItems);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);


  const cards = useMemo(() => {
    return [
      {
        title: "Today Sales",
        value: money(today?.totalSales),
        sub: `${today?.orders || 0} Orders`,
        color: "blue",
        icon: ShoppingBag
      },
      {
        title: "This Week Sales",
        value: money(week?.totalSales),
        sub: `${week?.orders || 0} Orders`,
        color: "purple",
        icon: TrendingUp
      },
      {
        title: "This Month Sales",
        value: money(month?.totalSales),
        sub: `${month?.orders || 0} Orders`,
        color: "green",
        icon: Calendar
      },
      {
        title: "Last Month Sales",
        value: money(lastMonth?.totalSales),
        sub: `${lastMonth?.orders || 0} Orders`,
        color: "orange",
        icon: Clock
      },
    ];
  }, [today, week, month, lastMonth]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, here is your business overview.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/sales/new')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all shadow-blue-600/20"
          >
            <Plus size={18} /> New Sale
          </button>
          <button
            onClick={() => navigate('/purchases/new')}
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:border-gray-300"
          >
            <Plus size={18} /> New Purchase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard
            key={c.title}
            title={c.title}
            value={c.value}
            sub={c.sub}
            color={c.color}
            icon={c.icon}
          />
        ))}
      </div>


      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">Today's Total Sell</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="px-3 py-3 font-semibold rounded-tl-lg">Product</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 text-right font-semibold">Qty</th>
                <th className="px-3 py-3 text-right font-semibold rounded-tr-lg">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {todaySalesList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-gray-500">No sales today</td>
                </tr>
              ) : (
                todaySalesList.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-500">{item.sku} | {item.quality}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900">{item.customerName}</div>
                      <div className="text-xs mt-1 flex items-center gap-2">
                        {item.isRegistered ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium ring-1 ring-inset ring-green-600/20 text-green-700">Old Customer</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium ring-1 ring-inset ring-orange-600/10 text-orange-700">Walk-in</span>
                        )}
                        {item.customerPhone && <span className="text-gray-500">{item.customerPhone}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900">{item.qty}</td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900">{money(item.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Top Selling Products</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-700">
                <tr>
                  <th className="px-3 py-3 font-semibold rounded-tl-lg">Product</th>
                  <th className="px-3 py-3 text-right font-semibold rounded-tr-lg">Qty Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-2 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  topProducts.map((p, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2">
                        <div className="font-medium">{p.material}</div>
                        <div className="text-xs text-gray-500">{p.sku} | {p.qualityType}</div>
                      </td>
                      <td className="px-2 py-2 text-right font-medium">{p.qtySold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Top Customers (This Month)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-700">
                <tr>
                  <th className="px-3 py-3 font-semibold rounded-tl-lg">Customer</th>
                  <th className="px-3 py-3 text-right font-semibold rounded-tr-lg">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-2 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  topCustomers.map((c, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone} | {c.orders} Orders</div>
                      </td>
                      <td className="px-2 py-2 text-right font-medium">{money(c.totalSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
