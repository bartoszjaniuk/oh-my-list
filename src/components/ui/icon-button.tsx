import { cn } from "@/lib/utils";
import {
	GlassView,
	isGlassEffectAPIAvailable,
	isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { LucideIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";
import { Icon } from "./icon";

const GLASS_ICON_SIZE = 40;

type IconButtonProps = {
	as: LucideIcon;
	onPress: () => void;
	accessibilityLabel: string;
	className?: string;
	size?: number;
	strokeWidth?: number;
};

export function IconButton({
	as,
	onPress,
	accessibilityLabel,
	className,
	size = 20,
	strokeWidth = 1.6,
}: IconButtonProps) {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";
	const useGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			className={cn("active:opacity-80", className)}
		>
			{useGlass ? (
				<GlassView
					glassEffectStyle="regular"
					isInteractive
					style={{
						width: GLASS_ICON_SIZE,
						height: GLASS_ICON_SIZE,
						borderRadius: GLASS_ICON_SIZE / 2,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Icon
						as={as}
						size={size}
						strokeWidth={strokeWidth}
						className="text-foreground"
					/>
				</GlassView>
			) : (
				<View
					className={cn(
						"items-center justify-center rounded-full",
						isDark
							? "border border-white/35 bg-white/5"
							: "border border-primary/20 bg-primary/5",
					)}
					style={{
						width: GLASS_ICON_SIZE,
						height: GLASS_ICON_SIZE,
						borderRadius: GLASS_ICON_SIZE / 2,
					}}
				>
					<Icon
						as={as}
						size={size}
						strokeWidth={strokeWidth}
						className="text-foreground"
					/>
				</View>
			)}
		</Pressable>
	);
}

export type { IconButtonProps };
