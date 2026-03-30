import React, { useState, useEffect } from "react";
import { getBcDashboardInfo, getBcMembers, createBcMember, deleteBcMember, getBcMonthDetails, toggleBcPayment, setBcPayoutWinner, updateBcSettings } from "../../api/bc";
import { toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Trash2, Plus, Trophy, DollarSign, Users, Settings } from "lucide-react";

export default function BoardCommittee() {
    // Component states
    const [dashboard, setDashboard] = useState({ totalMembers: 0, totalPot: 0, monthlyContribution: 5000, totalMonths: 0 });
    const [monthSelected, setMonthSelected] = useState(1);
    const [monthState, setMonthState] = useState(null);
    const [records, setRecords] = useState([]);
    const [collectedAmount, setCollectedAmount] = useState(0);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMembers, setNewMembers] = useState([""]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newContribution, setNewContribution] = useState(5000);

    // Initial Load
    useEffect(() => {
        loadDashboard();
        loadMembers();
    }, []);

    // Load Month Data on Month Change
    useEffect(() => {
        if (dashboard.totalMembers > 0 && monthSelected > dashboard.totalMembers) {
             setMonthSelected(1);
        } else {
             loadMonthData(monthSelected);
        }
    }, [monthSelected, dashboard.totalMembers]);

    const loadDashboard = async () => {
        try {
            const data = await getBcDashboardInfo();
            setDashboard(data);
            setNewContribution(data.monthlyContribution);
        } catch (error) {
            console.error("Dashboard error", error);
        }
    };

    const loadMembers = async () => {
        try {
            const data = await getBcMembers();
            setMembers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMonthData = async (month) => {
        setLoading(true);
        try {
            const data = await getBcMonthDetails(month);
            setMonthState(data.monthState);
            setRecords(data.records);
            setCollectedAmount(data.collectedAmount);
        } catch (error) {
            console.error("Failed to load month data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            await updateBcSettings({ monthlyContribution: Number(newContribution) });
            toast.success("BC Settings updated successfully");
            setIsSettingsOpen(false);
            loadDashboard();
            loadMonthData(monthSelected);
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const validNames = newMembers.filter(n => n.trim() !== "");
            if (validNames.length === 0) {
                 toast.error("Please enter at least one name");
                 return;
            }
            await createBcMember({ names: validNames });
            toast.success("Members added successfully");
            setIsAddModalOpen(false);
            setNewMembers([""]);
            // wait for backend to sync
            await loadDashboard();
            await loadMembers();
            await loadMonthData(monthSelected);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding member");
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm("Are you sure? This deletes all their records and removes a month from the BC.")) return;
        try {
            await deleteBcMember(id);
            toast.success("Member deleted");
            await loadDashboard();
            await loadMembers();
            if (monthSelected > members.length - 1 && members.length - 1 > 0) {
               setMonthSelected(members.length - 1 || 1);
            } else {
               await loadMonthData(monthSelected);
            }
        } catch (error) {
            toast.error("Error deleting member");
        }
    };

    const handleTogglePayment = async (recordId) => {
        try {
            const updated = await toggleBcPayment(recordId);
            setRecords(records.map(r => r._id === recordId ? updated : r));
            
            const isNowPaid = updated.hasPaid;
            setCollectedAmount(prev => isNowPaid ? prev + updated.amount : prev - updated.amount);
            
            toast.success(`Payment marked as ${updated.hasPaid ? "Paid" : "Unpaid"}`);
        } catch (error) {
            toast.error("Failed to update payment");
        }
    };

    const handleSetWinner = async (memberId) => {
        if (memberId && !window.confirm("Set this member as the winner for this month?")) return;
        try {
            const updatedMonth = await setBcPayoutWinner(monthSelected, memberId);
            setMonthState(updatedMonth);
            await loadDashboard(); // refresh winner locks
            toast.success("Winner updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to set winner");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BC Management</h1>
                   <p className="text-gray-500 text-sm mt-1">Dynamic Pot Size & Members</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                        <Settings size={18} /> Configure BC
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus size={18} /> Add Member
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold mb-2">
                        <Users size={20} /> Total Members
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboard.totalMembers}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total duration: {dashboard.totalMembers || 0} months</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 font-semibold mb-2">
                        <DollarSign size={20} /> Monthly Amount
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Rs {dashboard.monthlyContribution?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Per member share</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-semibold mb-2">
                        <Trophy size={20} /> Total Monthly Pot
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Rs {dashboard.totalPot?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid to 1 winner each month</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-semibold mb-2">
                        <CheckCircle2 size={20} /> Month {monthSelected} Status
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Rs {collectedAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Collected actively</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Month Selector Sidebar (Left) */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 h-fit max-h-[600px] overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Month</h2>
                    {dashboard.totalMembers === 0 ? (
                        <p className="text-sm text-gray-500">Add members to start BC months.</p>
                    ) : (
                        <div className="grid grid-cols-5 lg:grid-cols-2 gap-2">
                            {Array.from({ length: dashboard.totalMembers }, (_, i) => i + 1).map(month => (
                                <button
                                    key={month}
                                    onClick={() => setMonthSelected(month)}
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${monthSelected === month 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'}`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tracking Table (Right) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Month: {monthSelected}</h2>
                        
                        {/* Winner info or Selection */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {monthState?.isCompleted ? (
                                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 pl-4 pr-2 py-1.5 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                                    <Trophy size={16} /> Winner: {monthState.winner?.name}
                                    <button 
                                        onClick={() => handleSetWinner("")} 
                                        className="ml-2 hover:bg-green-200 dark:hover:bg-green-800 p-1 rounded-md transition-colors text-green-700 dark:text-green-400"
                                        title="Clear Winner"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ) : (
                                <select 
                                    onChange={(e) => {
                                        handleSetWinner(e.target.value);
                                        e.target.value = ""; // reset
                                    }}
                                    className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    defaultValue=""
                                    disabled={dashboard.totalMembers === 0}
                                >
                                    <option value="" disabled>Select Pot Winner...</option>
                                    {members.map(m => {
                                        const hasWon = dashboard.winnersIds?.includes(m._id) && monthState?.winner?._id !== m._id;
                                        return (
                                            <option key={m._id} value={m._id} disabled={hasWon}>
                                                {m.name} {hasWon ? "(Already Won)" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-500 block">Loading month data...</div>
                    ) : dashboard.totalMembers === 0 ? (
                        <div className="text-center py-10 px-4 text-gray-500 block">
                            No active BC members. Please add members to start organizing.
                        </div>
                    ) : (
                        <div className="overflow-x-auto block">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-400 rounded-t-lg">
                                    <tr>
                                        <th className="px-6 py-3">Member Name</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">Generating records...</td>
                                        </tr>
                                    ) : records.map((record) => (
                                        <tr key={record._id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex flex-row items-center justify-between">
                                                <span>{record.member?.name || "Unknown"}</span>
                                                <button onClick={() => handleDeleteMember(record.member?._id)} className="text-red-400 hover:text-red-600 block sm:ml-2" title="Delete Member">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">Rs {record.amount?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                {record.hasPaid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                        <CheckCircle2 size={14} /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                                        <XCircle size={14} /> Unpaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleTogglePayment(record._id)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${record.hasPaid ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                >
                                                    {record.hasPaid ? 'Mark Unpaid' : 'Mark Paid'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl block relative max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Members</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="space-y-3">
                                {newMembers.map((name, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder={`Member ${index + 1} Name`}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={name}
                                            onChange={(e) => {
                                                const updated = [...newMembers];
                                                updated[index] = e.target.value;
                                                setNewMembers(updated);
                                            }}
                                        />
                                        {newMembers.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => setNewMembers(newMembers.filter((_, i) => i !== index))} 
                                                className="text-red-400 hover:text-red-600 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                type="button" 
                                onClick={() => setNewMembers([...newMembers, ""])} 
                                className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 flex items-center gap-1 hover:underline"
                            >
                                <Plus size={16} /> Add More
                            </button>

                            <div className="flex flex-row gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Members</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl block relative">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Configure BC Settings</h3>
                        <form onSubmit={handleUpdateSettings} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution per Member (Rs)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="1"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={newContribution}
                                    onChange={(e) => setNewContribution(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">This applies equally to all members and updates any unpaid records dynamically.</p>
                            <div className="flex flex-row gap-3 pt-4">
                                <button type="button" onClick={() => setIsSettingsOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Update Amount</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
