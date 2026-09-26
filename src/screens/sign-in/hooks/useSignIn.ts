import { supabase } from "@/utils/supabase/client";
import * as Linking from "expo-linking";
import { useState } from "react";
import { useForm } from "react-hook-form";

export type SignInFormValues = {
	email: string;
	password: string;
};

export const useSignIn = () => {
	const [authError, setAuthError] = useState<string | null>(null);
	const [infoMessage, setInfoMessage] = useState<string | null>(null);

	const { control, handleSubmit, formState, getValues } =
		useForm<SignInFormValues>({
			defaultValues: {
				email: "",
				password: "",
			},
		});
	const isSubmitting = formState.isSubmitting;

	const clearServerMessages = () => {
		setAuthError(null);
		setInfoMessage(null);
	};

	const signIn = async (values: SignInFormValues) => {
		clearServerMessages();
		const { error } = await supabase.auth.signInWithPassword({
			email: values.email.trim(),
			password: values.password,
		});

		if (error) {
			setAuthError(error.message);
		}
	};

	const forgotPassword = async () => {
		clearServerMessages();
		const email = getValues("email").trim();
		if (!email) {
			setAuthError("Enter your email above to reset your password.");
			return;
		}
		const redirectTo = Linking.createURL("/", { scheme: "ohmylist" });
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo,
		});
		if (error) {
			setAuthError(error.message);
			return;
		}
		setInfoMessage(
			"If an account exists, we'll send a password reset link to that email.",
		);
	};

	const onSocialComingSoon = () => {
		clearServerMessages();
		setInfoMessage("Google and Apple sign-in will be available soon.");
	};

	return {
		control,
		handleSubmit,
		isSubmitting,
		authError,
		infoMessage,
		clearServerMessages,
		signIn,
		forgotPassword,
		onSocialComingSoon,
	};
};

export type SignInModel = ReturnType<typeof useSignIn>;
