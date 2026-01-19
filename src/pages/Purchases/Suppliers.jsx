import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../api/suppliers";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [category, setCategory] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getSuppliers();
            setSuppliers(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Name is required");
        if (!category.trim()) return toast.error("Category is required");
        setSaving(true);

        try {
            const payload = {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                category: category.trim()
            };

            if (editingId) {
                await updateSupplier(editingId, payload);
                toast.success("Supplier updated successfully!");
            } else {
                await createSupplier(payload);
                toast.success("Supplier added successfully!");
            }
            // Reset Form
            setName("");
            setPhone("");
            setAddress("");
            setCategory("");
            setEditingId(null);
            load();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteSupplier(id);
                toast.success("Supplier deleted successfully.");
                load();
            } catch (error) {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const openEdit = (s) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setName(s.name);
        setPhone(s.phone || "");
        setAddress(s.address || "");
        setCategory(s.category || "");
        setEditingId(s._id);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName("");
        setPhone("");
        setAddress("");
        setCategory("");
    };

    return (
        <div className="space-y-5">
            <Toaster position="top-center" />
            <div>
                <h1 className="text-xl font-bold">Suppliers</h1>
                <p className="text-sm text-gray-500">Manage your suppliers list</p>
            </div>

            {/* Form Section */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                    {/* Name Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Supplier Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="e.g. Ali Brothers"
                        />
                    </div>
                    {/* Category Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Category</label>
                        <input
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="e.g. Yarn, Packaging"
                        />
                    </div>
                    {/* Phone Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Phone</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="e.g. 0300-1234567"
                        />
                    </div>
                    {/* Address Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Address</label>
                        <input
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            placeholder="City, Address..."
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    {editingId && (
                        <button
                            onClick={cancelEdit}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel Edit
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                    >
                        {saving ? "Saving..." : (editingId ? "Update Supplier" : "Add Supplier")}
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="rounded-2xl border bg-white shadow-sm">
                <div className="border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">Suppliers List</div>
                <div className="divide-y">
                    {suppliers.map((s) => (
                        <div key={s._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 hover:bg-gray-50">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold">{s.name}</div>
                                    {s.category && (
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-100 uppercase tracking-wide">
                                            {s.category}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex gap-4 text-xs text-gray-500">
                                    {s.phone && <span>📞 {s.phone}</span>}
                                    {s.address && <span>📍 {s.address}</span>}
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 mt-2 sm:mt-0 flex gap-2 self-end sm:self-center">
                                <button
                                    onClick={() => openEdit(s)}
                                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(s._id)}
                                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && suppliers.length === 0 && (
                        <div className="p-6 text-center text-sm text-gray-500">No suppliers found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
