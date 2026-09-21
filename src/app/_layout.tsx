import { Stack } from "expo-router";
import "../../global.css";

import AppProviders from "@/providers/AppProviders";

export default function RootLayout() {
	return (
		<AppProviders>
			<Stack />
		</AppProviders>
	);
}
