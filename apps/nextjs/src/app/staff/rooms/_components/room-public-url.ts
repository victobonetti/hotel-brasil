export function buildRoomPublicUrl(origin: string, qrCodeToken: string) {
	return `${origin.replace(/\/$/, "")}/g/${qrCodeToken}`;
}
