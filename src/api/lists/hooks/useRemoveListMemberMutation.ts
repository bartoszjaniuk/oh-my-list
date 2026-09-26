import { useMutation } from "@tanstack/react-query";
import { removeListMember } from "../lists";
import {
	invalidateListDetailsQuery,
	invalidateListItemsQuery,
	invalidateListMembersQuery,
	invalidateListsQuery,
} from "../lists.utils";

type RemoveListMemberVariables = {
	listId: string;
	userId: string;
};

export const useRemoveListMemberMutation = () => {
	return useMutation({
		mutationFn: ({ listId, userId }: RemoveListMemberVariables) =>
			removeListMember(listId, userId),
		onSuccess: (_void, variables) => {
			invalidateListMembersQuery(variables.listId);
			invalidateListDetailsQuery(variables.listId);
			invalidateListItemsQuery(variables.listId);
			invalidateListsQuery();
		},
	});
};
