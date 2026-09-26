import { FloatingButton } from "@/components/floating-button";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import type { ListSummary } from "@/api/lists/lists.models";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListCard } from "./components/ListCard";
import { ListScopeTabs } from "./components/ListScopeTabs";
import { ListsOverviewEmpty } from "./components/ListsOverviewEmpty";
import { useListsScreen } from "./hooks/useListsScreen";

function Header() {
	return (
		<View className="min-h-32 gap-4 border-b border-border p-2">
			<View className="items-end">
				<IconButton
					as={Settings}
					accessibilityLabel="Settings"
					onPress={() => router.navigate("/settings")}
				/>
			</View>
			<Text variant="h2">Listy</Text>
		</View>
	);
}

export const HomeScreen = () => {
	const {
		segment,
		setSegment,
		lists,
		isLoading,
		isRefreshing,
		isError,
		error,
		refetch,
		onOpenList,
	} = useListsScreen();

	const keyExtractor = (item: ListSummary) => item.id;

	const renderItem = ({ item }: { item: ListSummary }) => (
		<ListCard item={item} onOpenList={onOpenList} />
	);

	const isEmpty = lists.length === 0;

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<Header />
			<ListScopeTabs value={segment} onChange={setSegment} />
			<FlatList
				className="flex-1"
				data={lists}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
				}
				ListEmptyComponent={
					<ListsOverviewEmpty
						segment={segment}
						isLoading={isLoading}
						isError={isError}
						error={error}
						onRefresh={refetch}
					/>
				}
				contentContainerClassName={
					isEmpty ? "flex-grow" : "gap-3 px-4 py-4 pb-28"
				}
			/>
			<FloatingButton onPress={() => {}} />
		</SafeAreaView>
	);
};
