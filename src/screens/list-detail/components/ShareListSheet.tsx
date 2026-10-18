import { useActiveListInvitationQuery } from "@/api/lists/hooks/useActiveListInvitationQuery";
import { useCreateListInvitationMutation } from "@/api/lists/hooks/useCreateListInvitationMutation";
import { buildInviteLink } from "@/api/lists/lists.consts";
import { ListsApiError } from "@/api/lists/lists.models";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useControlledBottomSheetModal } from "@/hooks/useControlledBottomSheetModal";
import {
	BottomSheetModal,
	BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Share, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const COLLAB_COPY =
	"Zaproś innych do wspólnej listy. Po zeskanowaniu kodu QR lub otwarciu linku zalogowani użytkownicy mogą dołączyć w aplikacji.";

type ShareListSheetProps = {
	visible: boolean;
	listId: string;
	onClose: () => void;
};

const formatRateLimit = (e: ListsApiError) => {
	if (e.retryAfterSeconds != null) {
		const m = Math.ceil(e.retryAfterSeconds / 60);
		return m >= 1
			? `Osiągnięto limit generowania kodu. Spróbuj za ok. ${m} min.`
			: "Osiągnięto limit generowania kodu. Spróbuj za chwilę.";
	}
	return e.message;
};

export function ShareListSheet({
	visible,
	listId,
	onClose,
}: ShareListSheetProps) {
	const sheetRef = useControlledBottomSheetModal(visible);
	const invitationQuery = useActiveListInvitationQuery({
		listId,
		enabled: visible,
	});
	const createMutation = useCreateListInvitationMutation();

	useEffect(() => {
		if (!visible) {
			createMutation.reset();
		}
	}, [visible, createMutation]);

	const inviteCode = invitationQuery.data?.code;
	const inviteLink =
		typeof inviteCode === "string" && inviteCode.length > 0
			? buildInviteLink(inviteCode)
			: null;
	const canGenerate = listId.length > 0;
	const showInvitationLoading = invitationQuery.isLoading;
	const isBusy = createMutation.isPending;

	const mutationErrorMessage = useMemo(() => {
		const err = createMutation.error;
		if (err == null) {
			return null;
		}
		if (err instanceof ListsApiError) {
			if (err.code === "rate_limit_exceeded") {
				return formatRateLimit(err);
			}
			return err.message;
		}
		if (err instanceof Error) {
			return err.message;
		}
		return "Nie udało się utworzyć zaproszenia.";
	}, [createMutation.error]);

	const handleGenerate = () => {
		if (!canGenerate || isBusy) {
			return;
		}
		createMutation.mutate({ listId });
	};

	const handleShare = async () => {
		if (inviteLink == null || inviteLink.length === 0) {
			return;
		}
		const line = "Dołącz do mojej listy (link w aplikacji):";
		try {
			await Share.share({ message: `${line}\n${inviteLink}` });
		} catch {
			// User may cancel — ignore
		}
	};

	return (
		<BottomSheetModal
			ref={sheetRef}
			enablePanDownToClose={!isBusy}
			enableDynamicSizing
			onClose={() => {
				if (!isBusy) {
					onClose();
				}
			}}
		>
			<BottomSheetScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: 40,
					paddingTop: 8,
				}}
			>
				<Text variant="large" className="mb-4">
					Udostępnianie listy
				</Text>
				<View className="gap-5">
					<Text className="text-sm leading-6 text-muted-foreground">
						{COLLAB_COPY}
					</Text>

					{invitationQuery.isError ? (
						<View className="gap-2">
							<Text className="text-sm text-destructive">
								{invitationQuery.error instanceof Error
									? invitationQuery.error.message
									: "Nie udało się pobrać zaproszenia."}
							</Text>
							<Button
								variant="outline"
								onPress={() => {
									void invitationQuery.refetch();
								}}
								accessibilityLabel="Spróbuj ponownie"
							>
								<Text>Spróbuj ponownie</Text>
							</Button>
						</View>
					) : null}

					{showInvitationLoading ? (
						<View className="min-h-[200px] items-center justify-center">
							<ActivityIndicator size="large" />
						</View>
					) : null}

					{inviteLink != null ? (
						<View className="items-center gap-3">
							<View className="rounded-2xl border border-border bg-white p-4">
								<QRCode
									size={200}
									value={inviteLink}
									color="#000000"
									backgroundColor="#FFFFFF"
								/>
							</View>
							{invitationQuery.data?.expires_at ? (
								<Text className="text-center text-sm text-muted-foreground">
									Link wygasa:{" "}
									{new Date(
										invitationQuery.data.expires_at,
									).toLocaleString("pl-PL", {
										day: "numeric",
										month: "long",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Text>
							) : null}
						</View>
					) : null}

					{!showInvitationLoading &&
					!invitationQuery.isError &&
					inviteLink == null ? (
						<Button
							disabled={!canGenerate || isBusy}
							onPress={handleGenerate}
							accessibilityLabel="Generuj link zaproszenia"
						>
							{isBusy ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : null}
							<Text>
								{isBusy ? "Generowanie…" : "Generuj link zaproszenia"}
							</Text>
						</Button>
					) : null}

					{inviteLink != null ? (
						<View className="gap-3">
							<Button
								onPress={() => {
									void handleShare();
								}}
								accessibilityLabel="Udostępnij kod do listy"
							>
								<Text>Udostępnij kod do listy</Text>
							</Button>
							<Button
								variant="outline"
								disabled={!canGenerate || isBusy}
								onPress={handleGenerate}
								accessibilityLabel="Wygeneruj nowy link do listy"
							>
								<Text>
									{isBusy
										? "Generowanie nowego linku…"
										: "Wygeneruj nowy link (poprzedni przestanie działać)"}
								</Text>
							</Button>
						</View>
					) : null}

					{mutationErrorMessage != null ? (
						<View className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/40">
							<Text className="text-sm text-amber-900 dark:text-amber-100">
								{mutationErrorMessage}
							</Text>
						</View>
					) : null}

					<Button variant="ghost" disabled={isBusy} onPress={onClose}>
						<Text>Zamknij</Text>
					</Button>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}
