import { getAccessToken } from "../auth/utils/getAccessToken";
import { endpoints } from "../endpoints";
import {
	BulkCreateListItemsInput,
	BulkCreateListItemsResponse,
	CreateListInput,
	CreateListInvitationResponse,
	DeleteCompletedListItemsResponse,
	ErrorResponse,
	GetListByIdResponse,
	GetListItemsResponse,
	GetListMembersResponse,
	GetListsParams,
	GetListsResponse,
	JoinListByInvitationResponse,
	ListsApiError,
	ListSummary,
	PatchListItemCheckInput,
	PatchListItemCheckResponse,
	PatchListNameInput,
} from "./lists.models";
import { normalizeGetListsParams } from "./lists.utils";

const getListsBaseUrl = (): string => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}
	return new URL(endpoints.lists, supabaseUrl).toString();
};

const buildEdgeEndpoint = (
	params: ReturnType<typeof normalizeGetListsParams>,
) => {
	const url = new URL(getListsBaseUrl());
	url.searchParams.set("limit", String(params.limit));
	url.searchParams.set("offset", String(params.offset));
	url.searchParams.set("scope", params.scope);
	return url.toString();
};

const buildListByIdEndpoint = (listId: string) => {
	return new URL(`${endpoints.lists}/${listId}`, getListsBaseUrl()).toString();
};

const buildListInvitationsEndpoint = (listId: string) => {
	return new URL(
		`${endpoints.lists}/${listId}/invitations`,
		getListsBaseUrl(),
	).toString();
};

const buildListInvitationsJoinEndpoint = () => {
	return new URL(
		`${endpoints.lists}/invitations/join`,
		getListsBaseUrl(),
	).toString();
};

const buildListMembersEndpoint = (listId: string) => {
	return new URL(
		`${endpoints.lists}/${listId}/members`,
		getListsBaseUrl(),
	).toString();
};

const buildListMemberByUserEndpoint = (listId: string, userId: string) => {
	return new URL(
		`${endpoints.lists}/${listId}/members/${userId}`,
		getListsBaseUrl(),
	).toString();
};

const buildListItemsEndpoint = (listId: string) => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}

	return new URL(
		`${endpoints.listItems}/${listId}/items`,
		supabaseUrl,
	).toString();
};

const buildPostItemsBulkEndpoint = (listId: string) => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}

	return new URL(
		`${endpoints.postItemsBulk}/lists/${listId}/items/bulk`,
		supabaseUrl,
	).toString();
};

const buildPatchListItemCheckEndpoint = (listId: string, itemId: string) => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}

	return new URL(
		`${endpoints.listItems}/${listId}/items/${itemId}/check`,
		supabaseUrl,
	).toString();
};

const buildDeleteListItemEndpoint = (listId: string, itemId: string) => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}

	return new URL(
		`${endpoints.listItems}/${listId}/items/${itemId}`,
		supabaseUrl,
	).toString();
};

const buildDeleteCompletedListItemsEndpoint = (listId: string) => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	if (!supabaseUrl) {
		throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
	}

	return new URL(
		`${endpoints.listItems}/${listId}/items/completed`,
		supabaseUrl,
	).toString();
};

export const getLists = async (
	params?: GetListsParams,
): Promise<GetListsResponse> => {
	const normalized = normalizeGetListsParams(params);
	const accessToken = await getAccessToken();
	const endpoint = buildEdgeEndpoint(normalized);

	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	const rawBody = (await response.json()) as GetListsResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się pobrać list.");
	}

	const parsedBody = rawBody as GetListsResponse;
	return {
		data: Array.isArray(parsedBody.data) ? parsedBody.data : [],
		total: typeof parsedBody.total === "number" ? parsedBody.total : 0,
	};
};

/** Cienki wrapper — `scope=owned` (Moje listy). */
export const getOwnedLists = async (
	params?: Omit<GetListsParams, "scope">,
): Promise<GetListsResponse> => getLists({ ...params, scope: "owned" });

/** Listy współdzielone — `scope=shared` (członek, nie właściciel). */
export const getSharedLists = async (
	params?: Omit<GetListsParams, "scope">,
): Promise<GetListsResponse> => getLists({ ...params, scope: "shared" });

export const createList = async (
	input: CreateListInput,
): Promise<ListSummary> => {
	const accessToken = await getAccessToken();
	const endpoint = getListsBaseUrl();

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify(input),
	});

	const rawBody = (await response.json()) as ListSummary | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się utworzyć listy.");
	}

	return rawBody as ListSummary;
};

export const getListMembers = async (
	listId: string,
): Promise<GetListMembersResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListMembersEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	const rawBody = (await response.json()) as
		GetListMembersResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się pobrać członków listy.");
	}

	const parsed = rawBody as GetListMembersResponse;
	return {
		data: Array.isArray(parsed.data) ? parsed.data : [],
	};
};

export const removeListMember = async (
	listId: string,
	userId: string,
): Promise<void> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListMemberByUserEndpoint(listId, userId);

	const response = await fetch(endpoint, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	if (response.status === 204) {
		return;
	}

	let rawBody: ErrorResponse | null = null;
	try {
		rawBody = (await response.json()) as ErrorResponse;
	} catch {
		rawBody = null;
	}

	if (!response.ok) {
		const apiMessage = rawBody?.error?.message;
		throw new Error(
			apiMessage ?? "Nie udało się zaktualizować członków listy.",
		);
	}
};

export const getListDetails = async (
	listId: string,
): Promise<GetListByIdResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListByIdEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	const rawBody = (await response.json()) as
		GetListByIdResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się pobrać listy.");
	}

	return rawBody as GetListByIdResponse;
};

