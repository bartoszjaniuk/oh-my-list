import type { ListOwnershipIntent } from "../hooks/useListSettings";
import { NativeDestructiveConfirm } from "./NativeDestructiveConfirm";

type ListOwnershipConfirmDialogProps = {
	visible: boolean;
	ownershipIntent: ListOwnershipIntent | null;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ListOwnershipConfirmDialog({
	visible,
	ownershipIntent,
	isPending,
	onConfirm,
	onCancel,
}: ListOwnershipConfirmDialogProps) {
	const isDelete = ownershipIntent === "delete";
	const title = isDelete ? "Usunąć listę?" : "Opuścić listę?";
	const message = isDelete
		? "Ta operacja trwale usunie listę i wszystkie jej elementy."
		: "Po opuszczeniu lista zniknie z Twoich list współdzielonych.";
	const confirmLabel = isDelete ? "Usuń listę" : "Opuść listę";
	const pendingLabel = isDelete ? "Usuwanie…" : "Opuszczanie…";

	return (
		<NativeDestructiveConfirm
			visible={visible && ownershipIntent != null}
			title={title}
			message={message}
			confirmLabel={confirmLabel}
			pendingLabel={pendingLabel}
			isPending={isPending}
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
}
