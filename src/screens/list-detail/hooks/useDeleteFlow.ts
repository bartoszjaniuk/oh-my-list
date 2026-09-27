import { useDeleteCompletedListItemsMutation } from "@/api/lists/hooks/useDeleteCompletedListItemsMutation";
import { useDeleteListItemMutation } from "@/api/lists/hooks/useDeleteListItemMutation";
import type { ListItem } from "@/api/lists/lists.models";
import { useEffect, useState } from "react";
import type { DeleteIntent } from "../helpers/list-items.helpers";

type UseDeleteFlowArgs = {
	listId?: string;
	selectedItem: ListItem | null;
	checkedItemsCount: number;
	onCloseItemDetails: () => void;
	onClearSelectedItem: () => void;
};

export function useDeleteFlow({
	listId,
	selectedItem,
	checkedItemsCount,
	onCloseItemDetails,
	onClearSelectedItem,
}: UseDeleteFlowArgs) {
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);
	const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<
		string | null
	>(null);

	const deleteListItemMutation = useDeleteListItemMutation();
	const deleteCompletedItemsMutation = useDeleteCompletedListItemsMutation();

	const isAnyDeletePending =
		deleteListItemMutation.isPending || deleteCompletedItemsMutation.isPending;
	const deleteItemErrorMessage =
		deleteListItemMutation.error instanceof Error
			? deleteListItemMutation.error.message
			: null;
	const deleteCompletedErrorMessage =
		deleteCompletedItemsMutation.error instanceof Error
			? deleteCompletedItemsMutation.error.message
			: null;

	useEffect(() => {
		if (!deleteSuccessMessage) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setDeleteSuccessMessage(null);
		}, 3200);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [deleteSuccessMessage]);

	const resetDeleteErrors = () => {
		if (deleteListItemMutation.error) {
			deleteListItemMutation.reset();
		}
		if (deleteCompletedItemsMutation.error) {
			deleteCompletedItemsMutation.reset();
		}
	};

	const handleOpenSingleDeleteConfirm = (item: ListItem) => {
		if (isAnyDeletePending) {
			return;
		}
		resetDeleteErrors();
		setDeleteSuccessMessage(null);
		setDeleteIntent({
			type: "single",
			item,
		});
		setIsDeleteConfirmOpen(true);
	};

	const handleOpenDeleteCompletedConfirm = () => {
		if (isAnyDeletePending || checkedItemsCount === 0) {
			return;
		}
		resetDeleteErrors();
		setDeleteSuccessMessage(null);
		setDeleteIntent({
			type: "completed",
			checkedCount: checkedItemsCount,
		});
		setIsDeleteConfirmOpen(true);
	};

	const handleCloseDeleteConfirm = () => {
		if (isAnyDeletePending) {
			return;
		}
		setIsDeleteConfirmOpen(false);
		setDeleteIntent(null);
	};

	const handleConfirmDelete = () => {
		if (!listId || !deleteIntent || isAnyDeletePending) {
			return;
		}

		if (deleteIntent.type === "single") {
			deleteListItemMutation.mutate(
				{
					listId,
					itemId: deleteIntent.item.id,
				},
				{
					onSuccess: () => {
						setIsDeleteConfirmOpen(false);
						setDeleteIntent(null);
						setDeleteSuccessMessage("Element został usunięty.");
						if (selectedItem?.id === deleteIntent.item.id) {
							onClearSelectedItem();
							onCloseItemDetails();
						}
					},
				},
			);
			return;
		}

		deleteCompletedItemsMutation.mutate(
			{ listId },
			{
				onSuccess: (result) => {
					setIsDeleteConfirmOpen(false);
					setDeleteIntent(null);
					if (result.deleted_count > 0) {
						setDeleteSuccessMessage(
							`Usunięto zaznaczone elementy (${result.deleted_count}).`,
						);
						return;
					}
					setDeleteSuccessMessage("Brak zaznaczonych elementów do usunięcia.");
				},
			},
		);
	};

	return {
		deleteListItemMutation,
		deleteCompletedItemsMutation,
		deleteIntent,
		isDeleteConfirmOpen,
		deleteSuccessMessage,
		isAnyDeletePending,
		deleteItemErrorMessage,
		deleteCompletedErrorMessage,
		handleOpenSingleDeleteConfirm,
		handleOpenDeleteCompletedConfirm,
		handleCloseDeleteConfirm,
		handleConfirmDelete,
	};
}
