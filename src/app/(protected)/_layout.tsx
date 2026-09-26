import { useAuth } from "@/api/auth/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

const ProtectedLayout = () => {
	const { user, isLoading } = useAuth();

	if (isLoading) return null;
	if (!user) return <Redirect href="/(auth)" />;

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="settings" />
			<Stack.Screen name="design-system" />
		</Stack>
	);
};

export default ProtectedLayout;
