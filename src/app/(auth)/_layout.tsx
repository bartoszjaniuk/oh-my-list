import { useAuth } from "@/api/auth/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
	const { user, isLoading } = useAuth();

	if (isLoading) return null;

	if (user) return <Redirect href="/(protected)" />;

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
};

export default AuthLayout;
