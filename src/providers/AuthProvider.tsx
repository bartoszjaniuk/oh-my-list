import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/utils/supabase/client";
import { PropsWithChildren, useEffect } from "react";

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const setSession = useAuthStore((state) => state.setSession);
	const setLoading = useAuthStore((state) => state.setLoading);

	useEffect(() => {
		let isMounted = true;

		const initializeSession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (error) {
				console.error("Failed to restore session:", error.message);
			}

			if (!isMounted) return;
			setSession(data.session ?? null);
			setLoading(false);
		};

		void initializeSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession ?? null);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, [setLoading, setSession]);

	return children;
};
