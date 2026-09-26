import { useQuery } from "@tanstack/react-query";
import { getListMembers } from "../lists";
import { listsKeys } from "../lists.queryKeys";

export const useListMembersQuery = (listId?: string, enabled = true) => {
	return useQuery({
		queryKey: listsKeys.listMembers(listId ?? "").queryKey,
		queryFn: () => getListMembers(listId ?? ""),
		enabled: typeof listId === "string" && listId.length > 0 && enabled,
	});
};
