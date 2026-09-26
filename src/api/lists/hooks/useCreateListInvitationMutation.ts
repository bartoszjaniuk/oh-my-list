import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { createListInvitation } from "../lists";
import type { CreateListInvitationResponse } from "../lists.models";
import { listsKeys } from "../lists.queryKeys";

type Variables = { listId: string };

export const useCreateListInvitationMutation = () => {
	return useMutation({
		mutationFn: ({ listId }: Variables) => createListInvitation(listId),
		onSuccess: (data, variables) => {
			queryClient.setQueryData<CreateListInvitationResponse | null>(
				listsKeys.listInvitation(variables.listId).queryKey,
				data,
			);
		},
	});
};
