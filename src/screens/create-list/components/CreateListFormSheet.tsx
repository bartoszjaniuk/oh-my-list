import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";
import {
	BottomSheetModal,
	BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { LIST_TYPE_OPTIONS } from "../consts";
import { useCreateList } from "../hooks/useCreateList";
import { ListTypeSelectRow } from "./ListTypeSelectRow";

type CreateListFormSheetProps = {
	visible: boolean;
	onClose: () => void;
	onCreated: (listId: string) => void;
};

export function CreateListFormSheet({
	visible,
	onClose,
	onCreated,
}: CreateListFormSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const {
		control,
		canSubmit,
		createError,
		isCreating,
		onSubmit,
		clearCreateError,
		resetForm,
	} = useCreateList({ onCreated });

	useEffect(() => {
		if (!visible) {
			resetForm();
		}
	}, [visible, resetForm]);

	const handleClose = () => {
		if (isCreating) {
			return;
		}
		onClose();
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isCreating}
			enableDynamicSizing
			onClose={handleClose}
		>
			<BottomSheetScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 40,
					paddingTop: 8,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<Text variant="large" className="mb-4">
					Utwórz listę
				</Text>
				<View className="gap-5">
					<Controller
						control={control}
						name="name"
						render={({
							field: { onChange, value, onBlur },
							fieldState: { error },
						}) => (
							<View className="gap-1.5">
								<Text className="text-sm text-muted-foreground">
									Nazwa listy
								</Text>
								<Input
									value={value}
									onBlur={onBlur}
									onChangeText={(text) => {
										onChange(text);
										clearCreateError();
									}}
									placeholder="np. Zakupy na weekend"
									editable={!isCreating}
									autoCapitalize="sentences"
									autoCorrect
									accessibilityLabel="Nazwa listy"
									returnKeyType="done"
								/>
								{error?.message ? (
									<Text className="text-sm text-destructive">
										{error.message}
									</Text>
								) : null}
							</View>
						)}
					/>

					<Controller
						control={control}
						name="type"
						render={({
							field: { onChange, value },
							fieldState: { error },
						}) => (
							<View className="gap-2" accessibilityRole="radiogroup">
								<Text className="text-sm text-muted-foreground">
									Typ listy
								</Text>
								{LIST_TYPE_OPTIONS.map((option) => (
									<ListTypeSelectRow
										key={option.id}
										option={option}
										selected={value === option.id}
										disabled={isCreating}
										onSelect={() => {
											onChange(option.id);
											clearCreateError();
										}}
									/>
								))}
								{error?.message ? (
									<Text className="text-sm text-destructive">
										{error.message}
									</Text>
								) : null}
							</View>
						)}
					/>

					{createError != null ? (
						<View className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/40">
							<Text className="text-sm text-amber-900 dark:text-amber-100">
								{createError}
							</Text>
						</View>
					) : null}

					<Button
						disabled={!canSubmit}
						onPress={onSubmit}
						accessibilityLabel="Utwórz listę"
					>
						{isCreating ? (
							<ActivityIndicator size="small" color="#FFFFFF" />
						) : null}
						<Text>{isCreating ? "Tworzenie…" : "Utwórz listę"}</Text>
					</Button>

					<Button
						variant="ghost"
						disabled={isCreating}
						onPress={handleClose}
					>
						<Text>Anuluj</Text>
					</Button>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}
