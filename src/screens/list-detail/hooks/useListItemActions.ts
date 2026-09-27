import { useBulkCreateListItemsMutation } from "@/api/lists/hooks/useBulkCreateListItemsMutation";
import { usePatchListItemCheckMutation } from "@/api/lists/hooks/usePatchListItemCheckMutation";
import type { ListItem } from "@/api/lists/lists.models";
import { useMemo, useState } from "react";
import { parseDraftItems } from "../helpers/list-items.helpers";

type UseListItemActionsArgs = {
	listId?: string;
	refetchList: () => Promise<unknown>;
	refetchItems: () => Promise<unknown>;
	onBulkCreateSuccess: () => void;
};

export function useListItemActions({
	listId,
	refetchList,
	refetchItems,
	onBulkCreateSuccess,
}: UseListItemActionsArgs) {
	const [draftItems, setDraftItems] = useState("");
	const [isPullRefreshing, setIsPullRefreshing] = useState(false);

	const bulkCreateItemsMutation = useBulkCreateListItemsMutation();
	const patchListItemCheckMutation = usePatchListItemCheckMutation();

	const parsedDraftItems = useMemo(
		() => parseDraftItems(draftItems),
		[draftItems],
	);

	const canSubmitDraftItems =
		parsedDraftItems.length > 0 && !bulkCreateItemsMutation.isPending;
	const patchingItemId = patchListItemCheckMutation.variables?.itemId;
	const bulkCreateErrorMessage =
		bulkCreateItemsMutation.error instanceof Error
			? bulkCreateItemsMutation.error.message
			: null;
	const patchCheckErrorMessage =
		patchListItemCheckMutation.error instanceof Error
			? patchListItemCheckMutation.error.message
			: null;

	const handleDraftItemsChange = (value: string) => {
		if (bulkCreateItemsMutation.error) {
			bulkCreateItemsMutation.reset();
		}
		setDraftItems(value);
	};

	const handleSubmitDraftItems = () => {
		if (!listId || !canSubmitDraftItems) {
			return;
		}

		bulkCreateItemsMutation.mutate(
			{
				listId,
				input: {
					items: parsedDraftItems,
				},
			},
			{
				onSuccess: () => {
					setDraftItems("");
					onBulkCreateSuccess();
				},
			},
		);
	};

	const handleToggleItemCheck = (item: ListItem, checked: boolean) => {
		if (!listId) {
			return;
		}

		const isThisItemPending =
			patchListItemCheckMutation.isPending && patchingItemId === item.id;
		if (isThisItemPending || item.is_checked === checked) {
			return;
		}

		if (patchListItemCheckMutation.error) {
			patchListItemCheckMutation.reset();
		}

		patchListItemCheckMutation.mutate({
			listId,
			itemId: item.id,
			input: {
				is_checked: checked,
			},
		});
	};

	const handleRefresh = () => {
		setIsPullRefreshing(true);
		void Promise.all([refetchList(), refetchItems()]).finally(() => {
			setIsPullRefreshing(false);
		});
	};

	return {
		draftItems,
		isPullRefreshing,
		bulkCreateItemsMutation,
		patchListItemCheckMutation,
		canSubmitDraftItems,
		patchingItemId,
		bulkCreateErrorMessage,
		patchCheckErrorMessage,
		handleDraftItemsChange,
		handleSubmitDraftItems,
		handleToggleItemCheck,
		handleRefresh,
	};
}
