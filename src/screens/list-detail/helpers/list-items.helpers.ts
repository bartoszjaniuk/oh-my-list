import type { ListItem } from "@/api/lists/lists.models";

const LIST_TYPE_LABEL: Record<string, string> = {
	shopping: "Zakupy",
	other: "Inne",
};

export type ItemSection = {
	title: string;
	data: ListItem[];
};

export type DeleteIntent =
	| {
			type: "single";
			item: ListItem;
	  }
	| {
			type: "completed";
			checkedCount: number;
	  };

export const formatListTypeLabel = (type: string) =>
	LIST_TYPE_LABEL[type] ?? type;

export const isOtherCategory = (categoryName: string) =>
	categoryName.trim().toLocaleLowerCase("pl") === "inne";

export const sortCategoryNames = (a: string, b: string) => {
	const aIsOther = isOtherCategory(a);
	const bIsOther = isOtherCategory(b);

	if (aIsOther !== bIsOther) {
		return aIsOther ? 1 : -1;
	}

	return a.localeCompare(b, "pl", { sensitivity: "base" });
};

export const groupItemsByCategory = (items: ListItem[]): ItemSection[] => {
	const grouped = new Map<string, ListItem[]>();

	for (const item of items) {
		const key = item.category_name || "Inne";
		const categoryItems = grouped.get(key) ?? [];
		categoryItems.push(item);
		grouped.set(key, categoryItems);
	}

	return Array.from(grouped.entries())
		.sort(([a], [b]) => sortCategoryNames(a, b))
		.map(([categoryName, categoryItems]) => ({
			title: categoryName,
			data: categoryItems,
		}));
};

export const parseDraftItems = (value: string) => {
	const parsed = value
		.split(/[\n,]/)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	return [...new Set(parsed)];
};
