import { describe, expect, test } from "bun:test";

import {
	assertCatalogManager,
	buildMenuImageStorageKey,
	resolveMenuImageExtension,
	toMenuImageUploadBuffer,
} from "./helpers";

describe("menu image upload helpers", () => {
	test("validates catalog manager access", () => {
		expect(() => assertCatalogManager(null)).toThrow(
			"Staff membership is required.",
		);
		expect(() =>
			assertCatalogManager({
				hotelId: "hotel-1",
				role: "kitchen",
				userId: "user-1",
			}),
		).toThrow("Only admin or manager can manage menu images.");
		expect(
			assertCatalogManager({
				hotelId: "hotel-1",
				role: "manager",
				userId: "user-1",
			}),
		).toMatchObject({
			hotelId: "hotel-1",
		});
	});

	test("builds a deterministic storage key", () => {
		expect(
			buildMenuImageStorageKey({
				extension: "webp",
				hotelId: "hotel-1",
				objectId: "image-1",
				prefix: "menu-items",
			}),
		).toBe("menu-items/hotel-1/image-1.webp");
	});

	test("resolves supported image extensions", () => {
		expect(resolveMenuImageExtension("image/webp")).toBe("webp");
		expect(() => resolveMenuImageExtension("image/gif")).toThrow(
			"Unsupported image type.",
		);
	});

	test("converts a file into an upload buffer", async () => {
		const file = new File([Buffer.from("image")], "item.webp", {
			type: "image/webp",
		});

		await expect(toMenuImageUploadBuffer(file)).resolves.toMatchObject({
			contentType: "image/webp",
			extension: "webp",
		});
	});

	test("rejects invalid upload file types", async () => {
		const file = new File([Buffer.from("image")], "item.txt", {
			type: "text/plain",
		});

		await expect(toMenuImageUploadBuffer(file)).rejects.toThrow(
			"Selecione um arquivo de imagem valido.",
		);
	});
});
