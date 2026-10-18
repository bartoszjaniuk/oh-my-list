import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";
import {
	BottomSheetModal,
	BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import { useState } from "react";
import { View } from "react-native";

type CreateListSheetProps = {
	visible: boolean;
	onClose: () => void;
	onCreateNew: () => void;
};

export function CreateListSheet({
	visible,
	onClose,
	onCreateNew,
}: CreateListSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const [joinCode, setJoinCode] = useState("");

	const handleClose = () => {
		setJoinCode("");
		onClose();
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose
			enableDynamicSizing
			onClose={handleClose}
		>
			<BottomSheetScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 40,
					paddingTop: 8,
				}}
			>
				<Text variant="large" className="mb-4">
					Nowa lista
				</Text>
				<View className="gap-5">
					<Button
						onPress={onCreateNew}
						accessibilityLabel="Utwórz nową listę"
					>
						<Text>Utwórz nową listę</Text>
					</Button>

					<View className="flex-row items-center">
						<Separator className="flex-1" />
						<Text className="px-3 text-sm text-muted-foreground">
							lub dołącz do istniejącej
						</Text>
						<Separator className="flex-1" />
					</View>

					<Input
						value={joinCode}
						onChangeText={setJoinCode}
						placeholder="wprowadź kod"
						autoCapitalize="characters"
						autoCorrect={false}
						accessibilityLabel="Kod zaproszenia do listy"
					/>

					<Button
						onPress={() => {
							// TODO: redeem invitation / join list
						}}
						accessibilityLabel="Dołącz do listy"
					>
						<Text>Dołącz do listy</Text>
					</Button>

					<Button
						variant="outline"
						onPress={() => {
							// TODO: open QR scanner
						}}
						accessibilityLabel="Zeskanuj kod QR"
					>
						<Text>Zeskanuj kod QR</Text>
					</Button>

					<Button variant="ghost" onPress={handleClose}>
						<Text>Zamknij</Text>
					</Button>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}
