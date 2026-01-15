import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            <div>
                <div className="text-xl font-bold">All Invoices</div>
                <div className="text-sm text-gray-500">View and manage all sales invoices</div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
                    <div>
                        <div className="text-xs text-gray-500">From Date</div>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">To Date</div>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Customer Type</div>
                        <select
                            value={customerTypeFilter}
                            onChange={(e) => setCustomerTypeFilter(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        >
                            <option value="all">All</option>
                            <option value="walkin">Walk-in</option>
                            <option value="regular">Registered</option>
                        </select>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Invoice #</div>
                        <input
                            type="text"
                            value={searchInvoice}
                            onChange={(e) => setSearchInvoice(e.target.value)}
                            placeholder="Search invoice..."
                            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Customer Name</div>
                        <input
                            type="text"
                            value={searchCustomer}
                            onChange={(e) => setSearchCustomer(e.target.value)}
                            placeholder="Search customer..."
                            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadInvoices}
                            className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="rounded-2xl border bg-white shadow-sm">
                <div className="overflow-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                            <tr>
                                <th className="px-3 py-2">Invoice #</th>
                                <th className="px-3 py-2">Date & Time</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2 text-right">Paid</th>
                                <th className="px-3 py-2 text-right">Due</th>
                                <th className="px-3 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td className="px-3 py-4 text-center text-gray-500" colSpan={8}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td className="px-3 py-4 text-center text-gray-500" colSpan={8}>
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-semibold text-blue-600">{inv.invoiceNo}</td>
                                        <td className="px-3 py-2 text-xs">
                                            <div>{formatDate(inv.createdAt)}</div>
                                            <div className="text-gray-500">{formatTime(inv.createdAt)}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm">{inv.customerSnapshot?.name || inv.customerName}</div>
                                            {inv.customerSnapshot?.phone ? (
                                                <div className="text-xs text-gray-500">{inv.customerSnapshot.phone}</div>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2 capitalize">{inv.saleType}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{money(inv.grandTotal)}</td>
                                        <td className="px-3 py-2 text-right text-green-600">{money(inv.paidAmount)}</td>
                                        <td className="px-3 py-2 text-right text-red-600">
                                            {inv.dueAmount > 0 ? money(inv.dueAmount) : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                onClick={() => nav(`/invoices/${inv._id}`)}
                                                className="inline-block rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                                            >
                                                Print
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 text-xs text-gray-500">
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                </div>
            </div>
        </div>
    );
}
