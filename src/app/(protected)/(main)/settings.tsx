import { useAuth } from "@/api/auth/hooks/useAuth";
import { BodyScrollView } from "@/components/body-scroll-view";
import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function SettingsScreen() {
	const { signOut } = useAuth();

	return (
		<>
			<Stack.Screen
				options={{
					headerLeft: () => <GoBackButton />,
				}}
			/>
			<BodyScrollView>
				<View className="flex-1 items-center justify-center gap-6 p-6">
					<Text className="text-xl">Settings</Text>
					<Button variant="outline" onPress={() => void signOut()}>
						<Text>Sign out</Text>
					</Button>
				</View>
			</BodyScrollView>
		</>
	);
}
