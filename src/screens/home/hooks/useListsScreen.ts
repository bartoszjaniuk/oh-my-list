import { useListsQuery } from "@/api/lists/hooks/useListsQuery";
import { useListsRealtime } from "@/api/lists/hooks/useListsRealtime";
import type { ListScope } from "@/api/lists/lists.models";
import { useCallback, useState } from "react";

export function useListsScreen() {
	const [segment, setSegment] = useState<ListScope>("owned");

	const { data, isLoading, isFetching, isError, error, refetch } =
		useListsQuery(segment);

	useListsRealtime();

	const lists = data?.data ?? [];
	const isRefreshing = isFetching && !isLoading;

	const onOpenList = useCallback((_listId: string) => {
		// List details are out of scope for this slice.
	}, []);

	return {
		segment,
		setSegment,
		lists,
		isLoading,
		isFetching,
		isRefreshing,
		isError,
		error,
		refetch,
		onOpenList,
	};
}
