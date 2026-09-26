import { supabase } from "@/utils/supabase/client";
import { buildInviteLink } from "./lists.consts";
import type { CreateListInvitationResponse } from "./lists.models";

/**
 * Odczyt bieżącego, niewykorzystanego, nieważonego i niewygasłego zaproszenia (RLS: członek listy).
 * Dzięki temu ekran udostępniania nie musi odpalać `POST` przy każdym otwarciu (rate limit 10 min).
 */
export const getActiveListInvitation = async (
	listId: string,
): Promise<CreateListInvitationResponse | null> => {
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from("invitations")
		.select("id, list_id, code, expires_at, created_at")
		.eq("list_id", listId)
		.is("used_at", null)
		.is("revoked_at", null)
		.gt("expires_at", now)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	if (!data) {
		return null;
	}

	return {
		id: data.id,
		list_id: data.list_id,
		code: data.code,
		invite_link: buildInviteLink(data.code),
		expires_at: data.expires_at,
		created_at: data.created_at,
	};
};
