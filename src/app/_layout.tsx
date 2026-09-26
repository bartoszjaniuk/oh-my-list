import AppProviders from "@/providers/AppProviders";
import { supabase } from "@/utils/supabase/client";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		"CabinetGrotesk-Thin": require("@/assets/fonts/OTF/CabinetGrotesk-Thin.otf"),
		"CabinetGrotesk-Extralight": require("@/assets/fonts/OTF/CabinetGrotesk-Extralight.otf"),
		"CabinetGrotesk-Light": require("@/assets/fonts/OTF/CabinetGrotesk-Light.otf"),
		"CabinetGrotesk-Regular": require("@/assets/fonts/OTF/CabinetGrotesk-Regular.otf"),
		"CabinetGrotesk-Medium": require("@/assets/fonts/OTF/CabinetGrotesk-Medium.otf"),
		"CabinetGrotesk-Bold": require("@/assets/fonts/OTF/CabinetGrotesk-Bold.otf"),
		"CabinetGrotesk-Extrabold": require("@/assets/fonts/OTF/CabinetGrotesk-Extrabold.otf"),
		"CabinetGrotesk-Black": require("@/assets/fonts/OTF/CabinetGrotesk-Black.otf"),
	});

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				supabase.auth.startAutoRefresh();
			} else {
				supabase.auth.stopAutoRefresh();
			}
		});

		return () => {
			subscription.remove();
		};
	}, []);

	if (!loaded && !error) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProviders>
				<StatusBar style="dark" />

				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen
						name="(auth)"
						options={{ headerShown: false, animation: "fade_from_bottom" }}
					/>
					<Stack.Screen name="(protected)" options={{ headerShown: false }} />
				</Stack>
				<PortalHost />
			</AppProviders>
		</GestureHandlerRootView>
	);
}
