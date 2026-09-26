import type { GetListsParams } from "../lists.models";
import { useListsQuery } from "./useListsQuery";

export const useOwnedListsQuery = (params?: Omit<GetListsParams, "scope">) =>
	useListsQuery("owned", params);
