import { describe, expect, test } from "bun:test";

import { buildRoomQrCodeDownloadName } from "./room-qr-code";

describe("buildRoomQrCodeDownloadName", () => {
	test("creates a stable filename from the room label", () => {
		expect(buildRoomQrCodeDownloadName("305")).toBe("quarto-305-qr.png");
	});

	test("normalizes whitespace in the room label", () => {
		expect(buildRoomQrCodeDownloadName("Suite Master")).toBe(
			"quarto-suite-master-qr.png",
		);
	});
});
