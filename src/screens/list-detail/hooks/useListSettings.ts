import { useAppUserIdQuery } from "@/api/auth/hooks/useAppUserIdQuery";
import { useDeleteListMutation } from "@/api/lists/hooks/useDeleteListMutation";
import { usePatchListNameMutation } from "@/api/lists/hooks/usePatchListNameMutation";
import { useRemoveListMemberMutation } from "@/api/lists/hooks/useRemoveListMemberMutation";
import type { GetListByIdResponse } from "@/api/lists/lists.models";
import { router } from "expo-router";
import { useState } from "react";

const LIST_NAME_MAX_LENGTH = 100;

export type ListOwnershipIntent = "delete" | "leave";

type UseListSettingsArgs = {
	listId?: string;
	list: GetListByIdResponse | undefined;
};

export function useListSettings({ listId, list }: UseListSettingsArgs) {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [draftName, setDraftName] = useState("");
	const [isOwnershipConfirmOpen, setIsOwnershipConfirmOpen] = useState(false);
	const [ownershipIntent, setOwnershipIntent] =
		useState<ListOwnershipIntent | null>(null);

	const appUserIdQuery = useAppUserIdQuery();
	const patchListNameMutation = usePatchListNameMutation();
	const deleteListMutation = useDeleteListMutation();
	const removeListMemberMutation = useRemoveListMemberMutation();

	const appUserId = appUserIdQuery.data;
	const isOwner =
		list != null && appUserId != null && list.owner_id === appUserId;
	const canActOnOwnership = appUserId != null;

	const trimmedDraftName = draftName.trim();
	const currentName = list?.name ?? "";
	const isDraftNameValid =
		trimmedDraftName.length >= 1 &&
		trimmedDraftName.length <= LIST_NAME_MAX_LENGTH;
	const hasNameChanged = trimmedDraftName !== currentName.trim();
	const canSubmitRename =
		isDraftNameValid &&
		hasNameChanged &&
		!patchListNameMutation.isPending &&
		listId != null;

	const isOwnershipActionPending =
		deleteListMutation.isPending || removeListMemberMutation.isPending;
	const isSettingsBusy =
		patchListNameMutation.isPending || isOwnershipActionPending;

	const renameErrorMessage =
		patchListNameMutation.error instanceof Error
			? patchListNameMutation.error.message
			: null;
	const ownershipErrorMessage =
		(deleteListMutation.error instanceof Error
			? deleteListMutation.error.message
			: null) ??
		(removeListMemberMutation.error instanceof Error
			? removeListMemberMutation.error.message
			: null);

	const resetMutationErrors = () => {
		if (patchListNameMutation.error) {
			patchListNameMutation.reset();
		}
		if (deleteListMutation.error) {
			deleteListMutation.reset();
		}
		if (removeListMemberMutation.error) {
			removeListMemberMutation.reset();
		}
	};

	const handleOpenSettings = () => {
		if (list == null) {
			return;
		}
		resetMutationErrors();
		setDraftName(list.name);
		setOwnershipIntent(null);
		setIsOwnershipConfirmOpen(false);
		setIsSettingsOpen(true);
	};

	const handleCloseSettings = () => {
		if (isSettingsBusy) {
			return;
		}
		setIsSettingsOpen(false);
		setOwnershipIntent(null);
		setIsOwnershipConfirmOpen(false);
	};

	const handleDraftNameChange = (value: string) => {
		if (patchListNameMutation.error) {
			patchListNameMutation.reset();
		}
		setDraftName(value);
	};

	const handleSubmitRename = () => {
		if (!listId || !canSubmitRename) {
			return;
		}

		patchListNameMutation.mutate(
			{
				listId,
				input: { name: trimmedDraftName },
			},
			{
				onSuccess: () => {
					setIsSettingsOpen(false);
				},
			},
		);
	};

	const handleOpenOwnershipConfirm = () => {
		if (isSettingsBusy || !canActOnOwnership) {
			return;
		}
		resetMutationErrors();
		setOwnershipIntent(isOwner ? "delete" : "leave");
		setIsOwnershipConfirmOpen(true);
	};

	const handleCloseOwnershipConfirm = () => {
		if (isOwnershipActionPending) {
			return;
		}
		setIsOwnershipConfirmOpen(false);
		setOwnershipIntent(null);
	};

	const handleConfirmOwnershipAction = () => {
		if (!listId || !ownershipIntent || isOwnershipActionPending) {
			return;
		}

		if (ownershipIntent === "delete") {
			deleteListMutation.mutate(
				{ listId },
				{
					onSuccess: () => {
						setIsOwnershipConfirmOpen(false);
						setOwnershipIntent(null);
						setIsSettingsOpen(false);
						router.replace("/");
					},
				},
			);
			return;
		}

		if (appUserId == null) {
			return;
		}

		removeListMemberMutation.mutate(
			{ listId, userId: appUserId },
			{
				onSuccess: () => {
					setIsOwnershipConfirmOpen(false);
					setOwnershipIntent(null);
					setIsSettingsOpen(false);
					router.replace("/");
				},
			},
		);
	};

	return {
		isSettingsOpen,
		draftName,
		listNameMaxLength: LIST_NAME_MAX_LENGTH,
		isOwner,
		canActOnOwnership,
		canSubmitRename,
		isRenamePending: patchListNameMutation.isPending,
		isSettingsBusy,
		isOwnershipConfirmOpen,
		ownershipIntent,
		isOwnershipActionPending,
		renameErrorMessage,
		ownershipErrorMessage,
		handleOpenSettings,
		handleCloseSettings,
		handleDraftNameChange,
		handleSubmitRename,
		handleOpenOwnershipConfirm,
		handleCloseOwnershipConfirm,
		handleConfirmOwnershipAction,
	};
}
