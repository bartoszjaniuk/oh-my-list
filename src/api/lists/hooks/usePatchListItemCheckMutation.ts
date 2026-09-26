import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchListItemCheck } from "../lists";
import {
	GetListItemsResponse,
	ListItem,
	PatchListItemCheckInput,
} from "../lists.models";
import { queryKeys } from "@/api/queryKeys";
import { invalidateListDetailsQuery, invalidateListItemsQuery } from "../lists.utils";

type UsePatchListItemCheckInput = {
	listId: string;
	itemId: string;
	input: PatchListItemCheckInput;
};

type MutationContext = {
	previousItems?: GetListItemsResponse;
};

export const usePatchListItemCheckMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ listId, itemId, input }: UsePatchListItemCheckInput) =>
			patchListItemCheck(listId, itemId, input),
		onMutate: async (variables): Promise<MutationContext> => {
			const listItemsQueryKey = queryKeys.lists.listItems(variables.listId).queryKey;

			await queryClient.cancelQueries({
				queryKey: listItemsQueryKey,
			});

			const previousItems = queryClient.getQueryData<GetListItemsResponse>(
				listItemsQueryKey,
			);

			queryClient.setQueryData<GetListItemsResponse>(
				listItemsQueryKey,
				(current) => {
					if (!current?.data) {
						return current;
					}

					const nextData = current.data.map((item) => {
						if (item.id !== variables.itemId) {
							return item;
						}

						const nextItem: ListItem = {
							...item,
							is_checked: variables.input.is_checked,
						};
						return nextItem;
					});

					return { ...current, data: nextData };
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
		onSuccess: (updatedItem, variables) => {
			const listItemsQueryKey = queryKeys.lists.listItems(variables.listId).queryKey;

			queryClient.setQueryData<GetListItemsResponse>(
				listItemsQueryKey,
				(current) => {
					if (!current?.data) {
						return current;
					}

					return {
						...current,
						data: current.data.map((item) =>
							item.id === updatedItem.id ? updatedItem : item,
						),
					};
				},
			);
		},
		onSettled: (_, __, variables) => {
			invalidateListItemsQuery(variables.listId);
			invalidateListDetailsQuery(variables.listId);
		},
	});
};
