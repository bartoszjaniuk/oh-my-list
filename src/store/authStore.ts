import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthStore = {
	session: Session | null;
	isLoading: boolean;
	setSession: (session: Session | null) => void;
	setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
	session: null,
	isLoading: true,
	setSession: (session) => set({ session }),
	setLoading: (isLoading) => set({ isLoading }),
}));
