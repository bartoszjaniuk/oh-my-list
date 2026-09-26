import { useMutation } from "@tanstack/react-query";
import { bulkCreateListItems } from "../lists";
import { BulkCreateListItemsInput } from "../lists.models";
import { invalidateListDetailsQuery, invalidateListItemsQuery } from "../lists.utils";

type UseBulkCreateListItemsInput = {
	listId: string;
	input: BulkCreateListItemsInput;
};

export const useBulkCreateListItemsMutation = () => {
	return useMutation({
		mutationFn: ({ listId, input }: UseBulkCreateListItemsInput) =>
			bulkCreateListItems(listId, input),
		onSuccess: (_, variables) => {
			invalidateListItemsQuery(variables.listId);
			invalidateListDetailsQuery(variables.listId);
		},
	});
};
