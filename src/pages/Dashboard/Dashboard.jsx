import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const money = (n) => Number(n || 0).toLocaleString();

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState(null);
  const [month, setMonth] = useState(null);
  const [lastMonth, setLastMonth] = useState(null);

  const [trend, setTrend] = useState([]);
  const [top, setTop] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [t, w, m, lm, tr, tp] = await Promise.all([
          api.get("/reports/sales-summary?range=today"),
          api.get("/reports/sales-summary?range=week"),
          api.get("/reports/sales-summary?range=month"),
          api.get("/reports/sales-summary?range=lastMonth"),
          api.get("/reports/sales-trend-daily?days=14"),
          api.get("/reports/top-shades?limit=10"),
        ]);

        setToday(t.data.data);
        setWeek(w.data.data);
        setMonth(m.data.data);
        setLastMonth(lm.data.data);

        setTrend(
          (tr.data.data || []).map((x) => ({
            date: x._id,
            totalSales: x.totalSales,
            orders: x.orders,
          }))
        );

        setTop(
          (tp.data.data || []).map((x) => ({
            name: `${x.material}-${x.shadeCode}`,
            qtySold: x.qtySold,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cards = useMemo(() => {
    const c = [
      { title: "Today Sales", value: money(today?.totalSales), sub: `Orders: ${today?.orders || 0}` },
      { title: "This Week Sales", value: money(week?.totalSales), sub: `Orders: ${week?.orders || 0}` },
      { title: "This Month Sales", value: money(month?.totalSales), sub: `Orders: ${month?.orders || 0}` },
      { title: "Last Month Sales", value: money(lastMonth?.totalSales), sub: `Orders: ${lastMonth?.orders || 0}` },
    ];
    return c;
  }, [today, week, month, lastMonth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">Overview</div>
          <div className="text-sm text-gray-500">Today / Week / Month performance</div>
        </div>
        {loading ? <div className="text-sm text-gray-500">Loading…</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} sub={c.sub} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Sales Trend (Last 14 days)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="totalSales" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Top Shades (Qty Sold)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="qtySold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
