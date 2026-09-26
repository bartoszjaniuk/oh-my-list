import { useMutation } from "@tanstack/react-query";
import { joinListByInvitation } from "../lists";
import {
	invalidateListDetailsQuery,
	invalidateListInvitationQuery,
	invalidateListItemsQuery,
	invalidateListMembersQuery,
	invalidateListsQuery,
} from "../lists.utils";

export const useJoinListByInvitationMutation = () => {
	return useMutation({
		mutationFn: (code: string) => joinListByInvitation(code),
		onSuccess: (data) => {
			const listId = data.list_id;
			invalidateListsQuery();
			invalidateListDetailsQuery(listId);
			invalidateListMembersQuery(listId);
			invalidateListItemsQuery(listId);
			invalidateListInvitationQuery(listId);
		},
	});
};
