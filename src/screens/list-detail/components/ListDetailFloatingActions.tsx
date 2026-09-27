import {
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

const FAB_SIZE = 56;
const PILL_HEIGHT = 44;
const PILL_RADIUS = PILL_HEIGHT / 2;
const STACK_GAP = 12;
/** Minimum lift above the home-indicator / soft keys on stack screens (no tab bar). */
const MIN_BOTTOM_INSET = 12;

type ListDetailFloatingActionsProps = {
	checkedItemsCount: number;
	isClearPending?: boolean;
	isClearDisabled?: boolean;
	isAddDisabled?: boolean;
	onClearCompletedPress: () => void;
	onAddPress: () => void;
};

export function ListDetailFloatingActions({
	checkedItemsCount,
	isClearPending = false,
	isClearDisabled = false,
	isAddDisabled = false,
	onClearCompletedPress,
	onAddPress,
}: ListDetailFloatingActionsProps) {
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const theme = THEME[colorScheme === "dark" ? "dark" : "light"];
	const primaryColor = theme.primary;
	const useGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
	const clearDisabled = isClearDisabled || isClearPending;
	const showClear = checkedItemsCount > 0;

	return (
		<View
			pointerEvents="box-none"
			className="absolute right-4 z-50 items-end"
			style={{
				bottom: Math.max(insets.bottom, MIN_BOTTOM_INSET),
				gap: STACK_GAP,
			}}
		>
			{showClear ? (
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`Wyczyść zaznaczone elementy, ${checkedItemsCount}`}
					accessibilityState={{ disabled: clearDisabled, busy: isClearPending }}
					disabled={clearDisabled}
					onPress={onClearCompletedPress}
					className="active:opacity-90"
				>
					<GlassView
						glassEffectStyle={useGlass ? "regular" : "none"}
						isInteractive={useGlass && !clearDisabled}
						style={{
							minHeight: PILL_HEIGHT,
							borderRadius: PILL_RADIUS,
							borderCurve: "continuous",
							paddingHorizontal: 16,
							alignItems: "center",
							justifyContent: "center",
							opacity: clearDisabled ? 0.55 : 1,
							backgroundColor: useGlass ? undefined : theme.secondary,
						}}
					>
						<Text className="text-sm font-semibold text-foreground">
							{isClearPending
								? "Czyszczenie…"
								: `Wyczyść (${checkedItemsCount})`}
						</Text>
					</GlassView>
				</Pressable>
			) : null}

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Dodaj produkty"
				accessibilityState={{ disabled: isAddDisabled }}
				disabled={isAddDisabled}
				onPress={onAddPress}
				className="active:opacity-90"
			>
				<GlassView
					tintColor={useGlass ? primaryColor : undefined}
					glassEffectStyle={useGlass ? "regular" : "none"}
					isInteractive={useGlass && !isAddDisabled}
					style={{
						width: FAB_SIZE,
						height: FAB_SIZE,
						borderRadius: FAB_SIZE / 2,
						alignItems: "center",
						justifyContent: "center",
						opacity: isAddDisabled ? 0.55 : 1,
						backgroundColor: useGlass ? undefined : primaryColor,
					}}
				>
					<Icon
						as={Plus}
						size={28}
						strokeWidth={1.4}
						className="text-primary-foreground"
					/>
				</GlassView>
			</Pressable>
		</View>
	);
}
