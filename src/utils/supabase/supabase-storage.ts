import * as SecureStore from "expo-secure-store";

class SecureStorageAdapter {
	private handleError(
		operation: "getItem" | "setItem" | "removeItem",
		key: string,
	) {
		console.error(`[supabase-storage] ${operation} failed for key "${key}"`);
	}

	async getItem(key: string) {
		try {
			return await SecureStore.getItemAsync(key);
		} catch {
			this.handleError("getItem", key);
			return null;
		}
	}

	async setItem(key: string, value: string) {
		try {
			await SecureStore.setItemAsync(key, value);
		} catch {
			this.handleError("setItem", key);
		}
	}

	async removeItem(key: string) {
		try {
			await SecureStore.deleteItemAsync(key);
		} catch {
			this.handleError("removeItem", key);
		}
	}
}

export const encryptedSupabaseStorage = new SecureStorageAdapter();
