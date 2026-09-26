import type { ListScope } from "@/api/lists/lists.models";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Pressable, View } from "react-native";

type ListScopeTabsProps = {
	value: ListScope;
	onChange: (next: ListScope) => void;
};

const TABS: { scope: ListScope; label: string }[] = [
	{ scope: "owned", label: "Moje listy" },
	{ scope: "shared", label: "Współdzielone" },
];

export function ListScopeTabs({ value, onChange }: ListScopeTabsProps) {
	return (
		<View accessibilityRole="tablist" className="flex-row pb-2">
			{TABS.map(({ scope, label }) => {
				const selected = value === scope;
				return (
					<Pressable
						key={scope}
						accessibilityRole="tab"
						accessibilityState={{ selected }}
						accessibilityLabel={label}
						onPress={() => onChange(scope)}
						className="min-h-11 flex-1 items-center justify-center"
					>
						<Text
							className={cn(
								"pb-2.5 text-center text-[15px]",
								selected
									? "font-semibold text-foreground"
									: "font-medium text-muted-foreground",
							)}
						>
							{label}
						</Text>
						<View
							className={cn(
								"absolute bottom-0 h-1 w-full rounded-full",
								selected ? "bg-primary" : "bg-transparent",
							)}
						/>
					</Pressable>
				);
			})}
		</View>
	);
}
