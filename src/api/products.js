import { api } from "./axios";

export async function fetchProducts(q = "") {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await api.get(`/products${qs}`);
  return res.data.data || [];
}

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
