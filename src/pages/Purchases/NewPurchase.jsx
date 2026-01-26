import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { createPurchase } from "../../api/purchases";
import { createRawMaterial } from "../../api/rawMaterials";

const money = (n) => Number(n || 0).toLocaleString();

export default function NewPurchase() {
  const nav = useNavigate();

  // States
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");

  // New Supplier States
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");

  const [materials, setMaterials] = useState([]);

  // Item Entry Form
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newAttributes, setNewAttributes] = useState([]); // [{ key, label, type, options: [] }]

  const [materialId, setMaterialId] = useState("");
  const [itemAttributes, setItemAttributes] = useState({});
  const [qty, setQty] = useState(""); // Weight/Count
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  // No Cart, Single Item Logic

  // Status
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    // Load Suppliers & Materials
    Promise.all([
      api.get("/suppliers").catch(() => ({ data: { data: [] } })),
      api.get("/raw-materials").catch(() => ({ data: { data: [] } })),
    ]).then(([supRes, matRes]) => {
      setSuppliers(supRes.data.data || []);
      setMaterials(matRes.data.data || []);
    });
  }, []);

  // When material selected, reset attributes
  useEffect(() => {
    if (!isNewMaterial) {
      setItemAttributes({}); // Reset dynamic attributes
    }
  }, [materialId, isNewMaterial]);

  // Calculations for current single item
  const currentQty = Number(qty) || 0;
  const currentPrice = Number(price) || 0;
  const lineTotal = currentQty * currentPrice;
  const subTotal = lineTotal;
  const grandTotal = subTotal;
  const dueAmount = Math.max(0, grandTotal - Number(paidAmount || 0));

  const savePurchase = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      // 1. Prepare Material Info
      let finalMaterialId = materialId;
      let finalMaterialName = "";

      if (isNewMaterial) {
        if (!newMaterialName.trim()) { setSaving(false); return setErr("Material Name is required"); }
        try {
          const mRes = await createRawMaterial({ name: newMaterialName, attributes: newAttributes });
          finalMaterialId = mRes.data._id;
          finalMaterialName = mRes.data.name;
        } catch (e) {
          setSaving(false); return setErr("Failed to create material: " + e.message);
        }
      } else {
        const selectedMat = materials.find(m => m._id === materialId);
        if (selectedMat) finalMaterialName = selectedMat.name;
      }

      if (!finalMaterialId) { setSaving(false); return setErr("Select a material"); }
      if (currentQty <= 0) { setSaving(false); return setErr("Enter valid quantity"); }
      if (currentPrice < 0) { setSaving(false); return setErr("Enter valid price"); }

      // 2. Prepare Supplier Info
      let finalSupplierId = supplierId;
      if (isNewSupplier) {
        if (!newSupplierName.trim()) { setSaving(false); return setErr("Supplier Name is required"); }
        try {
          const splRes = await api.post("/suppliers", { name: newSupplierName, phone: newSupplierPhone });
          finalSupplierId = splRes.data.data._id;
        } catch (e) {
          setSaving(false); return setErr("Failed to create supplier: " + (e?.response?.data?.message || e.message));
        }
      } else {
        if (!finalSupplierId) { setSaving(false); return setErr("Please select a supplier"); }
      }

      // 3. Payload
      const payload = {
        supplierId: finalSupplierId,
        items: [{
          materialId: finalMaterialId || null,
          description: finalMaterialName,
          qty: currentQty,
          unit,
          price: currentPrice,
          attributes: { ...itemAttributes }, // Copy attributes
        }],
        paymentMethod,
        paidAmount: Number(paidAmount || 0),
        note: note.trim(),
      };

      await createPurchase(payload);
      nav(`/purchases`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save purchase");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">New Purchase Entry</h1>
          <p className="text-sm text-gray-500">Record single material purchase</p>
        </div>
      </div>

      {err && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800 border-red-200 border">{err}</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header Info */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Supplier</label>
                <button
                  onClick={() => setIsNewSupplier(!isNewSupplier)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {isNewSupplier ? "Select Existing" : "+ New Supplier"}
                </button>
              </div>

              {!isNewSupplier ? (
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} {s.phone ? `(${s.phone})` : ""}</option>)}
                </select>
              ) : (
                <div className="space-y-2 mt-1">
                  <input
                    placeholder="Supplier Name"
                    value={newSupplierName}
                    onChange={e => setNewSupplierName(e.target.value)}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 ring-1 ring-blue-100"
                  />
                  <input
                    placeholder="Phone (Optional)"
                    value={newSupplierPhone}
                    onChange={e => setNewSupplierPhone(e.target.value)}
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 ring-1 ring-blue-100"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Note / Reference</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
              />
            </div>
          </div>

          {/* Item Entry */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Item Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">Material Type</label>
                  <button
                    onClick={() => setIsNewMaterial(!isNewMaterial)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    {isNewMaterial ? "Select Existing" : "+ New"}
                  </button>
                </div>
                {!isNewMaterial ? (
                  <select
                    value={materialId}
                    onChange={e => setMaterialId(e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                  >
                    <option value="">-- Select --</option>
                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                ) : (
                  <div className="space-y-3 mt-1">
                    <input
                      placeholder="Material Name (e.g. Viscose)"
                      value={newMaterialName}
                      onChange={e => setNewMaterialName(e.target.value)}
                      className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 ring-1 ring-blue-100"
                    />

                    {/* Attribute Builder */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-blue-800">Attributes (Optional)</span>
                        <button
                          onClick={() => setNewAttributes([...newAttributes, { key: "", label: "", type: "text", options: [] }])}
                          className="text-xs bg-white border border-blue-200 px-2 py-1 rounded hover:bg-blue-100"
                        >
                          + Add Field
                        </button>
                      </div>
                      {newAttributes.map((attr, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-start">
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            <input
                              placeholder="Label (e.g. Quality)"
                              value={attr.label}
                              onChange={e => {
                                const list = [...newAttributes];
                                list[idx].label = e.target.value;
                                list[idx].key = e.target.value.toLowerCase().replace(/\s+/g, "_");
                                setNewAttributes(list);
                              }}
                              className="rounded border px-2 py-1 text-xs"
                            />
                            <select
                              value={attr.type}
                              onChange={e => {
                                const list = [...newAttributes];
                                list[idx].type = e.target.value;
                                setNewAttributes(list);
                              }}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                            </select>
                            {attr.type === 'select' && (
                              <input
                                placeholder="Options (comma sep)"
                                value={attr.options?.join(", ")}
                                onChange={e => {
                                  const list = [...newAttributes];
                                  list[idx].options = e.target.value.split(",").map(s => s.trim());
                                  setNewAttributes(list);
                                }}
                                className="rounded border px-2 py-1 text-xs"
                              />
                            )}
                          </div>
                          <button
                            onClick={() => setNewAttributes(newAttributes.filter((_, i) => i !== idx))}
                            className="text-red-500 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Attributes */}
              {!isNewMaterial && materialId && (
                (() => {
                  const mat = materials.find(m => m._id === materialId);
                  return mat?.attributes?.map(attr => (
                    <div key={attr.key} className="md:col-span-3">
                      <label className="text-xs text-gray-500">{attr.label} {attr.required ? '*' : ''}</label>
                      {attr.type === 'select' ? (
                        <select
                          value={itemAttributes[attr.key] || ""}
                          onChange={e => setItemAttributes({ ...itemAttributes, [attr.key]: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                        >
                          <option value="">Select...</option>
                          {attr.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={attr.type === 'number' ? 'number' : 'text'}
                          value={itemAttributes[attr.key] || ""}
                          onChange={e => setItemAttributes({ ...itemAttributes, [attr.key]: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                        />
                      )}
                    </div>
                  ));
                })()
              )}

              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Weight/Qty</label>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Unit</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                >
                  <option value="kg">Kg</option>
                  <option value="unit">Unit</option>
                  <option value="m">Meter</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Cost/Unit</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300"
                />
              </div>
            </div>

            {/* Total Display for Item */}
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <div className="text-xs text-gray-500">Item Total</div>
                <div className="text-lg font-bold">{money(lineTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Totals */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Payment Details</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                <span>Grand Total</span>
                <span>{money(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div>
                <label className="text-xs text-gray-500">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 mt-1"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Paid Amount</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-gray-300 mt-1"
                />
              </div>
              <div className="flex justify-between text-sm font-medium pt-2">
                <span className="text-gray-500">Balance Due</span>
                <span className="text-red-600">{money(dueAmount)}</span>
              </div>
            </div>

            <button
              onClick={savePurchase}
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
