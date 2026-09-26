import type { ListSummary } from "@/api/lists/lists.models";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
	BookOpen,
	ChevronRight,
	Clock,
	Film,
	Gift,
	List,
	MapPin,
	ShoppingCart,
	Users,
	type LucideIcon,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import {
	formatItemsCountMessage,
	formatListUpdatedAt,
	formatMembersCountMessage,
	formatSharingLabel,
} from "../utils/listCardFormat";

const LIST_TYPE_LABEL: Record<string, string> = {
	shopping: "Zakupy",
	media: "Filmy / seriale",
	movies: "Filmy / seriale",
	books: "Książki",
	travel: "Podróże",
	gifts: "Prezenty",
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

function formatListTypeLabel(type: string): string {
	return LIST_TYPE_LABEL[type] ?? type;
}

function listTypeIcon(type: string): LucideIcon {
	return LIST_TYPE_ICON[type] ?? List;
}

export function ListCard({ item, onOpenList }: ListCardProps) {
	const shareLabel = formatSharingLabel(item.member_count);
	const TypeIcon = listTypeIcon(item.type);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={item.name}
			onPress={() => onOpenList(item.id)}
			className="active:opacity-90"
		>
			<Card
				className={cn(
					"flex-row items-stretch gap-3 rounded-xl border-border bg-card p-4 py-4 shadow-sm shadow-black/5",
				)}
			>
				<View className="h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
					<Icon as={TypeIcon} size={22} className="text-foreground" />
				</View>

				<View className="min-w-0 flex-1 gap-0.5">
					<View className="flex-row items-start gap-2">
						<Text
							className="min-w-0 flex-1 text-[17px] font-bold leading-snug text-foreground"
							numberOfLines={2}
						>
							{item.name}
						</Text>
						<View className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5">
							<Text
								variant="small"
								className="text-muted-foreground"
								numberOfLines={1}
							>
								{shareLabel}
							</Text>
						</View>
					</View>

					<Text variant="muted" numberOfLines={1}>
						{formatListTypeLabel(item.type)}
					</Text>

					<View className="mt-1.5 flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
						<Icon as={List} size={14} className="text-muted-foreground" />
						<Text variant="muted">
							{formatItemsCountMessage(item.item_count)}
						</Text>
						<Text variant="muted" className="text-muted-foreground/80">
							|
						</Text>
						<Icon as={Users} size={14} className="text-muted-foreground" />
						<Text variant="muted">
							{formatMembersCountMessage(item.member_count)}
						</Text>
					</View>

					<View className="mt-1 flex-row items-center gap-1.5">
						<Icon as={Clock} size={14} className="text-muted-foreground" />
						<Text variant="muted" className="text-xs">
							{formatListUpdatedAt(item.updated_at)}
						</Text>
					</View>
				</View>

				<View className="justify-center self-center pl-0.5">
					<View className="h-8 w-8 items-center justify-center rounded-full border border-border bg-muted">
						<Icon
							as={ChevronRight}
							size={16}
							className="text-muted-foreground"
						/>
					</View>
				</View>
			</Card>
		</Pressable>
	);
}
