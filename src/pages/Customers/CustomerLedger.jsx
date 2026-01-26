import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/axios";
import { ArrowLeft, Wallet } from "lucide-react";
import StatCard from "../../components/ui/StatCard";

const money = (n) => Number(n || 0).toLocaleString();
const dateFmt = (d) => new Date(d).toLocaleDateString();

export default function CustomerLedger() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Payment Modal
    const [showPay, setShowPay] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [processing, setProcessing] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/customers/${id}/ledger`);
            setData(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    const handlePayment = async () => {
        if (!amount || Number(amount) <= 0) return alert("Enter valid amount");

        setProcessing(true);
        try {
            await api.post(`/customers/${id}/payment`, {
                amount: Number(amount),
                note
            });
            setShowPay(false);
            setAmount("");
            setNote("");
            load(); // Refresh data
        } catch (e) {
            alert(e.response?.data?.message || "Payment failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading && !data) return <div>Loading Ledger...</div>;
    if (!data) return <div>Customer not found</div>;

    const { customer, totalDue, unpaidInvoices, payments } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Link to="/customers" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{customer.name}</h1>
                        <p className="text-sm text-gray-500">{customer.phone} · Ledger</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowPay(true)}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                >
                    <Wallet className="h-4 w-4" />
                    Receive Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Due Is" value={money(totalDue)} sub="Outstanding Balance" />
                <StatCard
                    title="Wallet Balance"
                    value={money(customer.walletBalance)}
                    sub="Advance Payment"
                    icon={<Wallet className="h-4 w-4 text-green-600" />}
                />
                <StatCard
                    title="Net Payable"
                    value={money(Math.max(0, totalDue - (customer.walletBalance || 0)))}
                    sub={totalDue - (customer.walletBalance || 0) < 0 ? "In Credit" : "To Pay"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unpaid Invoices */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-4 font-bold text-gray-800">Unpaid Invoices (FIFO Queue)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Invoice #</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                    <th className="px-3 py-2 text-right">Paid</th>
                                    <th className="px-3 py-2 text-right text-red-600">Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {unpaidInvoices.map((inv) => (
                                    <tr key={inv._id}>
                                        <td className="px-3 py-2 text-gray-500">{dateFmt(inv.createdAt)}</td>
                                        <td className="px-3 py-2 font-medium">{inv.invoiceNo}</td>
                                        <td className="px-3 py-2 text-right">{money(inv.grandTotal)}</td>
                                        <td className="px-3 py-2 text-right text-green-600">{money(inv.paidAmount)}</td>
                                        <td className="px-3 py-2 text-right font-bold text-red-600">{money(inv.dueAmount)}</td>
                                    </tr>
                                ))}
                                {unpaidInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400">All invoices paid!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment History */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <h3 className="mb-4 font-bold text-gray-800">Payment History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left text-xs text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Applied To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map((p) => (
                                    <tr key={p._id}>
                                        <td className="px-3 py-2 text-gray-500">{dateFmt(p.date)}</td>
                                        <td className="px-3 py-2 font-bold text-green-600">+{money(p.amount)}</td>
                                        <td className="px-3 py-2 text-xs text-gray-500">
                                            {p.appliedTo.map(x => `#${x.invoiceNo} (${money(x.amount)})`).join(", ")}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-400">No payments received yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showPay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-bold">Receive Payment</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Amount Received</label>
                                <input
                                    type="number"
                                    autoFocus
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-lg font-bold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    placeholder="0"
                                />
                                <p className="mt-1 text-xs text-gray-500">Will be applied to oldest invoices first.</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Note (Optional)</label>
                                <input
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-green-500"
                                    placeholder="Reference, Cheque No, etc."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPay(false)}
                                    className="flex-1 rounded-xl bg-gray-100 py-2 font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="flex-1 rounded-xl bg-green-600 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing ? "Processing..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
