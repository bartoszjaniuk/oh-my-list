import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

type ErrorStateProps = {
	title: string;
	message: string;
	onRetry: () => void;
	retryLabel?: string;
};

export function ErrorState({
	title,
	message,
	onRetry,
	retryLabel = "Odśwież",
}: ErrorStateProps) {
	return (
		<View className="flex-1 items-center justify-center gap-4 px-6 py-10">
			<Text variant="large" className="text-center">
				{title}
			</Text>
			<Text variant="muted" className="text-center">
				{message}
			</Text>
			<Button onPress={onRetry}>
				<Text>{retryLabel}</Text>
			</Button>
		</View>
	);
}
