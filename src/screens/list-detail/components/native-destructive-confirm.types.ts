export type NativeDestructiveConfirmProps = {
	visible: boolean;
	title: string;
	message?: string;
	confirmLabel: string;
	pendingLabel: string;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};
