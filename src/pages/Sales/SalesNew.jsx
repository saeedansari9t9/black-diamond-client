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
  const [paidAmount, setPaidAmount] = useState(0);
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
        const shade = (p.shadeId?.shadeCode || "").toLowerCase();
        const shadeName = (p.shadeId?.shadeName || "").toLowerCase();
        return (
          sku.includes(q) ||
          mat.includes(q) ||
          shade.includes(q) ||
          shadeName.includes(q)
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
          shadeCode: p.shadeId?.shadeCode,
          shadeName: p.shadeId?.shadeName,
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
      nav(`/invoices/${res.data.data._id}`);
      return;
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold">New Sale</div>
          <div className="text-sm text-gray-500">
            Create invoice and auto-update stock
          </div>
        </div>

        <button
          onClick={saveSale}
          disabled={saving}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Sale"}
        </button>
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm xl:col-span-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Customer</div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="">Walk-in</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-500">Sale Type</div>
              <select
                value={saleType}
                onChange={(e) => setSaleType(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-500">Payment</div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500">Note</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Totals</div>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{money(subTotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Grand Total</span>
              <span className="text-base font-bold">{money(grandTotal)}</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Paid</span>
                <span className="font-semibold">{money(paidAmount)}</span>
              </div>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                min={0}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due</span>
              <span className="font-bold text-red-600">{money(dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product picker + Cart */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Product Picker */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm xl:col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Add Products</div>
            <div className="text-xs text-gray-500">
              {loadingProducts ? "Loading…" : `${products.length} products`}
            </div>
          </div>

          <div className="mt-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU / material / shade"
              className="w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-300"
            />
          </div>

          <div className="mt-3 max-h-[420px] overflow-auto rounded-xl border">
            {filteredProducts.map((p) => (
              <button
                key={p._id}
                onClick={() => addToCart(p)}
                className="flex w-full items-start justify-between gap-3 border-b px-3 py-3 text-left hover:bg-gray-50 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {p.sku}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {p.materialId?.name} • Shade {p.shadeId?.shadeCode}
                    {p.shadeId?.shadeName
                      ? ` (${p.shadeId?.shadeName})`
                      : ""} • {p.size} • {p.qualityType}
                  </div>
                </div>
                <span className="rounded-lg border px-2 py-1 text-xs">Add</span>
              </button>
            ))}
            {!loadingProducts && filteredProducts.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No products found</div>
            ) : null}
          </div>
        </div>

        {/* Cart */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Invoice Items</div>
            <div className="text-xs text-gray-500">{items.length} items</div>
          </div>

          {/* Desktop table */}
          <div className="mt-3 hidden md:block">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 w-24">Qty</th>
                  <th className="px-3 py-2 w-32">Price</th>
                  <th className="px-3 py-2 w-32">Total</th>
                  <th className="px-3 py-2 w-20 text-right">Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.productId} className="border-b last:border-b-0">
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold">{it.sku}</div>
                      <div className="text-xs text-gray-500">
                        {it.material} • Shade {it.shadeCode} • {it.size} •{" "}
                        {it.qualityType}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.productId, {
                            qty: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border bg-gray-50 px-2 py-1.5 text-sm outline-none focus:border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        value={it.price}
                        onChange={(e) =>
                          updateItem(it.productId, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border bg-gray-50 px-2 py-1.5 text-sm outline-none focus:border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold">
                      {money(Number(it.qty) * Number(it.price))}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => removeItem(it.productId)}
                        className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100"
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
                      className="px-3 py-10 text-center text-sm text-gray-500"
                    >
                      Add products from left panel to create invoice
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-3 md:hidden space-y-3">
            {items.map((it) => (
              <div key={it.productId} className="rounded-2xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{it.sku}</div>
                    <div className="text-xs text-gray-500">
                      {it.material} • Shade {it.shadeCode} • {it.size} •{" "}
                      {it.qualityType}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.productId)}
                    className="rounded-lg border px-2 py-1 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Qty</div>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(it.productId, {
                          qty: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <input
                      type="number"
                      min={0}
                      value={it.price}
                      onChange={(e) =>
                        updateItem(it.productId, {
                          price: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Line Total</span>
                  <span className="font-semibold">
                    {money(Number(it.qty) * Number(it.price))}
                  </span>
                </div>
              </div>
            ))}

            {items.length === 0 ? (
              <div className="rounded-2xl border p-6 text-center text-sm text-gray-500">
                Add products from above list to create invoice
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
