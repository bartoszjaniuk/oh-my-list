import { createQueryKeys } from "@lukemorales/query-key-factory";
import { GetListsParams } from "./lists.models";

export const listsKeys = createQueryKeys("lists", {
	list: (params?: GetListsParams) => {
		return [params];
	},
	listDetails: (listId: string) => {
		return [listId];
	},
	listItems: (listId: string) => {
		return [listId];
	},
	listMembers: (listId: string) => {
		return [listId];
	},
	listInvitation: (listId: string) => {
		return [listId];
	},
});
