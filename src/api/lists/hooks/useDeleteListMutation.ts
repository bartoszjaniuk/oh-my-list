import { queryKeys } from "@/api/queryKeys";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { deleteList } from "../lists";
import { GetListsParams, GetListsResponse } from "../lists.models";
import {
	invalidateListDetailsQuery,
	invalidateListItemsQuery,
	invalidateListsQuery,
	normalizeGetListsParams,
} from "../lists.utils";

type UseDeleteListInput = {
	listId: string;
};

type MutationContext = {
	previousLists?: GetListsResponse;
};

export const useDeleteListMutation = (listsQueryParams?: GetListsParams) => {
	const normalizedListsParams = normalizeGetListsParams(listsQueryParams);

	return useMutation({
		mutationFn: ({ listId }: UseDeleteListInput) => deleteList(listId),
		onMutate: async (variables): Promise<MutationContext> => {
			const listsQueryKey = queryKeys.lists.list(
				normalizedListsParams,
			).queryKey;

			await queryClient.cancelQueries({
				queryKey: listsQueryKey,
			});

			const previousLists =
				queryClient.getQueryData<GetListsResponse>(listsQueryKey);

			queryClient.setQueryData<GetListsResponse>(listsQueryKey, (current) => {
				if (!current?.data) {
					return current;
				}

				return {
					...current,
					data: current.data.filter((list) => list.id !== variables.listId),
					total: Math.max(0, current.total - 1),
				};
			});

			return { previousLists };
		},
		onError: (_, __, context) => {
			if (!context?.previousLists) {
				return;
			}

			queryClient.setQueryData(
				queryKeys.lists.list(normalizedListsParams).queryKey,
				context.previousLists,
			);
		},
		onSettled: (_, __, variables) => {
			invalidateListsQuery();
			invalidateListDetailsQuery(variables.listId);
			invalidateListItemsQuery(variables.listId);
		},
	});
};
