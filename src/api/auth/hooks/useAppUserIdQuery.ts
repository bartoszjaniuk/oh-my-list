import { supabase } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

const fetchAppUserId = async (): Promise<string> => {
	const { data, error } = await supabase.rpc("current_app_user_id");

	if (error != null) {
		throw new Error(
			error.message ?? "Nie udało się odczytać profilu użytkownika.",
		);
	}

	if (data == null || data === "") {
		throw new Error("Brak profilu użytkownika w aplikacji.");
	}

	return data;
};

export const useAppUserIdQuery = () => {
	return useQuery({
		queryKey: ["auth", "appUserId"],
		queryFn: fetchAppUserId,
		staleTime: 5 * 60 * 1000,
	});
};
