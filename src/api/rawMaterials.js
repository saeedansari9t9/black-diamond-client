import { api } from "./axios";

export const fetchRawMaterials = async () => {
    const res = await api.get("/raw-materials");
    return res.data.data || [];
};

export const createRawMaterial = async (data) => {
    const res = await api.post("/raw-materials", data);
    return res.data;
};

export const updateRawMaterial = async (id, data) => {
    const res = await api.put(`/raw-materials/${id}`, data);
    return res.data;
};

export const deleteRawMaterial = async (id) => {
    const res = await api.delete(`/raw-materials/${id}`);
    return res.data;
};
