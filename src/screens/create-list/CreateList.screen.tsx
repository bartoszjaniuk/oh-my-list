import { BodyScrollView } from "@/components/body-scroll-view";
import { GoBackButton } from "@/components/go-back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { ListTypeSelectRow } from "./components/ListTypeSelectRow";
import { LIST_TYPE_OPTIONS } from "./consts";
import { useCreateListScreen } from "./hooks/useCreateListScreen";

export function CreateListScreen() {
	const {
		control,
		canSubmit,
		createError,
		isCreating,
		onSubmit,
		clearCreateError,
	} = useCreateListScreen();

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "Nowa lista",
					headerLeft: () => <GoBackButton />,
				}}
			/>
			<BodyScrollView contentContainerClassName="gap-6 p-6">
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
								<Text className="text-sm text-destructive">{error.message}</Text>
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
								<Text className="text-sm text-destructive">{error.message}</Text>
							) : null}
						</View>
					)}
				/>

				{createError != null ? (
					<View className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
						<Text className="text-sm text-destructive">{createError}</Text>
					</View>
				) : null}

				<Button disabled={!canSubmit} onPress={onSubmit}>
					<Text>{isCreating ? "Tworzenie…" : "Utwórz listę"}</Text>
				</Button>
			</BodyScrollView>
		</>
	);
}
