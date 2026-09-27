import { Text } from "@/components/ui/text";
import { View } from "react-native";

type ListDetailHeaderTitleProps = {
	title: string;
	subtitle?: string;
};

export function ListDetailHeaderTitle({
	title,
	subtitle,
}: ListDetailHeaderTitleProps) {
	return (
		<View className="max-w-[220px] items-center justify-center px-1">
			<Text
				numberOfLines={1}
				className="font-lora text-center text-lg font-medium text-foreground"
			>
				{title}
			</Text>
			{subtitle ? (
				<Text
					numberOfLines={1}
					variant="muted"
					className="text-center text-xs"
				>
					{subtitle}
				</Text>
			) : null}
		</View>
	);
}
