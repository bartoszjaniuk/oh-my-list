import type { ListItem } from "@/api/lists/lists.models";
import { Text } from "@/components/ui/text";
import type { ReactElement } from "react";
import { Pressable, RefreshControl, SectionList, View } from "react-native";
import type { ItemSection } from "../helpers/list-items.helpers";
import { ListItemCheckbox } from "./ListItemCheckbox";

const EMPTY_ITEM_SECTIONS: ItemSection[] = [];

type ListItemsSectionListProps = {
	sections: ItemSection[];
	hasRenderableSections: boolean;
	listHeaderComponent: ReactElement | null;
	isPullRefreshing: boolean;
	onRefresh: () => void;
	isPatchPending: boolean;
	patchingItemId: string | undefined;
	onToggleItemCheck: (item: ListItem, checked: boolean) => void;
	onOpenItemDetails: (item: ListItem) => void;
};

export function ListItemsSectionList({
	sections: itemSections,
	hasRenderableSections,
	listHeaderComponent,
	isPullRefreshing,
	onRefresh,
	isPatchPending,
	patchingItemId,
	onToggleItemCheck,
	onOpenItemDetails,
}: ListItemsSectionListProps) {
	const sections = hasRenderableSections ? itemSections : EMPTY_ITEM_SECTIONS;

	const keyExtractor = (item: ListItem) => item.id;

	const renderSectionHeader = ({ section }: { section: ItemSection }) => (
		<View className="pb-2 pt-5">
			<Text variant="small" className="uppercase tracking-wide text-muted-foreground">
				{section.title}
			</Text>
		</View>
	);

	const renderItem = ({ item }: { item: ListItem }) => {
		const isThisItemPending = isPatchPending && patchingItemId === item.id;

		return (
			<View className="min-h-[48px] flex-row items-center gap-2 border-b border-border/80 py-1">
				<ListItemCheckbox
					checked={item.is_checked}
					disabled={isThisItemPending}
					onCheckedChange={(checked) => onToggleItemCheck(item, checked)}
					accessibilityLabel={
						item.is_checked ? `Odznacz ${item.name}` : `Zaznacz ${item.name}`
					}
				/>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Otwórz szczegóły pozycji ${item.name}`}
					disabled={isThisItemPending}
					onPress={() => onOpenItemDetails(item)}
					className="min-h-[48px] flex-1 justify-center py-2.5"
				>
					<Text
						className={
							item.is_checked
								? "text-base text-muted-foreground line-through"
								: "text-base text-foreground"
						}
					>
						{item.name}
					</Text>
				</Pressable>
			</View>
		);
	};

	return (
		<SectionList
			sections={sections}
			keyExtractor={keyExtractor}
			renderSectionHeader={renderSectionHeader}
			renderItem={renderItem}
			ListHeaderComponent={listHeaderComponent}
			stickySectionHeadersEnabled={false}
			contentContainerClassName="px-5 pb-36"
			refreshControl={
				<RefreshControl refreshing={isPullRefreshing} onRefresh={onRefresh} />
			}
		/>
	);
}
