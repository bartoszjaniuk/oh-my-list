import type { ListSummary } from "@/api/lists/lists.models";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
	BookOpen,
	ChevronRight,
	Film,
	Gift,
	List,
	MapPin,
	ShoppingCart,
	type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatItemsCountMessage } from "../utils/listCardFormat";

/**
 * Soft type surfaces from the compact list reference (pastel squares).
 * Not theme tokens — closest Tailwind tints until type colors land in DS.
 */
const LIST_TYPE_SURFACE: Record<string, string> = {
	shopping: "bg-emerald-100",
	media: "bg-pink-100",
	movies: "bg-pink-100",
	books: "bg-amber-100",
	travel: "bg-sky-100",
	gifts: "bg-rose-100",
};

const LIST_TYPE_ICON: Record<string, LucideIcon> = {
	shopping: ShoppingCart,
	media: Film,
	movies: Film,
	books: BookOpen,
	travel: MapPin,
	gifts: Gift,
};

type ListCardProps = {
	item: ListSummary;
	onOpenList: (listId: string) => void;
};

function listTypeIcon(type: string): LucideIcon {
	return LIST_TYPE_ICON[type] ?? List;
}

function listTypeSurface(type: string): string {
	return LIST_TYPE_SURFACE[type] ?? "bg-muted";
}

export function ListCard({ item, onOpenList }: ListCardProps) {
	const TypeIcon = listTypeIcon(item.type);
	const itemsLabel = formatItemsCountMessage(item.item_count);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${item.name}, ${itemsLabel}`}
			onPress={() => onOpenList(item.id)}
			className="active:opacity-70"
		>
			<View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
				<View
					className={cn(
						"h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
						listTypeSurface(item.type),
					)}
					accessible={false}
				>
					<Icon as={TypeIcon} size={20} className="text-foreground" />
				</View>

				<View className="min-w-0 flex-1 justify-center gap-0.5">
					<Text
						className="text-[16px] font-semibold leading-snug text-foreground"
						numberOfLines={1}
					>
						{item.name}
					</Text>
					<Text variant="muted" numberOfLines={1}>
						{itemsLabel}
					</Text>
				</View>

				<Icon
					as={ChevronRight}
					size={18}
					className="shrink-0 text-muted-foreground"
				/>
			</View>
		</Pressable>
	);
}
