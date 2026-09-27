import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Modal, View } from "react-native";
import type { NativeDestructiveConfirmProps } from "./native-destructive-confirm.types";

/**
 * Web / fallback confirmation dialog when native `@expo/ui` dialogs are unavailable.
 */
export function NativeDestructiveConfirm({
	visible,
	title,
	message,
	confirmLabel,
	pendingLabel,
	isPending,
	onConfirm,
	onCancel,
}: NativeDestructiveConfirmProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={() => {
				if (!isPending) {
					onCancel();
				}
			}}
		>
			<View className="flex-1 items-center justify-center bg-black/40 px-6">
				<View className="w-full max-w-sm gap-4 rounded-2xl border border-border bg-background p-5">
					<Text variant="large">{title}</Text>
					{message ? <Text variant="muted">{message}</Text> : null}
					<View className="flex-row justify-end gap-2 pt-1">
						<Button variant="ghost" disabled={isPending} onPress={onCancel}>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							disabled={isPending}
							onPress={onConfirm}
						>
							<Text>{isPending ? pendingLabel : confirmLabel}</Text>
						</Button>
					</View>
				</View>
			</View>
		</Modal>
	);
}
