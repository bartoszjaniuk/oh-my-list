import { useQuery } from "@tanstack/react-query";
import { getListDetails } from "../lists";
import { queryKeys } from "@/api/queryKeys";

export const useListDetailsQuery = (listId?: string) => {
	return useQuery({
		queryKey: queryKeys.lists.listDetails(listId ?? "").queryKey,
		queryFn: () => getListDetails(listId ?? ""),
		enabled: typeof listId === "string" && listId.length > 0,
	});
};
