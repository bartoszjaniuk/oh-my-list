import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { View } from "react-native";

export function MissingListId() {
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
