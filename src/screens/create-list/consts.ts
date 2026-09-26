import { List, ShoppingCart, type LucideIcon } from "lucide-react-native";
import type { CreateListInput } from "@/api/lists/lists.models";

export type ListTypeId = CreateListInput["type"];

export type ListTypeOption = {
	id: ListTypeId;
	title: string;
	description: string;
	icon: LucideIcon;
};

export const LIST_TYPE_OPTIONS: ListTypeOption[] = [
	{
		id: "shopping",
		title: "Spożywcza",
		description: "Lista zakupów spożywczych",
		icon: ShoppingCart,
	},
	{
		id: "other",
		title: "Inne",
		description: "Dowolna lista zadań lub rzeczy",
		icon: List,
	},
];
