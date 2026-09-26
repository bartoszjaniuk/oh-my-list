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
import { THEME } from "@/lib/theme";

const FAB_SIZE = 56;
/** Approximate native tab bar height so the FAB sits above it. */
const TAB_BAR_OFFSET = 64;

type FloatingButtonProps = {
	onPress?: () => void;
};

export function FloatingButton({ onPress }: FloatingButtonProps) {
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	const theme = THEME[colorScheme === "dark" ? "dark" : "light"];
	const primaryColor = theme.primary;
	const useGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

	return (
		<View
			pointerEvents="box-none"
			className="absolute right-4 z-50"
			style={{
				bottom: TAB_BAR_OFFSET + Math.max(insets.bottom, 8),
			}}
		>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Dodaj"
				onPress={onPress}
				className="active:opacity-90"
			>
				<GlassView
					tintColor={useGlass ? primaryColor : undefined}
					glassEffectStyle={useGlass ? "regular" : "none"}
					isInteractive={useGlass}
					style={{
						width: FAB_SIZE,
						height: FAB_SIZE,
						borderRadius: FAB_SIZE / 2,
						alignItems: "center",
						justifyContent: "center",
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
