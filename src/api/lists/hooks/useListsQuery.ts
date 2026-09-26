import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import type { GetListsParams, ListScope } from "../lists.models";
import { getLists } from "../lists";
import { normalizeGetListsParams } from "../lists.utils";

export const useListsQuery = (
	scope: ListScope,
	params?: Omit<GetListsParams, "scope">,
) => {
	const normalized = normalizeGetListsParams({ ...params, scope });
	return useQuery({
		queryKey: queryKeys.lists.list(normalized).queryKey,
		queryFn: () => getLists(normalized),
	});
};
