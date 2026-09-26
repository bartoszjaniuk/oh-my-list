import { useAuth } from "@/api/auth/hooks/useAuth";
import { supabase } from "@/utils/supabase/client";
import { useEffect } from "react";
import { invalidateListsQuery } from "../lists.utils";

/** Postgres Changes dla `lists` / `list_members` / `list_items` — odświeża owned i shared (`invalidateListsQuery`). */
export const useListsRealtime = () => {
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		const channel = supabase
			.channel(`lists-screen:${user.id}`)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "lists" },
				() => {
					invalidateListsQuery();
				},
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "list_members" },
				() => {
					invalidateListsQuery();
				},
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "list_items" },
				() => {
					invalidateListsQuery();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user]);
};
