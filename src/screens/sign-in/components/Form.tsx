import { SocialConnections } from "@/components/social-connections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Controller } from "react-hook-form";
import { Pressable, type TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SignInModel } from "../hooks/useSignIn";

export function Form({
	control,
	handleSubmit,
	isSubmitting,
	authError,
	infoMessage,
	clearServerMessages,
	signIn,
	forgotPassword,
	onSocialComingSoon,
}: SignInModel) {
	const passwordInputRef = React.useRef<TextInput>(null);

	function onEmailSubmitEditing() {
		passwordInputRef.current?.focus();
	}

	const onSubmit = handleSubmit(signIn);

	return (
		<SafeAreaView className="flex-1 justify-center">
			<View className="gap-6">
				<Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
					<CardHeader>
						<CardTitle className="text-center text-xl sm:text-left">
							Oh my
						</CardTitle>
						<CardTitle className="text-center  text-2xl">LIST!</CardTitle>
					</CardHeader>
					<CardContent className="gap-6">
						<View className="gap-6">
							<Controller
								control={control}
								name="email"
								rules={{
									required: "Enter your email",
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: "Invalid email format",
									},
								}}
								render={({
									field: { onChange, value, onBlur },
									fieldState: { error },
								}) => (
									<View className="gap-1.5">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											placeholder="m@example.com"
											keyboardType="email-address"
											autoComplete="email"
											autoCapitalize="none"
											value={value}
											onBlur={onBlur}
											onChangeText={(text) => {
												onChange(text);
												clearServerMessages();
											}}
											onSubmitEditing={onEmailSubmitEditing}
											returnKeyType="next"
											submitBehavior="submit"
										/>
										{error?.message ? (
											<Text className="text-destructive text-sm">
												{error.message}
											</Text>
										) : null}
									</View>
								)}
							/>
							<Controller
								control={control}
								name="password"
								rules={{
									required: "Enter your password",
								}}
								render={({
									field: { onChange, value, onBlur },
									fieldState: { error },
								}) => (
									<View className="gap-1.5">
										<View className="flex-row items-center">
											<Label htmlFor="password">Password</Label>
											<Button
												variant="link"
												size="sm"
												className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
												onPress={forgotPassword}
											>
												<Text className="font-normal leading-4">
													Forgot your password?
												</Text>
											</Button>
										</View>
										<Input
											ref={passwordInputRef}
											id="password"
											secureTextEntry
											value={value}
											onBlur={onBlur}
											onChangeText={(text) => {
												onChange(text);
												clearServerMessages();
											}}
											returnKeyType="send"
											onSubmitEditing={onSubmit}
										/>
										{error?.message ? (
											<Text className="text-destructive text-sm">
												{error.message}
											</Text>
										) : null}
									</View>
								)}
							/>
							{authError ? (
								<Text className="text-destructive text-sm">{authError}</Text>
							) : null}
							{infoMessage ? (
								<Text className="text-muted-foreground text-sm">
									{infoMessage}
								</Text>
							) : null}
							<Button
								className="w-full"
								onPress={onSubmit}
								disabled={isSubmitting}
							>
								<Text>{isSubmitting ? "Signing in…" : "Continue"}</Text>
							</Button>
						</View>
						<Text className="text-center text-sm">
							Don&apos;t have an account?{" "}
							<Pressable
								onPress={() => {
									// TODO: Navigate to sign up screen
								}}
							>
								<Text className="text-sm underline underline-offset-4">
									Sign up
								</Text>
							</Pressable>
						</Text>
						<View className="flex-row items-center">
							<Separator className="flex-1" />
							<Text className="text-muted-foreground px-4 text-sm">or</Text>
							<Separator className="flex-1" />
						</View>
						<SocialConnections onPress={onSocialComingSoon} />
					</CardContent>
				</Card>
			</View>
		</SafeAreaView>
	);
}
