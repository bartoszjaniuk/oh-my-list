import { GoBackButton } from "@/components/go-back-button";
import { ErrorState } from "@/components/screen/ErrorState";
import { Screen } from "@/components/screen/Screen";
import { errorMessage } from "@/components/screen/error-message";
import { IconButton } from "@/components/ui/icon-button";
import { Stack, useLocalSearchParams } from "expo-router";
import { Settings, Share2 } from "lucide-react-native";
import { useRef } from "react";
import { View } from "react-native";
import {
	ListDetailContent,
	type ListDetailContentHandle,
} from "./components/ListDetailContent";
import { ListDetailHeaderTitle } from "./components/ListDetailHeaderTitle";
import { ListDetailSkeleton } from "./components/ListDetailSkeleton";
import { MissingListId } from "./components/MissingListId";
import { useListDetailsScreenState } from "./hooks/useListDetailsScreenState";

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
	const contentRef = useRef<ListDetailContentHandle>(null);

	const {
		detailsQuery,
		refetchDetails,
		refetchItems,
		itemsQuery,
		itemSections,
		checkedItemsCount,
	} = useListDetailsScreenState(listId);

	if (listId == null) {
		return <MissingListId />;
	}

	const list = detailsQuery.data;
	const headerTitle = list?.name ?? "Lista";

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
							<View className="flex-row items-center gap-2">
								<IconButton
									as={Share2}
									accessibilityLabel="Udostępnij listę"
									onPress={() => {
										contentRef.current?.openShare();
									}}
								/>
								<IconButton
									as={Settings}
									accessibilityLabel="Ustawienia listy"
									onPress={() => {
										contentRef.current?.openSettings();
									}}
								/>
							</View>
						) : null,
				}}
			/>
			<Screen>
				<Screen.Query
					query={detailsQuery}
					loading={<ListDetailSkeleton />}
					error={(error, { refetch }) => (
						<Screen.Content>
							<ErrorState
								title="Nie udało się pobrać listy"
								message={errorMessage(error)}
								onRetry={() => {
									void refetch();
								}}
							/>
						</Screen.Content>
					)}
				>
					{(listData) => (
						<ListDetailContent
							ref={contentRef}
							list={listData}
							listId={listId}
							itemsQuery={itemsQuery}
							itemSections={itemSections}
							checkedItemsCount={checkedItemsCount}
							refetchDetails={refetchDetails}
							refetchItems={refetchItems}
						/>
					)}
				</Screen.Query>
			</Screen>
		</>
	);
}
