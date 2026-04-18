import { describe, expect, test } from "bun:test";

import { buildRoomQrCodeActionState } from "./room-qr-code-actions";

describe("buildRoomQrCodeActionState", () => {
	test("returns a stable dialog title, path and download name", () => {
		expect(
			buildRoomQrCodeActionState({
				label: "305",
				qrCodeToken: "room-token-123",
			}),
		).toEqual({
			downloadName: "quarto-305-qr.png",
			publicPath: "/g/room-token-123",
			title: "QR Code do quarto 305",
		});
	});
});
