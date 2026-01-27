import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../api/suppliers";
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Suppliers() {
    const nav = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
            setShowForm(false);
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
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName("");
        setPhone("");
        setAddress("");
        setCategory("");
        setShowForm(false);
    };

    return (
        <div className="space-y-5">
            <Toaster position="top-center" />
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Suppliers</h1>
                        <p className="text-sm text-gray-500">Manage your suppliers list</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            + Create New Supplier
                        </button>
                    )}
                </div>
            </div>

            {/* Form Section */}
            {/* Modal Form Overlay */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingId ? "Edit Supplier" : "Create Supplier"}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {editingId ? "Update supplier details below" : "Add a new supplier to your list"}
                                </p>
                            </div>
                            <button
                                onClick={cancelEdit}
                                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Supplier Name</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g. Ali Brothers"
                                />
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                                <input
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g. 0300-1234567"
                                />
                            </div>

                            {/* Address Input */}
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Address</label>
                                <input
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="City, Address..."
                                />
                            </div>

                            {/* Category Input */}
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                                <input
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g. Yarn, Packaging"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                onClick={cancelEdit}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10 disabled:opacity-60 transition-all"
                            >
                                {saving ? "Saving..." : (editingId ? "Update Details" : "Create Supplier")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-16 text-gray-500">S.No</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {suppliers.map((s, index) => (
                                <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 font-medium">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&color=fff&size=40`}
                                                alt={s.name}
                                                className="h-10 w-10 rounded-full object-cover shadow-sm bg-gray-100"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">{s.name}</div>
                                                <div className="text-xs text-gray-400">{s.category || "No Category"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.phone ? (
                                            <span className="text-gray-600 font-medium">{s.phone}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">No Phone</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.address ? (
                                            <span className="text-gray-600">{s.address}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">No Location</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => nav(`/purchases/suppliers/${s._id}/ledger`)}
                                                className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-100 hover:border-green-200"
                                            >
                                                Ledger
                                            </button>
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 hover:border-blue-200"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s._id)}
                                                className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100 hover:border-red-200"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-sm text-gray-500 italic">
                                        No suppliers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
