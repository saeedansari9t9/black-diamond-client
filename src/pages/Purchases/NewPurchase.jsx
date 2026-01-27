import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { ArrowLeft, Check, Plus, Store, Trash2, User } from "lucide-react"; // Added Icons
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
  const [paidAmount, setPaidAmount] = useState(""); // Changed from 0 to ""
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Purchase</h1>
          <p className="text-sm text-gray-500">Record material purchase for inventory</p>
        </div>
        <Link
          to="/purchases"
          className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <ArrowLeft size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" /> Back to List
        </Link>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <span className="font-bold">Error:</span> {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Supplier Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <h3 className="font-bold text-gray-800">Supplier Details</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Select Supplier</label>
                    <button
                      onClick={() => setIsNewSupplier(!isNewSupplier)}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                      {isNewSupplier ? "Select Existing" : "+ Create New"}
                    </button>
                  </div>

                  {!isNewSupplier ? (
                    <div className="relative">
                      <select
                        value={supplierId}
                        onChange={e => setSupplierId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                      >
                        <option value="">-- Select Supplier --</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} {s.phone ? `(${s.phone})` : ""}</option>)}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                      <input
                        placeholder="Supplier Name *"
                        value={newSupplierName}
                        onChange={e => setNewSupplierName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        placeholder="Phone (Optional)"
                        value={newSupplierPhone}
                        onChange={e => setNewSupplierPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Invoice Note / Ref</label>
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Optional reference number..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Entry Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Store size={18} />
              </div>
              <h3 className="font-bold text-gray-800">Item Details</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Material Type</label>
                  <button
                    onClick={() => setIsNewMaterial(!isNewMaterial)}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                  >
                    {isNewMaterial ? "Select Existing" : "+ Create New Material"}
                  </button>
                </div>

                {!isNewMaterial ? (
                  <div className="relative">
                    <select
                      value={materialId}
                      onChange={e => setMaterialId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                    >
                      <option value="">-- Select Material --</option>
                      {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Material Name</label>
                      <input
                        placeholder="e.g. Cotton Yarn 20s"
                        value={newMaterialName}
                        onChange={e => setNewMaterialName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Attribute Builder */}
                    <div className="bg-white rounded-lg border border-blue-100 p-3">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-600 uppercase">Custom Attributes</span>
                        <button
                          onClick={() => setNewAttributes([...newAttributes, { key: "", label: "", type: "text", options: [] }])}
                          className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors font-semibold"
                        >
                          <Plus size={12} /> Add Field
                        </button>
                      </div>
                      {newAttributes.length === 0 && <div className="text-center text-xs text-gray-400 py-2">No custom attributes added</div>}
                      {newAttributes.map((attr, idx) => (
                        <div key={idx} className="flex flex-col gap-2 mb-3 last:mb-0 bg-gray-50 p-2 rounded-md border border-gray-100">
                          <div className="flex gap-2">
                            <input
                              placeholder="Label (e.g. Color)"
                              value={attr.label}
                              onChange={e => {
                                const list = [...newAttributes];
                                list[idx].label = e.target.value;
                                list[idx].key = e.target.value.toLowerCase().replace(/\s+/g, "_");
                                setNewAttributes(list);
                              }}
                              className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                            <select
                              value={attr.type}
                              onChange={e => {
                                const list = [...newAttributes];
                                list[idx].type = e.target.value;
                                setNewAttributes(list);
                              }}
                              className="w-24 rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                            </select>
                            <button
                              onClick={() => setNewAttributes(newAttributes.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-red-500 transition-colors px-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {attr.type === 'select' && (
                            <input
                              placeholder="Options: Red, Blue, Green"
                              value={attr.options?.join(", ")}
                              onChange={e => {
                                const list = [...newAttributes];
                                list[idx].options = e.target.value.split(",").map(s => s.trim());
                                setNewAttributes(list);
                              }}
                              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Attributes Inputs */}
              {!isNewMaterial && materialId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {(() => {
                    const mat = materials.find(m => m._id === materialId);
                    if (!mat?.attributes?.length) return <div className="col-span-2 text-xs text-gray-400 text-center italic">No attributes configured for this material</div>;

                    return mat.attributes.map(attr => (
                      <div key={attr.key}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{attr.label} {attr.required ? '*' : ''}</label>
                        {attr.type === 'select' ? (
                          <select
                            value={itemAttributes[attr.key] || ""}
                            onChange={e => setItemAttributes({ ...itemAttributes, [attr.key]: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          >
                            <option value="">Select...</option>
                            {attr.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={attr.type === 'number' ? 'number' : 'text'}
                            value={itemAttributes[attr.key] || ""}
                            onChange={e => setItemAttributes({ ...itemAttributes, [attr.key]: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Unit</label>
                  <div className="relative">
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                    >
                      <option value="kg">Kg</option>
                      <option value="unit">Unit</option>
                      <option value="m">Meter</option>
                      <option value="bundle">Bundle</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Cost / Unit</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-right"
                  />
                </div>
              </div>
            </div>

            {/* Item Total */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
              <span className="text-sm font-medium text-gray-500">Line Item Total</span>
              <span className="text-xl font-bold text-gray-900">{money(lineTotal)}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-800 mb-6">Payment Summary</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-gray-600">Grand Total</span>
                <span className="font-bold text-gray-900">{money(grandTotal)}</span>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="credit">Credit (Unpaid)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Paid Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-bold text-green-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="font-medium text-gray-900">Balance Due</span>
                <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{money(dueAmount)}</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={savePurchase}
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {saving ? "Processing..." : (
                  <>
                    <Check size={18} /> Confirm Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
