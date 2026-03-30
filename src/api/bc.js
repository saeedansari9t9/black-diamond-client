import { api } from "./axios";

export const getBcDashboardInfo = async () => {
    const res = await api.get("/bc/dashboard");
    return res.data;
};

export const getBcMembers = async () => {
    const res = await api.get("/bc/members");
    return res.data;
};

export const createBcMember = async (data) => {
    const res = await api.post("/bc/members", data);
    return res.data;
};

export const updateBcMember = async (id, data) => {
    const res = await api.put(`/bc/members/${id}`, data);
    return res.data;
};

export const deleteBcMember = async (id) => {
    const res = await api.delete(`/bc/members/${id}`);
    return res.data;
};

export const getBcMonthDetails = async (monthNumber) => {
    const res = await api.get(`/bc/months/${monthNumber}`);
    return res.data;
};

export const toggleBcPayment = async (recordId) => {
    const res = await api.put(`/bc/records/${recordId}/toggle`);
    return res.data;
};

export const setBcPayoutWinner = async (monthNumber, winnerId) => {
    const res = await api.put(`/bc/months/${monthNumber}/payout`, { winnerId });
    return res.data;
};

export const updateBcSettings = async (data) => {
    const res = await api.put("/bc/settings", data);
    return res.data;
};
