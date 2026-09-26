import { queryClient } from "@/lib/query-client";
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "./lists.consts";
import type { GetListsParams, ListScope } from "./lists.models";
import { listsKeys } from "./lists.queryKeys";

/** Pełne parametry GET /lists pod cache React Query i fetch (zawsze jawny `scope`). */
export type NormalizedGetListsParams = {
	limit: number;
	offset: number;
	scope: ListScope;
};

export const normalizeGetListsParams = (
	params?: GetListsParams,
): NormalizedGetListsParams => ({
	limit: params?.limit ?? DEFAULT_LIMIT,
	offset: params?.offset ?? DEFAULT_OFFSET,
	scope: params?.scope ?? "owned",
});

export const invalidateListsQuery = () => {
	queryClient.invalidateQueries({ queryKey: listsKeys.list._def });
};

export const invalidateListDetailsQuery = (listId: string) => {
	queryClient.invalidateQueries({
		queryKey: listsKeys.listDetails(listId).queryKey,
	});
};

export const invalidateListItemsQuery = (listId: string) => {
	queryClient.invalidateQueries({
		queryKey: listsKeys.listItems(listId).queryKey,
	});
};

export const invalidateListMembersQuery = (listId: string) => {
	queryClient.invalidateQueries({
		queryKey: listsKeys.listMembers(listId).queryKey,
	});
};

export const invalidateListInvitationQuery = (listId: string) => {
	queryClient.invalidateQueries({
		queryKey: listsKeys.listInvitation(listId).queryKey,
	});
};
