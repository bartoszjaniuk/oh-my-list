import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

type ListItemCheckboxProps = {
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
	accessibilityLabel: string;
};

export function ListItemCheckbox({
	checked,
	disabled = false,
	onCheckedChange,
	accessibilityLabel,
}: ListItemCheckboxProps) {
	return (
		<Pressable
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
			accessibilityLabel={accessibilityLabel}
			disabled={disabled}
			hitSlop={8}
			onPress={() => onCheckedChange(!checked)}
			className={cn("min-h-[44px] min-w-[44px] items-center justify-center", disabled && "opacity-50")}
		>
			<View
				className={cn(
					"h-5 w-5 items-center justify-center rounded border",
					checked
						? "border-primary bg-primary"
						: "border-muted-foreground/40 bg-background",
				)}
			>
				{checked ? (
					<Icon
						as={Check}
						size={14}
						strokeWidth={2.5}
						className="text-primary-foreground"
					/>
				) : null}
			</View>
		</Pressable>
	);
}
