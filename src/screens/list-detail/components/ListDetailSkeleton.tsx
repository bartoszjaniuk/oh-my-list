import { Skeleton } from "@/components/ui/skeleton";
import { View } from "react-native";

export function ListDetailSkeleton() {
	return (
		<View className="gap-3 p-6">
			<Skeleton className="h-5 w-[60%]" />
			<Skeleton className="h-4 w-[40%]" />
			<Skeleton className="mt-4 h-12 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</View>
	);
}
