import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/query-client";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { AuthProvider } from "./AuthProvider";

export default function AppProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	const { colorScheme } = useColorScheme();
	const scheme = colorScheme === "dark" ? "dark" : "light";
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider value={NAV_THEME[scheme]}>
				<AuthProvider>
					<StatusBar style={scheme === "dark" ? "light" : "dark"} />
					{children}
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
