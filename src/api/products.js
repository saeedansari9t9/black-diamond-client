import { api } from "./axios";

export async function fetchProducts(q = "") {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await api.get(`/products${qs}`);
  return res.data.data || [];
}
