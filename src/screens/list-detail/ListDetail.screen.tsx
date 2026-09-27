import type { ListItem } from "@/api/lists/lists.models";
import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { ListComposerSheet } from "./components/ListComposerSheet";
import { ListDeleteConfirmDialog } from "./components/ListDeleteConfirmDialog";
import { ListDetailFloatingActions } from "./components/ListDetailFloatingActions";
import { ListDetailHeaderTitle } from "./components/ListDetailHeaderTitle";
import { ListItemDetailsSheet } from "./components/ListItemDetailsSheet";
import { ListItemsFallbackState } from "./components/ListItemsFallbackState";
import { ListItemsSectionList } from "./components/ListItemsSectionList";
import { ListOwnershipConfirmDialog } from "./components/ListOwnershipConfirmDialog";
import { ListSettingsSheet } from "./components/ListSettingsSheet";
import { useDeleteFlow } from "./hooks/useDeleteFlow";
import { useListDetailsScreenState } from "./hooks/useListDetailsScreenState";
import { useListItemActions } from "./hooks/useListItemActions";
import { useListSettings } from "./hooks/useListSettings";

function resolveListId(id: string | string[] | undefined): string | undefined {
	if (typeof id === "string" && id.length > 0) {
		return id;
	}
	if (Array.isArray(id) && typeof id[0] === "string" && id[0].length > 0) {
		return id[0];
	}
	return undefined;
}

export function ListDetailScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	const listId = resolveListId(id);

	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

	const {
		list,
		isLoading,
		isError,
		error,
		refetch,
		refetchDetails,
		refetchItems,
		itemsQuery,
		itemSections,
		checkedItemsCount,
	} = useListDetailsScreenState(listId);

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

	const headerTitle = list?.name ?? "Lista";

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

	if (listId == null) {
		return (
			<>
				<Stack.Screen
					options={{
						headerShown: true,
						headerShadowVisible: false,
						title: "Lista",
						headerLeft: () => <GoBackButton />,
					}}
				/>
				<View className="flex-1 items-center justify-center gap-4 bg-background px-6">
					<Text variant="large" className="text-center">
						Brak identyfikatora listy
					</Text>
					<Text variant="muted" className="text-center">
						Nie można otworzyć szczegółów bez poprawnego adresu.
					</Text>
					<Button onPress={() => router.replace("/")}>
						<Text>Wróć do list</Text>
					</Button>
				</View>
			</>
		);
	}

	const hasRenderableSections =
		!itemsQuery.isLoading && !itemsQuery.isError && itemSections.length > 0;

	const statusMessages = [
		patchCheckErrorMessage,
		deleteItemErrorMessage,
		deleteCompletedErrorMessage,
		deleteSuccessMessage,
	].filter(Boolean);

	const listHeaderComponent =
		!isLoading && !isError && list != null ? (
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
		) : null;

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					headerTitleAlign: "center",
					// Empty string suppresses the route-name native title so only
					// the custom React headerTitle (name + type) is visible.
					title: "",
					headerTitle: () => <ListDetailHeaderTitle title={headerTitle} />,
					headerLeft: () => <GoBackButton />,
					headerRight: () =>
						list != null ? (
							<IconButton
								as={Settings}
								accessibilityLabel="Ustawienia listy"
								onPress={handleOpenSettings}
							/>
						) : null,
				}}
			/>
			<View className="flex-1 bg-background">
				{isLoading ? (
					<View className="gap-3 p-6">
						<Skeleton className="h-5 w-[60%]" />
						<Skeleton className="h-4 w-[40%]" />
						<Skeleton className="mt-4 h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</View>
				) : null}

				{isError ? (
					<View className="flex-1 items-center justify-center gap-4 px-6 py-10">
						<Text variant="large" className="text-center">
							Nie udało się pobrać listy
						</Text>
						<Text variant="muted" className="text-center">
							{error instanceof Error
								? error.message
								: "Spróbuj ponownie za chwilę."}
						</Text>
						<Button onPress={() => void refetch()}>
							<Text>Odśwież</Text>
						</Button>
					</View>
				) : null}

				{!isLoading && !isError && list != null ? (
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
					</>
				) : null}
			</View>

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
