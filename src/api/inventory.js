import { api } from "./axios";

export const fetchStock = async (params) => {
    const q = new URLSearchParams(params).toString();
    const res = await api.get(`/inventory/stock?${q}`);
    return res.data.data;
};

export const adjustStock = async (payload) => {
    const res = await api.post("/inventory/ledger", payload);
    return res.data.data;
};
