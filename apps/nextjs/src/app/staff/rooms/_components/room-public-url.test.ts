import { describe, expect, test } from "bun:test";

import { buildRoomPublicUrl } from "./room-public-url";

describe("buildRoomPublicUrl", () => {
	test("joins the current origin with the guest token path", () => {
		expect(buildRoomPublicUrl("https://hotel.test", "room-token-123")).toBe(
			"https://hotel.test/g/room-token-123",
		);
	});

	test("normalizes a trailing slash in the origin", () => {
		expect(buildRoomPublicUrl("https://hotel.test/", "room-token-123")).toBe(
			"https://hotel.test/g/room-token-123",
		);
	});
});
