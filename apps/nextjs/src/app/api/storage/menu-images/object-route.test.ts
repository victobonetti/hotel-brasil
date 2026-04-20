import { describe, expect, test } from "bun:test";

import { normalizeMenuImageObjectKey } from "./object-route";

describe("normalizeMenuImageObjectKey", () => {
	test("joins route segments into a storage key", () => {
		expect(
			normalizeMenuImageObjectKey([
				"menu-items",
				"hotel-brasil-demo",
				"item.webp",
			]),
		).toBe("menu-items/hotel-brasil-demo/item.webp");
	});

	test("rejects empty route segments", () => {
		expect(() =>
			normalizeMenuImageObjectKey(["menu-items", "", "item.webp"]),
		).toThrow("Invalid storage key.");
	});
});
