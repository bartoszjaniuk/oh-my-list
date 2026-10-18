import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

type ScreenQueryProps<TData, TError = Error> = {
	query: UseQueryResult<TData, TError>;
	loading: ReactNode;
	error: (
		error: TError,
		helpers: { refetch: UseQueryResult<TData, TError>["refetch"] },
	) => ReactNode;
	children: (data: TData) => ReactNode;
};

export function ScreenQuery<TData, TError = Error>({
	query,
	loading,
	error,
	children,
}: ScreenQueryProps<TData, TError>) {
	if (query.data !== undefined) {
		return <>{children(query.data)}</>;
	}

	if (query.isError) {
		return <>{error(query.error, { refetch: query.refetch })}</>;
	}

	return <>{loading}</>;
}
