import { Platform, Linking } from "react-native";

const ANDROID_RATING_URL =
	"https://play.google.com/store/apps/details?id=com.i3artosz.ohmylist";
const IOS_RATING_URL =
	"https://apps.apple.com/us/search?term=oh-my-list";

export const STORE_RATING_URL = Platform.select({
	android: ANDROID_RATING_URL,
	default: IOS_RATING_URL,
});

export async function openStoreRating() {
	try {
		if (await Linking.canOpenURL(STORE_RATING_URL)) {
			await Linking.openURL(STORE_RATING_URL);
		}
	} catch {
		// Store links are optional and may be unavailable on some devices.
	}
}
