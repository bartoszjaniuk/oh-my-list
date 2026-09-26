import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { THEME } from "@/lib/theme";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEXT_VARIANTS = [
	"default",
	"h1",
	"h2",
	"h3",
	"h4",
	"p",
	"blockquote",
	"code",
	"lead",
	"large",
	"small",
	"muted",
] as const;

const BUTTON_VARIANTS = [
	"default",
	"destructive",
	"outline",
	"secondary",
	"ghost",
	"link",
] as const;

const BUTTON_SIZES = ["default", "sm", "lg", "icon"] as const;

const THEME_SWATCHES = [
	"background",
	"foreground",
	"card",
	"primary",
	"secondary",
	"muted",
	"accent",
	"destructive",
	"border",
	"input",
	"ring",
] as const satisfies ReadonlyArray<keyof typeof THEME.light>;

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<View className="gap-4">
			<Text variant="h3">{title}</Text>
			{children}
		</View>
	);
}

function ShowcaseRow({
	code,
	children,
}: {
	code: string;
	children: ReactNode;
}) {
	return (
		<View className="gap-2 border-b border-border pb-4">
			{children}
			<Text variant="code">{code}</Text>
		</View>
	);
}

export function DesignSystemScreen() {
	const { colorScheme } = useColorScheme();
	const scheme = colorScheme === "dark" ? "dark" : "light";
	const theme = THEME[scheme];

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
			<View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
				<Button variant="ghost" size="sm" onPress={() => router.back()}>
					<Text>Back</Text>
				</Button>
				<Text variant="large">Design System</Text>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="gap-10 px-4 py-6"
				keyboardShouldPersistTaps="handled"
			>
				<Section title="Typography">
					{TEXT_VARIANTS.map((variant) => (
						<ShowcaseRow key={variant} code={`<Text variant="${variant}">`}>
							{variant === "h2" ? (
								<Text variant={variant} className="border-0 pb-0">
									The quick brown fox — {variant}
								</Text>
							) : (
								<Text variant={variant}>
									The quick brown fox — {variant}
								</Text>
							)}
						</ShowcaseRow>
					))}
				</Section>

				<Section title="Button — variants">
					<View className="gap-3">
						{BUTTON_VARIANTS.map((variant) => (
							<ShowcaseRow
								key={variant}
								code={`<Button variant="${variant}">`}
							>
								<Button variant={variant}>
									<Text>{variant}</Text>
								</Button>
							</ShowcaseRow>
						))}
						<ShowcaseRow code={`<Button disabled>`}>
							<Button disabled>
								<Text>disabled</Text>
							</Button>
						</ShowcaseRow>
					</View>
				</Section>

				<Section title="Button — sizes">
					<View className="gap-3">
						{BUTTON_SIZES.map((size) => (
							<ShowcaseRow key={size} code={`<Button size="${size}">`}>
								<Button size={size}>
									<Text>{size === "icon" ? "★" : size}</Text>
								</Button>
							</ShowcaseRow>
						))}
					</View>
				</Section>

				<Section title="Input + Label">
					<ShowcaseRow code={`<Label>Email</Label>\n<Input placeholder="…" />`}>
						<View className="gap-2">
							<Label>Email</Label>
							<Input
								placeholder="you@example.com"
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>
					</ShowcaseRow>
					<ShowcaseRow code={`<Input editable={false} />`}>
						<Input value="Read only value" editable={false} />
					</ShowcaseRow>
				</Section>

				<Section title="Textarea">
					<ShowcaseRow code={`<Textarea placeholder="…" />`}>
						<Textarea placeholder="Write a longer note…" />
					</ShowcaseRow>
				</Section>

				<Section title="Avatar">
					<ShowcaseRow code={`<Avatar> + Image / Fallback`}>
						<View className="flex-row items-center gap-4">
							<Avatar className="size-12" alt="Jane Doe">
								<AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
								<AvatarFallback>
									<Text>JD</Text>
								</AvatarFallback>
							</Avatar>
							<Avatar className="size-12" alt="Fallback only">
								<AvatarFallback>
									<Text>AB</Text>
								</AvatarFallback>
							</Avatar>
						</View>
					</ShowcaseRow>
				</Section>

				<Section title="Skeleton">
					<ShowcaseRow code={`<Skeleton className="h-4 w-full" />`}>
						<View className="gap-3">
							<Skeleton className="h-4 w-[75%]" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-20 w-full rounded-lg" />
						</View>
					</ShowcaseRow>
				</Section>

				<Section title={`Theme tokens (${scheme})`}>
					<View className="flex-row flex-wrap gap-3">
						{THEME_SWATCHES.map((token) => {
							const color = theme[token];
							return (
								<View key={token} className="w-[30%] gap-1.5">
									<View
										className="h-12 rounded-md border border-border"
										style={{ backgroundColor: color }}
									/>
									<Text variant="small">{token}</Text>
									<Text variant="muted" numberOfLines={1}>
										{color}
									</Text>
								</View>
							);
						})}
					</View>
					<Text variant="muted" className="mt-2">
						Mirrored from global.css → lib/theme.ts. Toggle system dark mode to
						compare.
					</Text>
				</Section>

				<Section title="Composition tip">
					<View className="gap-2 rounded-lg border border-border bg-card p-4">
						<Text variant="muted">
							Button text inherits styles via TextClassContext — wrap labels in
							Text:
						</Text>
						<Text variant="code">{`<Button>\n  <Text>Save</Text>\n</Button>`}</Text>
						<Pressable onPress={() => router.push("/(auth)")}>
							<Text variant="muted" className="underline">
								Open sign-in route
							</Text>
						</Pressable>
					</View>
				</Section>
			</ScrollView>
		</SafeAreaView>
	);
}
