import { useQuery } from "@tanstack/react-query";
import { getActiveListInvitation } from "../invitation-queries";
import { listsKeys } from "../lists.queryKeys";

type UseActiveListInvitationQueryArgs = {
	listId: string | undefined;
	enabled: boolean;
};

export const useActiveListInvitationQuery = ({
	listId,
	enabled,
}: UseActiveListInvitationQueryArgs) => {
	return useQuery({
		queryKey: listsKeys.listInvitation(listId ?? "").queryKey,
		queryFn: () => getActiveListInvitation(listId ?? ""),
		enabled:
			typeof listId === "string" && listId.length > 0 && enabled,
	});
};
