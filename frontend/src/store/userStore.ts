import { create } from "zustand";

interface UserState {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}

// Load user from localStorage (if exists)
const storedUser = localStorage.getItem("user");

export const userStore = create<UserState>((set) => ({
  ...JSON.parse(storedUser || "{}"),
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set(user);
  },
  clearUser: () => {
    localStorage.removeItem("user");
    set({ id: "", email: "", name: "", photoURL: "" });
  },
}));
