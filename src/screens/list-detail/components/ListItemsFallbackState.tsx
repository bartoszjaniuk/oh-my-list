import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

type ListItemsFallbackStateProps = {
	isInitialLoading: boolean;
	isError: boolean;
	error: unknown;
	onRefetch: () => void;
	hasNoItems: boolean;
};

function ItemRowSkeleton() {
	return (
		<View className="flex-row items-center gap-3 border-b border-border py-3">
			<Skeleton className="h-5 w-5 rounded" />
			<Skeleton className="h-4 flex-1" />
		</View>
	);
}

export function ListItemsFallbackState({
	isInitialLoading,
	isError,
	error,
	onRefetch,
	hasNoItems,
}: ListItemsFallbackStateProps) {
	if (isInitialLoading) {
		return (
			<View className="gap-0">
				<ItemRowSkeleton />
				<ItemRowSkeleton />
				<ItemRowSkeleton />
			</View>
		);
	}

	if (isError) {
		return (
			<View className="items-center justify-center gap-4 px-2 py-10">
				<Text variant="large" className="text-center">
					Nie udało się pobrać elementów
				</Text>
				<Text variant="muted" className="text-center">
					{error instanceof Error
						? error.message
						: "Spróbuj ponownie za chwilę."}
				</Text>
				<Button onPress={onRefetch}>
					<Text>Odśwież elementy</Text>
				</Button>
			</View>
		);
	}

	if (hasNoItems) {
		return (
			<View className="items-center justify-center gap-2 px-2 py-10">
				<Text variant="large" className="text-center">
					Brak elementów
				</Text>
				<Text variant="muted" className="text-center">
					Dodaj pierwsze pozycje przyciskiem + na dole ekranu.
				</Text>
			</View>
		);
	}

	return null;
}
