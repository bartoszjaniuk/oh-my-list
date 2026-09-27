import { Host } from "@expo/ui";
import {
	AlertDialog,
	Text,
	TextButton,
} from "@expo/ui/jetpack-compose";
import type { NativeDestructiveConfirmProps } from "./native-destructive-confirm.types";

/**
 * Native Android confirmation (Material AlertDialog) via `@expo/ui`.
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
	if (!visible) {
		return null;
	}

	return (
		<Host matchContents>
			<AlertDialog
				onDismissRequest={() => {
					if (!isPending) {
						onCancel();
					}
				}}
				properties={{
					dismissOnBackPress: !isPending,
					dismissOnClickOutside: !isPending,
				}}
			>
				<AlertDialog.Title>
					<Text>{title}</Text>
				</AlertDialog.Title>
				{message ? (
					<AlertDialog.Text>
						<Text>{message}</Text>
					</AlertDialog.Text>
				) : null}
				<AlertDialog.ConfirmButton>
					<TextButton
						enabled={!isPending}
						onClick={onConfirm}
						colors={{ contentColor: "#DC2626" }}
					>
						<Text>{isPending ? pendingLabel : confirmLabel}</Text>
					</TextButton>
				</AlertDialog.ConfirmButton>
				<AlertDialog.DismissButton>
					<TextButton enabled={!isPending} onClick={onCancel}>
						<Text>Anuluj</Text>
					</TextButton>
				</AlertDialog.DismissButton>
			</AlertDialog>
		</Host>
	);
}
