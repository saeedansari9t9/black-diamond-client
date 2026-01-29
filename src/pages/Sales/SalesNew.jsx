import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { fetchProducts } from "../../api/products";

const money = (n) => Number(n || 0).toLocaleString();

export default function SalesNew() {
  const nav = useNavigate();
  // header fields
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleType, setSaleType] = useState("retail"); // default for your business
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [note, setNote] = useState("");

  // product search + list
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // cart items
  const [items, setItems] = useState([]);

  // save state
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchProducts("");
        setProducts(data);
      } finally {
        setLoadingProducts(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await api.get("/customers");
      setCustomers(res.data.data || []);
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 30);
    return products
      .filter((p) => {
        const sku = (p.sku || "").toLowerCase();
        const mat = (p.materialId?.name || "").toLowerCase();
        return (
          sku.includes(q) ||
          mat.includes(q)
        );
      })
      .slice(0, 30);
  }, [search, products]);

  const addToCart = (p) => {
    setMsg("");
    setErr("");

    setItems((prev) => {
      const exists = prev.find((x) => x.productId === p._id);
      const defaultPrice =
        saleType === "retail"
          ? Number(p.retailPrice || 0)
          : Number(p.wholesalePrice || 0);

      if (exists) {
        return prev.map((x) =>
          x.productId === p._id
            ? { ...x, qty: x.qty + 1, price: x.price || defaultPrice }
            : x
        );
      }
      return [
        ...prev,
        {
          productId: p._id,
          sku: p.sku,
          material: p.materialId?.name,
          attributes: p.attributes || {}, // Capture attributes
          size: p.size,
          qualityType: p.qualityType,
          qty: 1,
          price: defaultPrice || 0,
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  };

  const updateItem = (productId, patch) => {
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, ...patch } : x))
    );
  };

  // Helper to display attributes string
  const getAttrString = (attrs) => {
    if (!attrs) return "";
    return Object.values(attrs).filter(Boolean).join(" • ");
  };


  const subTotal = useMemo(() => {
    return items.reduce(
      (s, it) => s + Number(it.qty || 0) * Number(it.price || 0),
      0
    );
  }, [items]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subTotal);
  }, [subTotal]);

  const dueAmount = useMemo(() => {
    return Math.max(0, grandTotal - Number(paidAmount || 0));
  }, [grandTotal, paidAmount]);

  // when sale type changes, update default prices (only if current price is 0)
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        // keep manual prices
        if (Number(it.price) > 0) return it;
        return it;
      })
    );
  }, [saleType]);

  const saveSale = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      if (items.length === 0) {
        setErr("Add at least 1 item");
        return;
      }

      const payload = {
        customerId: customerId || null,
        customerName: customerName.trim() || "Walk-in",
        saleType,
        items: items.map((it) => ({
          productId: it.productId,
          qty: Number(it.qty),
          price: Number(it.price),
        })),
        discount: 0,
        paymentMethod,
        paidAmount: Number(paidAmount || 0),
        note: note.trim(),
      };

      const res = await api.post("/sales", payload);

      // Navigate to invoice print page
      // Navigate to invoice print page
      nav(`/sales/invoices/${res.data.data._id}/print`);
      return;
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Sale</h1>
          <p className="text-sm text-gray-500">
            Create invoice and auto-update stock
          </p>
        </div>


      </div>

      {msg ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {msg}
        </div>
      ) : null}
      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </div>
      ) : null}

      {/* Top form */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Product Picker */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm xl:col-span-1 flex flex-col h-[600px] xl:h-[calc(100vh-9rem)] xl:sticky xl:top-6">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="text-sm font-bold text-gray-800">Add Products</div>
            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {loadingProducts ? "Loading…" : `${products.length} items`}
            </div>
          </div>

          <div className="mb-4 flex-shrink-0">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU / material..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 pr-1 custom-scrollbar">
            {filteredProducts.map((p) => (
              <button
                key={p._id}
                onClick={() => addToCart(p)}
                className="group flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-slate-50 transition-colors last:border-b-0"
              >
                <div>
                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.sku}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {p.materialId?.name}
                    {p.attributes && Object.keys(p.attributes).length > 0
                      ? ` • ${Object.values(p.attributes).filter(Boolean).join(" • ")}`
                      : ""}
                  </div>
                </div>
                <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Add +
                </span>
              </button>
            ))}
            {!loadingProducts && filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 italic">No products found</div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sale Type</label>
                <select
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Payment</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Note</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional order notes..."
                className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:font-normal"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Invoice Items</h3>
              <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{items.length} items</div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 w-32">Qty</th>
                    <th className="px-4 py-3 w-36">Price</th>
                    <th className="px-4 py-3 w-32 text-right">Total</th>
                    <th className="px-4 py-3 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <tr key={it.productId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-gray-900">{it.sku}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {it.material}
                          {it.attributes && Object.keys(it.attributes).length > 0
                            ? ` • ${getAttrString(it.attributes)}`
                            : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(it.productId, {
                              qty: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={it.price}
                          onChange={(e) =>
                            updateItem(it.productId, {
                              price: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {money(Number(it.qty) * Number(it.price))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(it.productId)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-2xl">🛒</span>
                          <p>Your cart is empty. Add products from the left panel.</p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {items.map((it) => (
                <div key={it.productId} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{it.sku}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {it.material}
                        {it.attributes && Object.keys(it.attributes).length > 0
                          ? ` • ${getAttrString(it.attributes)}`
                          : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(it.productId)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Qty</div>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.productId, {
                            qty: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Price</div>
                      <input
                        type="number"
                        min={0}
                        value={it.price}
                        onChange={(e) =>
                          updateItem(it.productId, {
                            price: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Line Total</span>
                    <span className="text-sm font-bold text-gray-900">
                      {money(Number(it.qty) * Number(it.price))}
                    </span>
                  </div>
                </div>
              ))}

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                  Add products from above list to create invoice
                </div>
              ) : null}
            </div>

            {/* Totals */}
            <div className="mt-6 flex flex-col items-end border-t border-gray-100 pt-6">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{money(subTotal)}</span>
                </div>

                <div className="flex items-center justify-between text-base">
                  <span className="font-medium text-gray-900">Grand Total</span>
                  <span className="font-bold text-gray-900">{money(grandTotal)}</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Paid Amount</span>
                  </div>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-right text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min={0}
                  />
                </div>

                <div className="flex items-center justify-between text-base pt-2">
                  <span className="font-medium text-gray-900">Balance Due</span>
                  <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{money(dueAmount)}</span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={saveSale}
                    disabled={saving}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 transition-all"
                  >
                    {saving ? "Saving..." : "Complete Sale"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
