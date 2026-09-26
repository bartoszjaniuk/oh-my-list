import { queryKeys } from "@/api/queryKeys";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { deleteCompletedListItems } from "../lists";
import { GetListItemsResponse } from "../lists.models";
import {
	invalidateListDetailsQuery,
	invalidateListItemsQuery,
} from "../lists.utils";

type UseDeleteCompletedListItemsInput = {
	listId: string;
};

type MutationContext = {
	previousItems?: GetListItemsResponse;
};

export const useDeleteCompletedListItemsMutation = () => {
	return useMutation({
		mutationFn: ({ listId }: UseDeleteCompletedListItemsInput) =>
			deleteCompletedListItems(listId),
		onMutate: async (variables): Promise<MutationContext> => {
			const listItemsQueryKey = queryKeys.lists.listItems(
				variables.listId,
			).queryKey;

			await queryClient.cancelQueries({
				queryKey: listItemsQueryKey,
			});

			const previousItems =
				queryClient.getQueryData<GetListItemsResponse>(listItemsQueryKey);

			queryClient.setQueryData<GetListItemsResponse>(
				listItemsQueryKey,
				(current) => {
					if (!current?.data) {
						return current;
					}

					return {
						...current,
						data: current.data.filter((item) => !item.is_checked),
					};
				},
			);

			return { previousItems };
		},
		onError: (_, variables, context) => {
			if (!context?.previousItems) {
				return;
			}

			queryClient.setQueryData(
				queryKeys.lists.listItems(variables.listId).queryKey,
				context.previousItems,
			);
		},
		onSettled: (_, __, variables) => {
			invalidateListItemsQuery(variables.listId);
			invalidateListDetailsQuery(variables.listId);
		},
	});
};