export const patchListName = async (
	listId: string,
	input: PatchListNameInput,
): Promise<GetListByIdResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListByIdEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify(input),
	});

	const rawBody = (await response.json()) as
		GetListByIdResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się zaktualizować nazwy listy.");
	}

	return rawBody as GetListByIdResponse;
};

export const deleteList = async (listId: string): Promise<void> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListByIdEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	if (response.status === 204) {
		return;
	}

	let rawBody: ErrorResponse | null = null;
	try {
		rawBody = (await response.json()) as ErrorResponse;
	} catch {
		rawBody = null;
	}

	if (!response.ok) {
		const apiMessage = rawBody?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się usunąć listy.");
	}
};

export const getListItems = async (
	listId: string,
): Promise<GetListItemsResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListItemsEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	const rawBody = (await response.json()) as
		GetListItemsResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się pobrać elementów listy.");
	}

	const parsedBody = rawBody as GetListItemsResponse;
	return {
		data: Array.isArray(parsedBody.data) ? parsedBody.data : [],
	};
};

export const bulkCreateListItems = async (
	listId: string,
	input: BulkCreateListItemsInput,
): Promise<BulkCreateListItemsResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildPostItemsBulkEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify(input),
	});

	const rawBody = (await response.json()) as
		BulkCreateListItemsResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się dodać elementów.");
	}

	const parsedBody = rawBody as BulkCreateListItemsResponse;
	return {
		data: Array.isArray(parsedBody.data) ? parsedBody.data : [],
	};
};

export const patchListItemCheck = async (
	listId: string,
	itemId: string,
	input: PatchListItemCheckInput,
): Promise<PatchListItemCheckResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildPatchListItemCheckEndpoint(listId, itemId);

	const response = await fetch(endpoint, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify(input),
	});

	const rawBody = (await response.json()) as
		PatchListItemCheckResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się zaktualizować elementu.");
	}

	return rawBody as PatchListItemCheckResponse;
};

export const deleteListItem = async (
	listId: string,
	itemId: string,
): Promise<void> => {
	const accessToken = await getAccessToken();
	const endpoint = buildDeleteListItemEndpoint(listId, itemId);

	const response = await fetch(endpoint, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	if (response.status === 204) {
		return;
	}

	let rawBody: ErrorResponse | null = null;
	try {
		rawBody = (await response.json()) as ErrorResponse;
	} catch {
		rawBody = null;
	}

	if (!response.ok) {
		const apiMessage = rawBody?.error?.message;
		throw new Error(apiMessage ?? "Nie udało się usunąć elementu.");
	}
};

const parseListInvitationError = async (response: Response): Promise<never> => {
	const retryAfter = response.headers.get("Retry-After");
	const retryAfterSeconds =
		retryAfter != null && retryAfter !== ""
			? Number.parseInt(retryAfter, 10)
			: undefined;

	let raw: ErrorResponse | null = null;
	try {
		raw = (await response.json()) as ErrorResponse;
	} catch {
		raw = null;
	}
	const code = raw?.error?.code ?? "unknown";
	const message =
		raw?.error?.message ?? "Nie udało się utworzyć zaproszenia do listy.";

	throw new ListsApiError(message, {
		code,
		status: response.status,
		retryAfterSeconds: Number.isFinite(retryAfterSeconds)
			? retryAfterSeconds
			: undefined,
	});
};

const parseJoinListByInvitationError = async (
	response: Response,
): Promise<never> => {
	let raw: ErrorResponse | null = null;
	try {
		raw = (await response.json()) as ErrorResponse;
	} catch {
		raw = null;
	}
	const code = raw?.error?.code ?? "unknown";
	const message =
		raw?.error?.message ?? "Nie udało się dołączyć do listy po kodzie.";

	throw new ListsApiError(message, { code, status: response.status });
};

/**
 * Utworzenie / rotacja kodu zaproszenia (Edge, `pusty` JSON `{}`).
 * Rate limit: 1 na 10 min na (lista, użytkownik) → może zwrócić 429.
 */
export const createListInvitation = async (
	listId: string,
): Promise<CreateListInvitationResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListInvitationsEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		await parseListInvitationError(response);
	}

	const rawBody = (await response.json()) as
		CreateListInvitationResponse | ErrorResponse;
	return rawBody as CreateListInvitationResponse;
};

/**
 * Dołączenie zalogowanego użytkownika do listy po 6-znakowym kodzie (Edge + RPC).
 */
export const joinListByInvitation = async (
	code: string,
): Promise<JoinListByInvitationResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildListInvitationsJoinEndpoint();

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
		body: JSON.stringify({ code: code.trim() }),
	});

	if (!response.ok) {
		await parseJoinListByInvitationError(response);
	}

	const rawBody = (await response.json()) as
		JoinListByInvitationResponse | ErrorResponse;
	return rawBody as JoinListByInvitationResponse;
};

export const deleteCompletedListItems = async (
	listId: string,
): Promise<DeleteCompletedListItemsResponse> => {
	const accessToken = await getAccessToken();
	const endpoint = buildDeleteCompletedListItemsEndpoint(listId);

	const response = await fetch(endpoint, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
			apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
		},
	});

	const rawBody = (await response.json()) as
		DeleteCompletedListItemsResponse | ErrorResponse;
	if (!response.ok) {
		const apiMessage = (rawBody as ErrorResponse)?.error?.message;
		throw new Error(
			apiMessage ?? "Nie udało się usunąć zaznaczonych elementów.",
		);
	}

	const parsedBody = rawBody as DeleteCompletedListItemsResponse;
	return {
		deleted_count:
			typeof parsedBody.deleted_count === "number"
				? parsedBody.deleted_count
				: 0,
	};
};
