import type {
	GetListByIdResponse,
	GetListItemsResponse,
	ListItem,
} from "@/api/lists/lists.models";
import { Text } from "@/components/ui/text";
import type { UseQueryResult } from "@tanstack/react-query";
import {
	forwardRef,
	useImperativeHandle,
	useState,
	type Ref,
} from "react";
import { View } from "react-native";
import type { ItemSection } from "../helpers/list-items.helpers";
import { useDeleteFlow } from "../hooks/useDeleteFlow";
import { useListItemActions } from "../hooks/useListItemActions";
import { useListSettings } from "../hooks/useListSettings";
import { ListComposerSheet } from "./ListComposerSheet";
import { ListDeleteConfirmDialog } from "./ListDeleteConfirmDialog";
import { ListDetailFloatingActions } from "./ListDetailFloatingActions";
import { ListItemDetailsSheet } from "./ListItemDetailsSheet";
import { ListItemsFallbackState } from "./ListItemsFallbackState";
import { ListItemsSectionList } from "./ListItemsSectionList";
import { ListOwnershipConfirmDialog } from "./ListOwnershipConfirmDialog";
import { ListSettingsSheet } from "./ListSettingsSheet";
import { ShareListSheet } from "./ShareListSheet";

export type ListDetailContentHandle = {
	openSettings: () => void;
	openShare: () => void;
};

type ListDetailContentProps = {
	list: GetListByIdResponse;
	listId: string;
	itemsQuery: UseQueryResult<GetListItemsResponse>;
	itemSections: ItemSection[];
	checkedItemsCount: number;
	refetchDetails: () => Promise<unknown>;
	refetchItems: () => Promise<unknown>;
};

