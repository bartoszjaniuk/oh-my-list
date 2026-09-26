import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { listsKeys } from "./lists/lists.queryKeys";

export const queryKeys = mergeQueryKeys(listsKeys);
