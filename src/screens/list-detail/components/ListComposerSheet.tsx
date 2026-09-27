import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import {
	BottomSheetModal,
	BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";

/** Readable muted-foreground hex fallbacks — RN placeholderTextColor is unreliable with hsl(). */
const PLACEHOLDER_COLOR = {
	light: "#737373",
	dark: "#a3a3a3",
} as const;

type ListComposerSheetProps = {
	visible: boolean;
	draftItems: string;
	isPending: boolean;
	canSubmitDraftItems: boolean;
	errorMessage: string | null;
	onClose: () => void;
	onDraftItemsChange: (value: string) => void;
	onSubmit: () => void;
};

export function ListComposerSheet({
	visible,
	draftItems,
	isPending,
	canSubmitDraftItems,
	errorMessage,
	onClose,
	onDraftItemsChange,
	onSubmit,
}: ListComposerSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const { colorScheme } = useColorScheme();
	const placeholderColor =
		PLACEHOLDER_COLOR[colorScheme === "dark" ? "dark" : "light"];

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isPending}
			enableDynamicSizing
			onClose={() => {
				if (!isPending) {
					onClose();
				}
			}}
		>
			<BottomSheetView
				style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
			>
				<Text variant="large" className="mb-4">
					Dodaj do listy
				</Text>
				<View className="gap-4">
					<Textarea
						value={draftItems}
						onChangeText={onDraftItemsChange}
						placeholder="Wpisz produkty, każdy w nowej linii lub po przecinku"
						editable={!isPending}
						maxLength={2000}
						placeholderTextColor={placeholderColor}
						className="min-h-28 border-2 border-border bg-muted"
						placeholderClassName="text-muted-foreground"
					/>
					{errorMessage ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">{errorMessage}</Text>
						</View>
					) : null}
					<Button
						disabled={!canSubmitDraftItems || isPending}
						onPress={onSubmit}
						accessibilityLabel="Dodaj produkty"
					>
						<Text>{isPending ? "Dodawanie…" : "Dodaj"}</Text>
					</Button>
					<Button variant="ghost" disabled={isPending} onPress={onClose}>
						<Text>Anuluj</Text>
					</Button>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}
