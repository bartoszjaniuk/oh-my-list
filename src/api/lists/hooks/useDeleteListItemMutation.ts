import { queryKeys } from "@/api/queryKeys";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { deleteListItem } from "../lists";
import { GetListItemsResponse } from "../lists.models";
import {
	invalidateListDetailsQuery,
	invalidateListItemsQuery,
} from "../lists.utils";

type UseDeleteListItemInput = {
	listId: string;
	itemId: string;
};

type MutationContext = {
	previousItems?: GetListItemsResponse;
};

export const useDeleteListItemMutation = () => {
	return useMutation({
		mutationFn: ({ listId, itemId }: UseDeleteListItemInput) =>
			deleteListItem(listId, itemId),
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
						data: current.data.filter((item) => item.id !== variables.itemId),
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
