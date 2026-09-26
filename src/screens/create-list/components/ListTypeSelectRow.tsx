import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";
import type { ListTypeOption } from "../consts";

type ListTypeSelectRowProps = {
	option: ListTypeOption;
	selected: boolean;
	disabled?: boolean;
	onSelect: () => void;
};

export function ListTypeSelectRow({
	option,
	selected,
	disabled = false,
	onSelect,
}: ListTypeSelectRowProps) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ selected, disabled }}
			accessibilityLabel={`${option.title}. ${option.description}`}
			disabled={disabled}
			onPress={onSelect}
			className="active:opacity-90"
		>
			<View
				className={cn(
					"flex-row items-center gap-3 rounded-md border border-border px-4 py-3",
					selected && "border-primary bg-accent",
					disabled && "opacity-50",
				)}
			>
				<View
					className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted"
					accessible={false}
				>
					<Icon as={option.icon} size={20} className="text-foreground" />
				</View>
				<View className="min-w-0 flex-1 gap-0.5">
					<Text className="text-base font-semibold text-foreground">
						{option.title}
					</Text>
					<Text variant="muted">{option.description}</Text>
				</View>
			</View>
		</Pressable>
	);
}
