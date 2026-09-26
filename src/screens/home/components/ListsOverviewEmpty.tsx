import type { ListScope } from "@/api/lists/lists.models";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

type ListsOverviewEmptyProps = {
	segment: ListScope;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	onRefresh: () => void;
};

function ListCardSkeleton() {
	return (
		<View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
			<Skeleton className="h-11 w-11 rounded-2xl" />
			<View className="min-w-0 flex-1 gap-1.5">
				<Skeleton className="h-4 w-[75%]" />
				<Skeleton className="h-3 w-[40%]" />
			</View>
		</View>
	);
}

export function ListsOverviewEmpty({
	segment,
	isLoading,
	isError,
	error,
	onRefresh,
}: ListsOverviewEmptyProps) {
	if (isLoading) {
		return (
			<View>
				<ListCardSkeleton />
				<ListCardSkeleton />
				<ListCardSkeleton />
			</View>
		);
	}

	if (isError) {
		return (
			<View className="flex-1 items-center justify-center gap-4 px-6 py-10">
				<Text variant="large" className="text-center">
					Nie udało się pobrać list
				</Text>
				<Text variant="muted" className="text-center">
					{error instanceof Error
						? error.message
						: "Spróbuj ponownie za chwilę."}
				</Text>
				<Button onPress={onRefresh}>
					<Text>Odśwież</Text>
				</Button>
			</View>
		);
	}

	const isOwned = segment === "owned";

	return (
		<View className="flex-1 items-center justify-center gap-2 px-6 py-10">
			<Text variant="large" className="text-center">
				{isOwned ? "Brak list" : "Brak współdzielonych list"}
			</Text>
			<Text variant="muted" className="text-center">
				{isOwned
					? "Utwórz pierwszą listę przez przycisk + i wróć tutaj."
					: "Dołącz do listy kodem ze strony głównej."}
			</Text>
		</View>
	);
}
