import { signOut } from "@/api/auth/auth";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
	const session = useAuthStore((state) => state.session);
	const isLoading = useAuthStore((state) => state.isLoading);
	const user = session?.user ?? null;

	return { session, user, isLoading, signOut };
};
