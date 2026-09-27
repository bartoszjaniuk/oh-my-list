import type { DeleteIntent } from "../helpers/list-items.helpers";
import { NativeDestructiveConfirm } from "./NativeDestructiveConfirm";

type ListDeleteConfirmDialogProps = {
	visible: boolean;
	deleteIntent: DeleteIntent | null;
	isAnyDeletePending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ListDeleteConfirmDialog({
	visible,
	deleteIntent,
	isAnyDeletePending,
	onConfirm,
	onCancel,
}: ListDeleteConfirmDialogProps) {
	const title =
		deleteIntent?.type === "single"
			? "Usunąć element?"
			: "Usunąć zaznaczone elementy?";

	const message =
		deleteIntent?.type === "single"
			? `Czy na pewno chcesz usunąć „${deleteIntent.item.name}”?`
			: deleteIntent?.type === "completed"
				? `Ta operacja usunie ${deleteIntent.checkedCount} zaznaczonych elementów.`
				: undefined;

	return (
		<NativeDestructiveConfirm
			visible={visible && deleteIntent != null}
			title={title}
			message={message}
			confirmLabel="Usuń"
			pendingLabel="Usuwanie…"
			isPending={isAnyDeletePending}
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
}
