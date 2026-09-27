import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
	BottomSheetModal,
	BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { View } from "react-native";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";

type ListSettingsSheetProps = {
	visible: boolean;
	draftName: string;
	listNameMaxLength: number;
	isOwner: boolean;
	canActOnOwnership: boolean;
	canSubmitRename: boolean;
	isRenamePending: boolean;
	isBusy: boolean;
	renameErrorMessage: string | null;
	ownershipErrorMessage: string | null;
	onClose: () => void;
	onDraftNameChange: (value: string) => void;
	onSubmitRename: () => void;
	onOwnershipActionPress: () => void;
};

export function ListSettingsSheet({
	visible,
	draftName,
	listNameMaxLength,
	isOwner,
	canActOnOwnership,
	canSubmitRename,
	isRenamePending,
	isBusy,
	renameErrorMessage,
	ownershipErrorMessage,
	onClose,
	onDraftNameChange,
	onSubmitRename,
	onOwnershipActionPress,
}: ListSettingsSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isBusy}
			enableDynamicSizing
			onClose={() => {
				if (!isBusy) {
					onClose();
				}
			}}
		>
			<BottomSheetView
				style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
			>
				<Text variant="large" className="mb-4">
					Ustawienia listy
				</Text>
				<View className="gap-4">
					<View className="gap-2">
						<Text className="text-base font-semibold text-foreground">
							Nazwa
						</Text>
						<Input
							value={draftName}
							onChangeText={onDraftNameChange}
							placeholder="Nazwa listy"
							editable={!isBusy}
							maxLength={listNameMaxLength}
							autoCapitalize="sentences"
							returnKeyType="done"
							onSubmitEditing={onSubmitRename}
						/>
					</View>

					{renameErrorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">
								{renameErrorMessage}
							</Text>
						</View>
					) : null}

					{ownershipErrorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">
								{ownershipErrorMessage}
							</Text>
						</View>
					) : null}

					<Button
						disabled={!canSubmitRename || isBusy}
						onPress={onSubmitRename}
						accessibilityLabel="Zapisz nazwę listy"
					>
						<Text>{isRenamePending ? "Zapisywanie…" : "Zapisz nazwę"}</Text>
					</Button>

					<Button
						variant="destructive"
						disabled={isBusy || !canActOnOwnership}
						onPress={onOwnershipActionPress}
						accessibilityLabel={isOwner ? "Usuń listę" : "Opuść listę"}
					>
						<Text>{isOwner ? "Usuń listę" : "Opuść listę"}</Text>
					</Button>

					<Button variant="ghost" disabled={isBusy} onPress={onClose}>
						<Text>Zamknij</Text>
					</Button>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}
