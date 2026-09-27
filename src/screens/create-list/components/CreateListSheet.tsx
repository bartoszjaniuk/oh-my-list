import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";
import {
	BottomSheetModal,
	BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { LIST_TYPE_OPTIONS } from "../consts";
import { useCreateList } from "../hooks/useCreateList";
import { ListTypeSelectRow } from "./ListTypeSelectRow";

type CreateListSheetProps = {
	visible: boolean;
	onClose: () => void;
};

export function CreateListSheet({ visible, onClose }: CreateListSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const {
		control,
		canSubmit,
		createError,
		isCreating,
		onSubmit,
		clearCreateError,
		resetForm,
	} = useCreateList({
		onCreated: onClose,
	});

	const handleClose = () => {
		if (isCreating) return;
		resetForm();
		onClose();
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isCreating}
			enableDynamicSizing
			onClose={() => {
				if (!isCreating) {
					resetForm();
					onClose();
				}
			}}
		>
			<BottomSheetView
				style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
			>
				<Text variant="large" className="mb-4">
					Nowa lista
				</Text>
				<View className="gap-4">
					<Controller
						control={control}
						name="name"
						render={({
							field: { onChange, onBlur, value },
							fieldState: { error },
						}) => (
							<View className="gap-2">
								<Text className="text-base font-semibold text-foreground">
									Nazwa
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
									returnKeyType="done"
									aria-invalid={error != null}
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
							<View className="gap-2">
								<Text className="text-base font-semibold text-foreground">
									Typ
								</Text>
								<View className="gap-2">
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
								</View>
								{error?.message ? (
									<Text className="text-sm text-destructive">
										{error.message}
									</Text>
								) : null}
							</View>
						)}
					/>

					{createError != null ? (
						<View className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
							<Text className="text-sm text-destructive">{createError}</Text>
						</View>
					) : null}

					<Button
						disabled={!canSubmit}
						onPress={onSubmit}
						accessibilityLabel="Utwórz listę"
					>
						<Text>{isCreating ? "Tworzenie…" : "Utwórz listę"}</Text>
					</Button>
					<Button variant="ghost" disabled={isCreating} onPress={handleClose}>
						<Text>Anuluj</Text>
					</Button>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}
