export type ListSummary = {
	id: string;
	name: string;
	type: string;
	owner_id: string;
	member_count: number;
	item_count: number;
	created_at: string;
	updated_at: string;
};

export type GetListsResponse = {
	data: ListSummary[];
	total: number;
};

export type GetListByIdResponse = ListSummary;

export type ListMember = {
	user_id: string;
	name: string;
	avatar: string;
	role: "owner" | "member";
	joined_at: string;
};

export type GetListMembersResponse = {
	data: ListMember[];
};

export type ListItem = {
	id: string;
	list_id: string;
	name: string;
	category_id: string;
	category_name: string;
	is_checked: boolean;
	quantity: string | null;
	note: string | null;
	link: string | null;
	added_by: string;
	created_at: string;
	updated_at: string;
};

export type CategorizationSource = "dictionary" | "ai" | "fallback";

export type GetListItemsResponse = {
	data: ListItem[];
};

export type BulkCreateListItemsInput = {
	items: string[];
};

export type PatchListItemCheckInput = {
	is_checked: boolean;
};

export type BulkCreateListItemsResultItem = Omit<ListItem, "list_id"> & {
	categorization_source: CategorizationSource;
};

export type BulkCreateListItemsResponse = {
	data: BulkCreateListItemsResultItem[];
};

export type PatchListItemCheckResponse = ListItem;

export type DeleteCompletedListItemsResponse = {
	deleted_count: number;
};

export type ErrorResponse = {
	error?: {
		code?: string;
		message?: string;
	};
};

export type CreateListInput = {
	name: string;
	/** Typ zgodny z Edge Function — "movies" (nie "media") */
	type: "shopping" | "movies" | "books" | "travel" | "gifts";
};

/** Body PATCH /lists/:id — zgodny z PatchListNameBodySchema (Edge Function). */
export type PatchListNameInput = {
	name: string;
};

/** Zgodnie z `GET /lists?scope=` na Edge (`owned` domyślny po stronie serwera). */
export type ListScope = "owned" | "shared";

export type GetListsParams = {
	limit?: number;
	offset?: number;
	scope?: ListScope;
};

/** Odpowiedź `POST /lists/:id/invitations` (Edge). */
export type CreateListInvitationResponse = {
	id: string;
	list_id: string;
	code: string;
	invite_link: string;
	expires_at: string;
	created_at: string;
};

/** Odpowiedź `POST /lists/invitations/join` (Edge). */
export type JoinListByInvitationResponse = {
	list_id: string;
	list_name: string;
	list_type: string;
	role: "member";
	joined_at: string;
};

/** Błąd z Edge Function `lists` (znany kształt JSON). */
export class ListsApiError extends Error {
	readonly code: string;
	readonly status: number;
	readonly retryAfterSeconds: number | undefined;

	constructor(
		message: string,
		opts: { code: string; status: number; retryAfterSeconds?: number },
	) {
		super(message);
		this.name = "ListsApiError";
		this.code = opts.code;
		this.status = opts.status;
		this.retryAfterSeconds = opts.retryAfterSeconds;
	}
}
