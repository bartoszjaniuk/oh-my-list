import type { ListItem } from "@/api/lists/lists.models";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { View } from "react-native";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";

type ListItemDetailsSheetProps = {
	visible: boolean;
	selectedItem: ListItem | null;
	isDeletePending: boolean;
	isAnyDeletePending: boolean;
	deleteIntentItemId?: string;
	onClose: () => void;
	onDeletePress: (item: ListItem) => void;
};

function DetailField({ label, value }: { label: string; value: string }) {
	return (
		<View className="rounded-lg border border-border bg-muted/40 px-4 py-3">
			<Text variant="muted">{label}</Text>
			<Text className="pt-1">{value}</Text>
		</View>
	);
}

export function ListItemDetailsSheet({
	visible,
	selectedItem,
	isDeletePending,
	isAnyDeletePending,
	deleteIntentItemId,
	onClose,
	onDeletePress,
}: ListItemDetailsSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const isDeletingThisItem =
		isDeletePending && deleteIntentItemId === selectedItem?.id;

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isAnyDeletePending}
			enableDynamicSizing
			onClose={() => {
				if (!isAnyDeletePending) {
					onClose();
				}
			}}
		>
			<BottomSheetView style={{ paddingHorizontal: 24, paddingTop: 8, maxHeight: "80%" }}>
				<Text variant="large" className="mb-4">
					Szczegóły pozycji
				</Text>
				{selectedItem ? (
					<BottomSheetScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
					>
						<DetailField label="Nazwa" value={selectedItem.name} />
						<DetailField
							label="Kategoria"
							value={selectedItem.category_name || "Inne"}
						/>
						{selectedItem.quantity ? (
							<DetailField label="Ilość" value={selectedItem.quantity} />
						) : null}
						{selectedItem.note ? (
							<DetailField label="Notatka" value={selectedItem.note} />
						) : null}
						{selectedItem.link ? (
							<DetailField label="Link" value={selectedItem.link} />
						) : null}
						<DetailField
							label="Status"
							value={
								selectedItem.is_checked
									? "Odznaczone jako kupione"
									: "Do kupienia"
							}
						/>
						<Button
							variant="destructive"
							disabled={isAnyDeletePending}
							onPress={() => onDeletePress(selectedItem)}
							className="mt-2"
						>
							<Text>
								{isDeletingThisItem ? "Usuwanie…" : "Usuń element"}
							</Text>
						</Button>
						<Button
							variant="ghost"
							disabled={isAnyDeletePending}
							onPress={onClose}
						>
							<Text>Zamknij</Text>
						</Button>
					</BottomSheetScrollView>
				) : null}
			</BottomSheetView>
		</BottomSheetModal>
	);
}
