import { FlatList } from "react-native";

export const HomeScreen = () => {
	// return (
	// 	<SafeAreaView className="flex-1">
	// 		<Header />
	// 		<View className="flex-1 items-center justify-center gap-6 p-6">
	// 			<Text className="text-xl">MainScreen</Text>
	// 		</View>
	// 		<FloatingButton />
	// 	</SafeAreaView>
	// );

	const keyExtractor = (item: any) => item.id;
	const renderItem = ({ item }: { item: any }) => {
		return <Text>{item.title}</Text>;
	};

	return (
		<>
			<FlatList data={[]} keyExtractor={keyExtractor} renderItem={renderItem} />
		</>
	);
};

// const Header = () => {
// 	const router = useRouter();
// 	return (
// 		<View className="gap-4 min-h-32 border-b p-2">
// 			<View className="items-end">
// 				<IconButton
// 					as={Settings}
// 					accessibilityLabel="Settings"
// 					onPress={() => router.navigate("/settings")}
// 				/>
// 			</View>
// 			<Text variant="h2">MyLists</Text>
// 		</View>
// 	);
// };
