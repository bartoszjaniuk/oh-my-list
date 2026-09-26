import { supabase } from "@/utils/supabase/client";

export const getAccessToken = async () => {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error != null) {
		throw new Error("Nie udało się odczytać sesji użytkownika.");
	}

	const token = session?.access_token;
	if (!token) {
		throw new Error("Brak aktywnej sesji użytkownika.");
	}

	return token;
};
