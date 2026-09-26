export const DEFAULT_LIMIT = 50;
export const DEFAULT_OFFSET = 0;

/** Zgodne z `INVITE_DEEP_LINK_PREFIX` w Edge; musi kończyć się na `/`. */
const DEFAULT_INVITE_DEEP_LINK_PREFIX = "listastic://invite/";

const normalizeInvitePrefix = (raw: string) =>
	raw.endsWith("/") ? raw : `${raw}/`;

/**
 * Składa link deep linka do zaproszenia; używane przy odczycie z tabeli `invitations` (kolumna `code`).
 * Ustaw `EXPO_PUBLIC_INVITE_DEEP_LINK_PREFIX` jeśli ma być inny niż domyślny.
 */
export const buildInviteLink = (code: string): string => {
	const prefix = normalizeInvitePrefix(
		process.env.EXPO_PUBLIC_INVITE_DEEP_LINK_PREFIX ??
			DEFAULT_INVITE_DEEP_LINK_PREFIX,
	);
	return `${prefix}${code}`;
};
