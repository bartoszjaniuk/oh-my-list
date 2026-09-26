import { createList } from "../lists";
import { CreateListInput } from "../lists.models";
import { useMutation } from "@tanstack/react-query";
import { invalidateListsQuery } from "../lists.utils";

export const useCreateListMutation = () => {
	return useMutation({
		mutationFn: (input: CreateListInput) => createList(input),
		onSuccess: () => {
			invalidateListsQuery();
		},
	});
};
