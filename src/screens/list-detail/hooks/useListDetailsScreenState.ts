import { useListDetailsQuery } from "@/api/lists/hooks/useListDetailsQuery";
import { useListDetailsRealtime } from "@/api/lists/hooks/useListDetailsRealtime";
import { useListItemsQuery } from "@/api/lists/hooks/useListItemsQuery";
import { useCallback, useMemo } from "react";
import {
	groupItemsByCategory,
	type ItemSection,
} from "../helpers/list-items.helpers";

export function useListDetailsScreenState(listId?: string) {
	const detailsQuery = useListDetailsQuery(listId);
	const itemsQuery = useListItemsQuery(listId);

	useListDetailsRealtime(listId);

	const itemSections = useMemo<ItemSection[]>(
		() => groupItemsByCategory(itemsQuery.data?.data ?? []),
		[itemsQuery.data?.data],
	);

	const checkedItemsCount = useMemo(
		() =>
			(itemsQuery.data?.data ?? []).filter((item) => item.is_checked).length,
		[itemsQuery.data?.data],
	);

	const refetchDetails = detailsQuery.refetch;
	const refetchItems = itemsQuery.refetch;

	const refetch = useCallback(async () => {
		await Promise.all([refetchDetails(), refetchItems()]);
	}, [refetchDetails, refetchItems]);

	return {
		list: detailsQuery.data,
		isLoading: detailsQuery.isLoading,
		isError: detailsQuery.isError,
		error: detailsQuery.error,
		refetch,
		refetchDetails,
		refetchItems,
		itemsQuery,
		itemSections,
		checkedItemsCount,
	};
}
