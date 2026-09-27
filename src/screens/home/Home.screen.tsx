import type { ListSummary } from "@/api/lists/lists.models";
import { FloatingButton } from "@/components/floating-button";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { CreateListSheet } from "@/screens/create-list/components/CreateListSheet";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListCard } from "./components/ListCard";
import { ListScopeTabs } from "./components/ListScopeTabs";
import { ListsOverviewEmpty } from "./components/ListsOverviewEmpty";
import { useListsScreen } from "./hooks/useListsScreen";

function Header() {
	return (
		<View className="min-h-32 gap-4 p-4">
			<View className="items-end">
				<IconButton
					as={Settings}
					accessibilityLabel="Settings"
					onPress={() => router.navigate("/settings")}
				/>
			</View>
			<Text className="font-lora text-4xl font-light">oh my list</Text>
		</View>
	);
}

export const HomeScreen = () => {
	const [createSheetVisible, setCreateSheetVisible] = useState(false);
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
	// #E6EBFB
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
				contentContainerClassName={isEmpty ? "flex-grow" : "pb-28"}
			/>
			<FloatingButton
				accessibilityLabel="Utwórz listę"
				onPress={() => setCreateSheetVisible(true)}
			/>
			<CreateListSheet
				visible={createSheetVisible}
				onClose={() => setCreateSheetVisible(false)}
			/>
		</SafeAreaView>
	);
};
