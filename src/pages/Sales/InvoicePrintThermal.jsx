import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

const money = (n) => Number(n || 0).toLocaleString();

export default function InvoicePrintThermal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/sales/${id}`);
                setSale(res.data.data);
            } catch (e) {
                console.error(e);
                setErr(e.response?.data?.message || e.message || "Failed to load");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    const totals = useMemo(() => {
        if (!sale) return { sub: 0 };
        return { sub: sale.subTotal };
    }, [sale]);

    if (loading)
        return <div className="p-4 text-xs">Loading...</div>;

    if (!sale)
        return <div className="p-4 text-xs text-red-600">Error: {err}</div>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
            {/* Controls */}
            <div className="mb-4 flex gap-2 no-print">
                <button
                    onClick={() => window.print()}
                    className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
                >
                    Print Thermal
                </button>
                <button
                    onClick={() => navigate(`/sales/invoices/${id}/print`)}
                    className="rounded-lg border bg-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-gray-50"
                >
                    Switch to A4
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-lg border bg-white px-4 py-2 text-xs hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            {/* Thermal Receipt Container */}
            <div className="bg-white p-2 shadow-lg print:shadow-none print:p-0">
                <div
                    id="thermal-print-area"
                    className="bg-white text-black font-mono text-[10px] leading-tight"
                    style={{ width: "80mm" }}
                >
                    <style>{`
            @page { size: auto; margin: 0; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              #thermal-print-area { width: 100% !important; padding: 5px; }
            }
          `}</style>

                    {/* Header */}
                    <div className="text-center mb-2">
                        <div className="text-sm font-bold uppercase">Black Diamond</div>
                        <div className="text-[9px]">Karachi, Pakistan</div>
                        <div className="text-[9px]">0300-1234567</div>
                    </div>

                    <div className="border-b border-black border-dashed my-1"></div>

                    {/* Invoice Meta */}
                    <div className="flex justify-between">
                        <span>Inv No:</span>
                        <span className="font-bold">{sale.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1">
                        <span className="block italic">Customer:</span>
                        <span className="font-bold block">{sale.customerSnapshot?.name || sale.customerName}</span>
                        {sale.customerSnapshot?.phone && (
                            <span className="block text-[9px]">{sale.customerSnapshot.phone}</span>
                        )}
                    </div>

                    <div className="border-b border-black border-dashed my-1"></div>

                    {/* Items */}
                    <div className="space-y-1">
                        {sale.items.map((it, idx) => (
                            <div key={idx} className="flex flex-col">
                                <div className="font-bold">{it.productId?.materialId?.name || "Item"}</div>
                                {it.productId?.sku && <div className="text-[9px]">{it.productId.sku}</div>}
                                <div className="flex justify-between pl-2">
                                    <span>{it.qty} x {money(it.price)}</span>
                                    <span className="font-bold">{money(it.lineTotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-black border-dashed my-1"></div>

                    {/* Totals */}
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{money(totals.sub)}</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>- {money(sale.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs font-bold mt-1">
                        <span>TOTAL:</span>
                        <span>Rs. {money(sale.grandTotal)}</span>
                    </div>

                    <div className="border-b border-black border-dashed my-1"></div>

                    {/* Footer */}
                    <div className="text-center mt-2">
                        <div className="text-[9px]">Thank you for your business!</div>
                        <div className="text-[8px] mt-1">Software by BlackDiamond ERP</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
