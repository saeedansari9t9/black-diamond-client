import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Search, RefreshCcw, Plus, Calendar } from "lucide-react";
import { api } from "../../api/axios";

const money = (n) => Number(n || 0).toLocaleString();
const formatDate = (d) => new Date(d).toLocaleDateString();
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Invoices() {
    const nav = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchInvoice, setSearchInvoice] = useState("");
    const [searchCustomer, setSearchCustomer] = useState("");
    const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            const res = await api.get(`/sales?${params.toString()}`);
            setInvoices(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const filteredInvoices = invoices.filter((inv) => {
        const invoiceMatch = inv.invoiceNo.toLowerCase().includes(searchInvoice.toLowerCase());
        const customerName = inv.customerSnapshot?.name || inv.customerName || "";
        const customerMatch = customerName.toLowerCase().includes(searchCustomer.toLowerCase());
        const isWalkIn = customerName.toLowerCase() === "walk-in";

        let typeMatch = true;
        if (customerTypeFilter === "walkin") typeMatch = isWalkIn;
        if (customerTypeFilter === "regular") typeMatch = !isWalkIn;

        return invoiceMatch && customerMatch && typeMatch;
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                    <p className="text-sm text-gray-500">View and manage all sales invoices</p>
                </div>
                <button
                    onClick={() => nav('/sales/new')}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} /> New Invoice
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">From Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">To Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
                        <select
                            value={customerTypeFilter}
                            onChange={(e) => setCustomerTypeFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        >
                            <option value="all">All Types</option>
                            <option value="walkin">Walk-in</option>
                            <option value="regular">Registered</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Invoice #</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchInvoice}
                                onChange={(e) => setSearchInvoice(e.target.value)}
                                placeholder="Search..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Customer</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={searchCustomer}
                                onChange={(e) => setSearchCustomer(e.target.value)}
                                placeholder="Search name..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={loadInvoices}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Items</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Paid</th>
                                <th className="px-6 py-4 text-right">Due</th>
                                <th className="px-6 py-4 text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td className="px-6 py-12 text-center text-gray-500" colSpan={9}>
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div> Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-12 text-center text-gray-500 italic" colSpan={9}>
                                        No invoices found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-blue-600 font-mono text-xs">{inv.invoiceNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{formatDate(inv.createdAt)}</div>
                                            <div className="text-xs text-gray-500">{formatTime(inv.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inv.customerSnapshot?.name || inv.customerName}</div>
                                            {inv.customerSnapshot?.phone && (
                                                <div className="text-xs text-gray-500">{inv.customerSnapshot.phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${(inv.customerSnapshot?.name || inv.customerName || "").toLowerCase() === 'walk-in' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                                                {(inv.customerSnapshot?.name || inv.customerName || "").toLowerCase() === 'walk-in' ? 'Walk-in' : 'Registered'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {inv.items?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{money(inv.grandTotal)}</td>
                                        <td className="px-6 py-4 text-right font-medium text-green-600">{money(inv.paidAmount)}</td>
                                        <td className="px-6 py-4 text-right text-red-600 font-medium">
                                            {inv.dueAmount > 0 ? money(inv.dueAmount) : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => nav(`/sales/invoices/${inv._id}/print`)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all opacity-100"
                                            >
                                                <Printer size={14} /> Print
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredInvoices.length > 0 && (
                    <div className="bg-slate-50 border-t border-gray-200 px-6 py-3 text-xs text-gray-500 flex justify-between items-center">
                        <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
                    </div>
                )}
            </div>
        </div>
    );
}
