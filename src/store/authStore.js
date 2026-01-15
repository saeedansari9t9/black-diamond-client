import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("bd_token") || null,
  user: JSON.parse(localStorage.getItem("bd_user") || "null"),

  setAuth: ({ token, user }) => {
    localStorage.setItem("bd_token", token);
    localStorage.setItem("bd_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("bd_token");
    localStorage.removeItem("bd_user");
    set({ token: null, user: null });
  },
}));
