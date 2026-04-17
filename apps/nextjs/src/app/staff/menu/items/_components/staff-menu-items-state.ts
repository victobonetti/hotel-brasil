export function getMenuItemLoadingState(
	pendingItemId: string | null,
	itemId: string,
) {
	const isLoading = pendingItemId === itemId;

	return {
		isLoading,
		itemClassName: isLoading ? "pointer-events-none opacity-50" : "",
		shouldShowOverlay: isLoading,
	};
}
