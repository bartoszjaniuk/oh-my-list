export function errorMessage(
	error: unknown,
	fallback = "Spróbuj ponownie za chwilę.",
): string {
	if (error instanceof Error && error.message.length > 0) {
		return error.message;
	}
	return fallback;
}
