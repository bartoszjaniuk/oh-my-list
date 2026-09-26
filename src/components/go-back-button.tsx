import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { IconButton } from "./ui/icon-button";

type GoBackButtonProps = {
	accessibilityLabel?: string;
};

export function GoBackButton({
	accessibilityLabel = "Wróć",
}: GoBackButtonProps) {
	return (
		<IconButton
			as={ChevronLeft}
			accessibilityLabel={accessibilityLabel}
			onPress={router.back}
		/>
	);
}