function ListDetailContentInner(
	{
		list,
		listId,
		itemsQuery,
		itemSections,
		checkedItemsCount,
		refetchDetails,
		refetchItems,
	}: ListDetailContentProps,
	ref: Ref<ListDetailContentHandle>,
) {
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
	const [isShareOpen, setIsShareOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

	const {
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
	} = useListItemActions({
		listId,
		refetchList: refetchDetails,
		refetchItems,
		onBulkCreateSuccess: () => {
			setIsComposerOpen(false);
		},
	});

	const {
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
	} = useDeleteFlow({
		listId,
		selectedItem,
		checkedItemsCount,
		onCloseItemDetails: () => {
			setIsItemDetailsOpen(false);
		},
		onClearSelectedItem: () => {
			setSelectedItem(null);
		},
	});

	const {
		isSettingsOpen,
		draftName,
		listNameMaxLength,
		isOwner,
		canActOnOwnership,
		canSubmitRename,
		isRenamePending,
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
	} = useListSettings({
		listId,
		list,
	});

	const handleOpenShare = () => {
		setIsShareOpen(true);
	};

	const handleCloseShare = () => {
		setIsShareOpen(false);
	};

	useImperativeHandle(
		ref,
		() => ({
			openSettings: handleOpenSettings,
			openShare: handleOpenShare,
		}),
		[handleOpenSettings],
	);

	const handleOpenItemDetails = (item: ListItem) => {
		if (isAnyDeletePending) {
			return;
		}
		setSelectedItem(item);
		setIsItemDetailsOpen(true);
	};

	const handleCloseItemDetails = () => {
		if (isAnyDeletePending) {
			return;
		}
		setIsItemDetailsOpen(false);
		setSelectedItem(null);
	};

	const hasRenderableSections =
		!itemsQuery.isLoading && !itemsQuery.isError && itemSections.length > 0;

	const statusMessages = [
		patchCheckErrorMessage,
		deleteItemErrorMessage,
		deleteCompletedErrorMessage,
		deleteSuccessMessage,
	].filter(Boolean);

	const listHeaderComponent = (
		<View className="gap-2 pb-2 pt-3">
			{statusMessages.length > 0 ? (
				<View className="gap-1">
					{patchCheckErrorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">
								{patchCheckErrorMessage}
							</Text>
						</View>
					) : null}
					{deleteItemErrorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">
								{deleteItemErrorMessage}
							</Text>
						</View>
					) : null}
					{deleteCompletedErrorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">
								{deleteCompletedErrorMessage}
							</Text>
						</View>
					) : null}
					{deleteSuccessMessage ? (
						<View className="rounded-md border border-border bg-muted/50 px-3 py-2">
							<Text className="text-sm text-foreground">
								{deleteSuccessMessage}
							</Text>
						</View>
					) : null}
				</View>
			) : null}
			{hasRenderableSections ? null : (
				<ListItemsFallbackState
					isInitialLoading={itemsQuery.isLoading && itemsQuery.data == null}
					isError={itemsQuery.isError}
					error={itemsQuery.error}
					onRefetch={() => {
						void itemsQuery.refetch();
					}}
					hasNoItems={itemSections.length === 0}
				/>
			)}
		</View>
	);

	return (
		<>
			<ListItemsSectionList
				sections={itemSections}
				hasRenderableSections={hasRenderableSections}
				listHeaderComponent={listHeaderComponent}
				isPullRefreshing={isPullRefreshing}
				onRefresh={handleRefresh}
				isPatchPending={patchListItemCheckMutation.isPending}
				patchingItemId={patchingItemId}
				onToggleItemCheck={handleToggleItemCheck}
				onOpenItemDetails={handleOpenItemDetails}
			/>

			<ListDetailFloatingActions
				checkedItemsCount={checkedItemsCount}
				isClearPending={deleteCompletedItemsMutation.isPending}
				isClearDisabled={isAnyDeletePending}
				isAddDisabled={bulkCreateItemsMutation.isPending}
				onClearCompletedPress={handleOpenDeleteCompletedConfirm}
				onAddPress={() => {
					if (bulkCreateItemsMutation.isPending) {
						return;
					}
					setIsComposerOpen(true);
				}}
			/>

			<ListComposerSheet
				visible={isComposerOpen}
				draftItems={draftItems}
				isPending={bulkCreateItemsMutation.isPending}
				canSubmitDraftItems={canSubmitDraftItems}
				errorMessage={bulkCreateErrorMessage}
				onClose={() => {
					if (bulkCreateItemsMutation.isPending) {
						return;
					}
					setIsComposerOpen(false);
				}}
				onDraftItemsChange={handleDraftItemsChange}
				onSubmit={handleSubmitDraftItems}
			/>

			<ListItemDetailsSheet
				visible={isItemDetailsOpen}
				selectedItem={selectedItem}
				isDeletePending={deleteListItemMutation.isPending}
				isAnyDeletePending={isAnyDeletePending}
				deleteIntentItemId={
					deleteIntent?.type === "single" ? deleteIntent.item.id : undefined
				}
				onClose={handleCloseItemDetails}
				onDeletePress={handleOpenSingleDeleteConfirm}
			/>

			<ListDeleteConfirmDialog
				visible={isDeleteConfirmOpen}
				deleteIntent={deleteIntent}
				isAnyDeletePending={isAnyDeletePending}
				onConfirm={handleConfirmDelete}
				onCancel={handleCloseDeleteConfirm}
			/>

			<ListSettingsSheet
				visible={isSettingsOpen}
				draftName={draftName}
				listNameMaxLength={listNameMaxLength}
				isOwner={isOwner}
				canActOnOwnership={canActOnOwnership}
				canSubmitRename={canSubmitRename}
				isRenamePending={isRenamePending}
				isBusy={isSettingsBusy}
				renameErrorMessage={renameErrorMessage}
				ownershipErrorMessage={ownershipErrorMessage}
				onClose={handleCloseSettings}
				onDraftNameChange={handleDraftNameChange}
				onSubmitRename={handleSubmitRename}
				onOwnershipActionPress={handleOpenOwnershipConfirm}
			/>

			<ShareListSheet
				visible={isShareOpen}
				listId={listId}
				onClose={handleCloseShare}
			/>

			<ListOwnershipConfirmDialog
				visible={isOwnershipConfirmOpen}
				ownershipIntent={ownershipIntent}
				isPending={isOwnershipActionPending}
				onConfirm={handleConfirmOwnershipAction}
				onCancel={handleCloseOwnershipConfirm}
			/>
		</>
	);
}

export const ListDetailContent = forwardRef(ListDetailContentInner);
