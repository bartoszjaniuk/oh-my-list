import type { GetListsParams } from "../lists.models";
import { useListsQuery } from "./useListsQuery";

export const useSharedListsQuery = (params?: Omit<GetListsParams, "scope">) =>
	useListsQuery("shared", params);
