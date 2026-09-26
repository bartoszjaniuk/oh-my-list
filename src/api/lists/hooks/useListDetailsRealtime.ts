import { supabase } from "@/utils/supabase/client";
import { useEffect } from "react";
import {
	invalidateListDetailsQuery,
	invalidateListInvitationQuery,
	invalidateListItemsQuery,
	invalidateListMembersQuery,
	invalidateListsQuery,
} from "../lists.utils";

export const useListDetailsRealtime = (listId?: string) => {
	useEffect(() => {
		if (typeof listId !== "string" || listId.length === 0) return;

		const channel = supabase
			.channel(`list-details:${listId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "lists",
					filter: `id=eq.${listId}`,
				},
				() => {
					invalidateListDetailsQuery(listId);
					invalidateListItemsQuery(listId);
					invalidateListsQuery();
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "list_members",
					filter: `list_id=eq.${listId}`,
				},
				() => {
					invalidateListDetailsQuery(listId);
					invalidateListItemsQuery(listId);
					invalidateListMembersQuery(listId);
					invalidateListsQuery();
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "list_items",
					filter: `list_id=eq.${listId}`,
				},
				() => {
					invalidateListDetailsQuery(listId);
					invalidateListItemsQuery(listId);
					invalidateListsQuery();
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "invitations",
					filter: `list_id=eq.${listId}`,
				},
				() => {
					invalidateListInvitationQuery(listId);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [listId]);
};
