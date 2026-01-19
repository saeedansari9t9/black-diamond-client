import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/axios";
import { useReactToPrint } from "react-to-print";

const money = (n) => Number(n || 0).toLocaleString();

export default function InvoicePrint() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef(null);

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

  const onPrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: sale?.invoiceNo || "invoice",
  });

  const totals = useMemo(() => {
    if (!sale) return { sub: 0 };
    return { sub: sale.subTotal };
  }, [sale]);

  if (loading)
    return <div className="text-sm text-gray-500">Loading invoice {id}...</div>;

  if (!sale)
    return (
      <div className="p-4 text-sm text-red-600">
        <div className="font-bold">Invoice not found</div>
        <div>ID: {id}</div>
        <div>Error: {err}</div>
        <button onClick={() => window.location.reload()} className="mt-2 text-blue-600 hover:underline">Retry</button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold">Invoice</div>
          <div className="text-sm text-gray-500">{sale.invoiceNo}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Print / Save PDF
          </button>
          <button
            onClick={() => window.history.back()}
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Printable A4 */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div ref={printRef} className="print-a4 bg-white text-gray-900">
          {/* Print CSS */}
          <style>{`
            @page { size: A4; margin: 12mm; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
            .print-a4 { width: 100%; }
            .inv-table th, .inv-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          `}</style>

          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold">Black Diamond</div>
              <div className="mt-2 text-xs text-gray-600">
                Address: ____________ <br />
                Phone: ____________
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold">INVOICE</div>
              <div className="text-sm">
                No: <span className="font-semibold">{sale.invoiceNo}</span>
              </div>
              <div className="text-sm">
                Date: {new Date(sale.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">BILL TO</div>
              <div className="mt-1 font-semibold">
                {sale.customerSnapshot?.name || sale.customerName || "Walk-in"}
              </div>
              {sale.customerSnapshot?.phone ? (
                <div className="text-gray-700">
                  Phone: {sale.customerSnapshot.phone}
                </div>
              ) : null}
              <div className="text-gray-700">Type: {sale.saleType}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">PAYMENT</div>
              <div className="mt-1">
                Method:{" "}
                <span className="font-semibold">{sale.paymentMethod}</span>
              </div>
              <div>
                Paid:{" "}
                <span className="font-semibold">{money(sale.paidAmount)}</span>
              </div>
              <div>
                Due:{" "}
                <span className="font-semibold">{money(sale.dueAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <table className="inv-table w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600">
                  <th>Item</th>
                  <th className="w-20">Qty</th>
                  <th className="w-28">Price</th>
                  <th className="w-28 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold">
                        {it.productId?.materialId?.name || "Material"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {it.productId?.sku || "-"}
                      </div>
                    </td>
                    <td>{it.qty}</td>
                    <td>{money(it.price)}</td>
                    <td className="text-right">{money(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{money(totals.sub)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold">{money(sale.discount)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold">{money(sale.grandTotal)}</span>
                </div>
              </div>
            </div>

            {sale.note ? (
              <div className="mt-4 rounded-xl border p-3 text-sm">
                <div className="text-xs text-gray-500">NOTE</div>
                <div className="mt-1">{sale.note}</div>
              </div>
            ) : null}

            <div className="mt-6 text-center text-xs text-gray-500">
              Thanks for your business.
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        PDF banane ke liye:{" "}
        <span className="font-semibold">Print → Save as PDF</span>
      </div>
    </div>
  );
}
