import { useAuth } from "@/api/auth/hooks/useAuth";
import { BodyScrollView } from "@/components/body-scroll-view";
import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { View } from "react-native";
import { SettingsProfile } from "@/screens/settings/components/SettingsProfile";
import { openStoreRating } from "@/screens/settings/utils/storeRating";

export default function SettingsScreen() {
	const { signOut, user } = useAuth();
	const metadata = user?.user_metadata;
	const displayName =
		metadata?.full_name ?? metadata?.name ?? user?.email ?? "Użytkownik";
	const avatarUrl = metadata?.avatar_url ?? metadata?.picture;
	const version =
		Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "—";
	const build = Application.nativeBuildVersion ?? "—";

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Ustawienia",
					headerLeft: () => <GoBackButton />,
				}}
			/>
			<BodyScrollView contentContainerClassName="flex-grow">
				<View className="flex-1 justify-between gap-8 p-6">
					<View className="items-center gap-8">
						<SettingsProfile
							avatarUrl={avatarUrl}
							displayName={displayName}
						/>
						<Button
							variant="link"
							onPress={() => void openStoreRating()}
							accessibilityLabel="Oceń aplikację"
							accessibilityRole="button"
						>
							<Text>Oceń aplikację</Text>
						</Button>
					</View>

					<View className="items-center gap-6">
						<Button variant="outline" onPress={() => void signOut()}>
							<Text>Wyloguj</Text>
						</Button>
						<View className="items-center">
							<Text variant="muted">Wersja {version}</Text>
							<Text variant="muted">Build {build}</Text>
						</View>
					</View>
				</View>
			</BodyScrollView>
		</>
	);
}
