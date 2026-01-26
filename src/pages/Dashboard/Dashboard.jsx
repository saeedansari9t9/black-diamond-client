import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, TrendingUp, Calendar, Clock } from "lucide-react";
import { api } from "../../api/axios";
import StatCard from "../../components/ui/StatCard";

const money = (n) => Number(n || 0).toLocaleString();

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState(null);
  const [month, setMonth] = useState(null);
  const [lastMonth, setLastMonth] = useState(null);

  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [t, w, m, lm, tp, tc] = await Promise.all([
          api.get("/reports/sales-summary?range=today"),
          api.get("/reports/sales-summary?range=week"),
          api.get("/reports/sales-summary?range=month"),
          api.get("/reports/sales-summary?range=lastMonth"),
          api.get("/reports/top-products?limit=10"),
          api.get("/reports/top-customers?range=month&limit=10"),
        ]);

        setToday(t.data.data);
        setWeek(w.data.data);
        setMonth(m.data.data);
        setLastMonth(lm.data.data);
        setTopProducts(tp.data.data || []);
        setTopCustomers(tc.data.data || []);
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
        {loading && <div className="text-sm text-gray-500 animate-pulse">Refreshing data...</div>}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top Selling Products */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Top Selling Products</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="px-2 py-2">Product</th>
                  <th className="px-2 py-2 text-right">Qty Sold</th>
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
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="px-2 py-2">Customer</th>
                  <th className="px-2 py-2 text-right">Total Spent</th>
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
