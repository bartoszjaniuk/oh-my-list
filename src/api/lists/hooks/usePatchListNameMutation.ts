import { useMutation } from "@tanstack/react-query";
import { patchListName } from "../lists";
import { PatchListNameInput } from "../lists.models";
import {
	invalidateListDetailsQuery,
	invalidateListsQuery,
} from "../lists.utils";

type PatchListNameVariables = {
	listId: string;
	input: PatchListNameInput;
};

export const usePatchListNameMutation = () => {
	return useMutation({
		mutationFn: ({ listId, input }: PatchListNameVariables) =>
			patchListName(listId, input),
		onSuccess: (_data, variables) => {
			invalidateListDetailsQuery(variables.listId);
			invalidateListsQuery();
		},
	});
};
