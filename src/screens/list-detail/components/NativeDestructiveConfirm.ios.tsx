import { Host } from "@expo/ui";
import { Alert, Button, Text } from "@expo/ui/swift-ui";
import { useRef } from "react";
import type { NativeDestructiveConfirmProps } from "./native-destructive-confirm.types";

/**
 * Native iOS confirmation — centered system Alert via `@expo/ui`.
 * Host is mounted only while presented so it cannot block list scrolling/touches.
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
	const didConfirmRef = useRef(false);

	if (!visible) {
		return null;
	}

	return (
		<Host
			matchContents
			pointerEvents="none"
			style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
		>
			<Alert
				title={title}
				isPresented={visible}
				onIsPresentedChange={(isPresented) => {
					if (isPresented) {
						return;
					}
					if (didConfirmRef.current) {
						didConfirmRef.current = false;
						return;
					}
					if (!isPending) {
						onCancel();
					}
				}}
			>
				<Alert.Trigger>
					<Button label="" />
				</Alert.Trigger>
				<Alert.Actions>
					<Button
						label={isPending ? pendingLabel : confirmLabel}
						role="destructive"
						onPress={() => {
							if (isPending) {
								return;
							}
							didConfirmRef.current = true;
							onConfirm();
						}}
					/>
					<Button
						label="Anuluj"
						role="cancel"
						onPress={() => {
							if (!isPending) {
								onCancel();
							}
						}}
					/>
				</Alert.Actions>
				{message ? (
					<Alert.Message>
						<Text>{message}</Text>
					</Alert.Message>
				) : null}
			</Alert>
		</Host>
	);
}
