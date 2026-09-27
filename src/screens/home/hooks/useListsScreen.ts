import { useListsQuery } from "@/api/lists/hooks/useListsQuery";
import { useListsRealtime } from "@/api/lists/hooks/useListsRealtime";
import type { ListScope } from "@/api/lists/lists.models";
import { router } from "expo-router";
import { useCallback, useState } from "react";

export function useListsScreen() {
	const [segment, setSegment] = useState<ListScope>("owned");

	const { data, isLoading, isFetching, isError, error, refetch } =
		useListsQuery(segment);

	useListsRealtime();

	const lists = data?.data ?? [];
	const isRefreshing = isFetching && !isLoading;

	const onOpenList = useCallback((listId: string) => {
		router.push(`/list/${listId}`);
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
