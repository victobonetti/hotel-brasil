import { buildRoomQrCodeDownloadName } from "./room-qr-code";

export function buildRoomQrCodeActionState(input: {
	label: string;
	qrCodeToken: string;
}) {
	return {
		downloadName: buildRoomQrCodeDownloadName(input.label),
		publicPath: `/g/${input.qrCodeToken}`,
		title: `QR Code do quarto ${input.label}`,
	};
}
