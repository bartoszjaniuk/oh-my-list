import { GoBackButton } from "@/components/go-back-button";
import { DesignSystemScreen } from "@/screens/design-system/DesignSystem.screen";
import { Stack } from "expo-router";

export default function DesignSystem() {
	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: "Design System",
					headerLeft: () => <GoBackButton />,
				}}
			/>
			<DesignSystemScreen />
		</>
	);
}
