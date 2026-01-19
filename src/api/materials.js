import { api } from "./axios";

export const fetchMaterials = async () => {
    const res = await api.get("/materials");
    return res.data.data || [];
};

export const createMaterial = async (data) => {
    const res = await api.post("/materials", data);
    return res.data;
};
