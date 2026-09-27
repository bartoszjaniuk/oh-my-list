import type { BottomSheetModal } from "@expo/ui/community/bottom-sheet";
import { useEffect, useRef } from "react";

/**
 * Keeps a BottomSheetModal ref in sync with a controlled `visible` flag.
 */
export function useControlledBottomSheetModal(visible: boolean) {
	const sheetRef = useRef<BottomSheetModal>(null);

	useEffect(() => {
		if (visible) {
			sheetRef.current?.present();
			return;
		}
		sheetRef.current?.dismiss();
	}, [visible]);

	return sheetRef;
}
