export function buildRoomQrCodeDownloadName(label: string) {
	const normalizedLabel = label.trim().toLowerCase().replace(/\s+/g, "-");

	return `quarto-${normalizedLabel}-qr.png`;
}
