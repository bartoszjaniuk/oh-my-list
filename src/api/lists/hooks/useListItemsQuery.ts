import { useQuery } from "@tanstack/react-query";
import { getListItems } from "../lists";
import { queryKeys } from "@/api/queryKeys";

export const useListItemsQuery = (listId?: string) => {
	return useQuery({
		queryKey: queryKeys.lists.listItems(listId ?? "").queryKey,
		queryFn: () => getListItems(listId ?? ""),
		enabled: typeof listId === "string" && listId.length > 0,
	});
};
