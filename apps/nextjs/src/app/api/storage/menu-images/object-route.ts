export function normalizeMenuImageObjectKey(keyParts: Array<string>) {
	if (
		keyParts.length === 0 ||
		keyParts.some((part) => part.trim().length === 0)
	) {
		throw new Error("Invalid storage key.");
	}

	return keyParts.join("/");
}
