import type { ReactNode } from "react";
import { View } from "react-native";
import { ScreenQuery } from "./ScreenQuery";

type ScreenProps = {
	children: ReactNode;
};

function ScreenRoot({ children }: ScreenProps) {
	return <View className="flex-1 bg-background">{children}</View>;
}

function ScreenContent({ children }: ScreenProps) {
	return <View className="flex-1">{children}</View>;
}

export const Screen = Object.assign(ScreenRoot, {
	Content: ScreenContent,
	Query: ScreenQuery,
});
