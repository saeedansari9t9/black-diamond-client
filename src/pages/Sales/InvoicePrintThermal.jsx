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
                    className="bg-white text-black font-mono text-[12px] leading-normal"
                    style={{ width: "80mm" }}
                >
                    <style>{`
            @page { size: auto; margin: 0; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              #thermal-print-area { width: 100% !important; padding: 10px 5px; }
            }
          `}</style>

                    {/* Header */}
                    <div className="text-center mb-4">
                        <img src="/Diamond.png" alt="Logo" className="w-24 mx-auto mb-2" />
                        <div className="text-[11px]">Karachi, Pakistan</div>
                        <div className="text-[11px]">0300-1234567</div>
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    {/* Invoice Meta */}
                    <div className="flex justify-between mb-1">
                        <span>Inv No:</span>
                        <span className="font-bold">{sale.invoiceNo}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Date:</span>
                        <span>{new Date(sale.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                        <span className="block italic">Customer:</span>
                        <span className="font-bold block">{sale.customerSnapshot?.name || sale.customerName}</span>
                        {sale.customerSnapshot?.phone && (
                            <span className="block text-[11px]">{sale.customerSnapshot.phone}</span>
                        )}
                    </div>

                    <div className="border-b border-black border-b my-2"></div>

                    {/* Items Header */}
                    <div className="flex justify-between font-bold border-b border-black text-[11px] mb-2 pb-1">
                        <span className="w-1/3 text-left">Qty</span>
                        <span className="w-1/3 text-center">Rate</span>
                        <span className="w-1/3 text-right">Total</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                        {sale.items.map((it, idx) => {
                            // Logic to get the product name from the first material attribute
                            let displayName = it.productId?.materialId?.name || "Item";
                            const matAttrs = it.productId?.materialId?.attributes || [];
                            const prodAttrs = it.productId?.attributes || {};

                            if (matAttrs.length > 0) {
                                const firstKey = matAttrs[0].key;
                                if (prodAttrs[firstKey]) {
                                    displayName = prodAttrs[firstKey];
                                }
                            }

                            return (
                                <div key={idx} className="flex flex-col mb-1 border-b border-gray-200 pb-2 last:border-0">
                                    {/* Row 1: Product Name */}
                                    <div className="font-bold text-left mb-1">{displayName}</div>

                                    {/* Row 2: Qty | Rate | Total */}
                                    <div className="flex justify-between text-[11px]">
                                        <span className="w-1/3 text-left">{it.qty}</span>
                                        <span className="w-1/3 text-center">{money(it.price)}</span>
                                        <span className="w-1/3 text-right font-bold">{money(it.lineTotal)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    {/* Totals */}
                    <div className="flex justify-between mb-1">
                        <span>Subtotal:</span>
                        <span>{money(totals.sub)}</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between mb-1">
                            <span>Discount:</span>
                            <span>- {money(sale.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-bold mt-2">
                        <span>TOTAL:</span>
                        <span>Rs. {money(sale.grandTotal)}</span>
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    {/* Footer */}
                    <div className="text-center mt-4">
                        <div className="text-[11px] mb-1">Thank you for your business!</div>
                        <div className="text-[10px]">Software by BlackDiamond ERP</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
