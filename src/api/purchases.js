import { api } from "./axios";

export const fetchPurchases = async (params) => {
    const q = new URLSearchParams(params).toString();
    const res = await api.get(`/purchases?${q}`);
    return res.data.data;
};

export const fetchPurchaseById = async (id) => {
    const res = await api.get(`/purchases/${id}`);
    return res.data.data;
};

export const createPurchase = async (payload) => {
    const res = await api.post("/purchases", payload);
    return res.data.data;
};
