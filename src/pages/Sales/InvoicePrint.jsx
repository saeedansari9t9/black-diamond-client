import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/axios";
import html2pdf from "html2pdf.js";

const money = (n) => Number(n || 0).toLocaleString();

export default function InvoicePrint() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);
  const [err, setErr] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  const handleSavePDF = () => {
    const element = document.getElementById('invoice-print-area');
    const opt = {
      margin: 0,
      filename: `Invoice_${sale?.invoiceNo || 'new'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setGeneratingPdf(true);
    html2pdf().from(element).set(opt).save().then(() => {
      setGeneratingPdf(false);
    });
  };

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print p-2 sm:p-0">
        <div>
          <div className="text-lg sm:text-xl font-bold">Invoice Preview</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none rounded-xl bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-black shadow-lg"
          >
            Print
          </button>
          <button
            onClick={handleSavePDF}
            disabled={generatingPdf}
            className="flex-1 sm:flex-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
          >
            {generatingPdf ? "Saving..." : "Save PDF"}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 sm:flex-none rounded-xl border bg-white px-4 py-2 text-xs sm:text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Printable Area - A4 Standard */}
      <div className="flex justify-center overflow-hidden bg-gray-100 p-2 sm:p-8 print:p-0 print:bg-white print:overflow-visible">
        <div className="origin-top scale-[0.38] shadow-xl sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] print:transform-none print:shadow-none">
          <div
            id="invoice-print-area"
            className="bg-white text-gray-900 flex flex-col"
            style={{ width: '210mm', minHeight: 'auto', padding: '15mm 20mm' }}
          >
            <style>{`
              @page { size: A4 portrait; margin: 0; }
              @media print {
                html, body {
                  width: 210mm;
                  height: 297mm;
                  margin: 0;
                  padding: 0;
                  overflow: hidden; /* Prevent extra pages */
                }
                body * {
                  visibility: hidden;
                }
                #invoice-print-area, #invoice-print-area * {
                  visibility: visible;
                }
                #invoice-print-area {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 210mm;
                  min-height: 297mm !important;
                  margin: 0;
                  padding: 15mm 20mm !important;
                  z-index: 9999;
                  background: white;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                }
                .no-print { display: none !important; }
              }
            `}</style>

            {/* Top Content (Header + Info + Table) */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-12">
                {/* Logo / Company Name (Moved to Left) */}
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-bold tracking-wider mb-2">BlackDiamond</div>
                  <div className="text-xs text-gray-500 max-w-[250px] leading-relaxed">
                    Head Office: Karachi, Pakistan<br />
                    Phone: +92 300 1234567<br />
                    Email: info@blackdiamond.com
                  </div>
                </div>

                {/* Invoice Meta (Right) */}
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice No</div>
                    <div className="text-sm font-semibold text-gray-900">#{sale.invoiceNo}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(sale.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-12">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Issued To</div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {sale.customerSnapshot?.name || sale.customerName || "Walk-in Customer"}
                </div>
                {sale.customerSnapshot?.phone && (
                  <div className="text-sm text-gray-600 mb-1">
                    {sale.customerSnapshot.phone}
                  </div>
                )}
                {sale.customerSnapshot?.address && (
                  <div className="text-sm text-gray-600 max-w-[300px]">
                    {sale.customerSnapshot.address}
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 w-1/2">Description</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Rate</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Qty</th>
                      <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sale.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-4 text-sm text-gray-900">
                          <div className="font-semibold">{it.productId?.materialId?.name || "Item"}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{it.productId?.sku}</div>
                        </td>
                        <td className="py-4 text-right text-sm text-gray-600">{money(it.price)}</td>
                        <td className="py-4 text-right text-sm text-gray-600">{it.qty}</td>
                        <td className="py-4 text-right text-sm font-semibold text-gray-900">{money(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section: Footer / Totals / Payment */}
            <div>
              {/* Totals */}
              <div className="flex justify-end border-t border-gray-900 pt-6">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{money(totals.sub)}</span>
                  </div>

                  {sale.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>- {money(sale.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>Rs. {money(sale.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {/* <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-500">
                    <div className="font-bold text-gray-900 uppercase mb-1">Please make payment to</div>
                    <div>Meezan Bank</div>
                    <div>IBAN No : PK15MEZN0099730104399217</div>
                    <div>Title : Abdul Ghani Ansari</div>
                  </div>
                </div>
              </div> */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
