import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

type SettingsProfileProps = {
	avatarUrl?: string;
	displayName: string;
};

export function SettingsProfile({
	avatarUrl,
	displayName,
}: SettingsProfileProps) {
	const initials = displayName
		.split(/\s+/)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<View className="items-center gap-3">
			<Avatar className="size-24" alt={`${displayName} avatar`}>
				{avatarUrl ? (
					<AvatarImage source={{ uri: avatarUrl }} />
				) : null}
				<AvatarFallback>
					<Text variant="large">{initials || "?"}</Text>
				</AvatarFallback>
			</Avatar>
			<Text variant="large" accessibilityRole="header">
				{displayName}
			</Text>
		</View>
	);
}
