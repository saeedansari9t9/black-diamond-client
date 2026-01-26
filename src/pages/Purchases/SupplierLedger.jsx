import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import StatCard from "../../components/ui/StatCard";

const money = (n) => Number(n || 0).toLocaleString();
const formatDate = (d) => new Date(d).toLocaleDateString();

// Badge Component
const Badge = ({ children, tone = "gray" }) => {
    const tones = {
        gray: "bg-gray-100 text-gray-700",
        green: "bg-emerald-50 text-emerald-700",
        red: "bg-red-50 text-red-700",
        blue: "bg-blue-50 text-blue-700",
        orange: "bg-orange-50 text-orange-700",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
};

export default function SupplierLedger() {
    const { id } = useParams();
    const nav = useNavigate();

    const [supplier, setSupplier] = useState(null);
    const [totalDue, setTotalDue] = useState(0);
    const [unpaidPurchases, setUnpaidPurchases] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Payment Modal
    const [payModal, setPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payDate, setPayDate] = useState("");
    const [payNote, setPayNote] = useState("");
    const [savingPay, setSavingPay] = useState(false);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/suppliers/${id}/ledger`);
            if (res.data.ok) {
                const d = res.data.data;
                setSupplier(d.supplier);
                setTotalDue(d.totalDue);
                setUnpaidPurchases(d.unpaidPurchases);
                setPayments(d.payments);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handlePayment = async () => {
        if (!payAmount || Number(payAmount) <= 0) return alert("Enter valid amount");
        setSavingPay(true);
        try {
            await api.post(`/suppliers/${id}/pay`, {
                amount: Number(payAmount),
                date: payDate,
                note: payNote
            });
            setPayModal(false);
            setPayAmount("");
            setPayNote("");
            fetchLedger();
        } catch (e) {
            alert(e?.response?.data?.message || "Payment failed");
        } finally {
            setSavingPay(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!supplier) return <div>Supplier not found</div>;

    const wallet = supplier.walletBalance || 0;
    const netPayable = Math.max(0, totalDue - wallet);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button onClick={() => nav("/purchases")} className="mb-1 text-sm text-gray-500 hover:underline">
                        ← Back to Purchases
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{supplier.name}</h1>
                        <span className="text-sm text-gray-500">({supplier.phone})</span>
                    </div>
                    <p className="text-sm text-gray-500">Supplier Ledger & Payment History</p>
                </div>
                <button
                    onClick={() => setPayModal(true)}
                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black shadow-lg shadow-gray-200"
                >
                    Make Payment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <StatCard title="Total Due" value={money(totalDue)} sub="From unpaid purchases" />
                <StatCard
                    title="Advance / Wallet"
                    value={money(wallet)}
                    sub="Surplus Payment"
                    tone={wallet > 0 ? "green" : "gray"}
                />
                <div className={`rounded-3xl p-5 ${netPayable > 0 ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"}`}>
                    <div className={`text-sm font-medium ${netPayable > 0 ? "text-red-600" : "text-green-600"}`}>Net Payable</div>
                    <div className={`mt-2 text-3xl font-bold ${netPayable > 0 ? "text-red-700" : "text-green-700"}`}>
                        {money(netPayable)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Unpaid Invoices */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="border-b bg-gray-50 px-5 py-4 font-semibold text-gray-700">
                            Unpaid Purchases (Outstandings)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-white text-left text-xs text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">PO #</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3 text-right">Paid</th>
                                        <th className="px-5 py-3 text-right">Due</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {unpaidPurchases.length === 0 ? (
                                        <tr><td colSpan={6} className="p-6 text-center text-gray-400">No pending dues</td></tr>
                                    ) : unpaidPurchases.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 font-medium text-blue-600">{p.purchaseNo}</td>
                                            <td className="px-5 py-3">{formatDate(p.createdAt)}</td>
                                            <td className="px-5 py-3 text-right">{money(p.grandTotal)}</td>
                                            <td className="px-5 py-3 text-right text-green-600">{money(p.paidAmount)}</td>
                                            <td className="px-5 py-3 text-right font-bold text-red-600">{money(p.dueAmount)}</td>
                                            <td className="px-5 py-3 text-center">
                                                <Badge tone="red">Partial</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Wallet Row if exists */}
                                    {wallet > 0 && unpaidPurchases.length > 0 && (
                                        <tr className="bg-green-50">
                                            <td colSpan={4} className="px-5 py-3 text-right font-semibold text-green-700">Less Wallet Balance:</td>
                                            <td className="px-5 py-3 text-right font-bold text-green-700">-{money(wallet)}</td>
                                            <td></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Payment History */}
                <div className="space-y-4">
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="border-b bg-gray-50 px-5 py-4 font-semibold text-gray-700">
                            Last Payments (Outbound)
                        </div>
                        <div className="max-h-[500px] overflow-y-auto divide-y">
                            {payments.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-400">No payment history</div>
                            ) : payments.map(pay => (
                                <div key={pay._id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-900">{money(pay.amount)}</div>
                                            <div className="text-xs text-gray-500">{formatDate(pay.date)}</div>
                                        </div>
                                        <span className="text-xs bg-gray-100 rounded px-2 py-1 text-gray-600">Manual</span>
                                    </div>
                                    {pay.note && <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">{pay.note}</div>}
                                    {pay.appliedTo?.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            Paid: {pay.appliedTo.map(a => `${a.invoiceNo || "PO"} (${money(a.amount)})`).join(", ")}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pay Modal */}
            {payModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold">Record Payment to Supplier</h2>
                        <p className="text-sm text-gray-500">Money going OUT to {supplier.name}</p>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-gray-500">Amount</label>
                                <input
                                    type="number"
                                    autoFocus
                                    value={payAmount}
                                    onChange={e => setPayAmount(e.target.value)}
                                    className="w-full rounded-xl border bg-gray-50 p-3 text-lg font-bold outline-none focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Date</label>
                                <input
                                    type="date"
                                    value={payDate}
                                    onChange={e => setPayDate(e.target.value)}
                                    className="w-full rounded-xl border bg-gray-50 p-2 text-sm outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Note</label>
                                <textarea
                                    rows={2}
                                    value={payNote}
                                    onChange={e => setPayNote(e.target.value)}
                                    className="w-full rounded-xl border bg-gray-50 p-2 text-sm outline-none focus:border-blue-500"
                                    placeholder="Cheque No, Bank Ref..."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setPayModal(false)} className="rounded-xl px-4 py-2 text-sm hover:bg-gray-100">Cancel</button>
                            <button
                                onClick={handlePayment}
                                disabled={savingPay}
                                className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                            >
                                {savingPay ? "Processing..." : "Confirm Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
