import { describe, expect, test } from "bun:test";

import {
	buildMenuImageProxyUrl,
	getCenteredSquareCrop,
	ITEM_IMAGE_SIZE,
	processedImageDataUrlToFile,
	resolveMenuItemImageSrc,
	uploadProcessedMenuItemImage,
	validateProcessedImageDataUrl,
} from "./item-image";

describe("item-image helpers", () => {
	test("calculates a centered square crop", () => {
		expect(getCenteredSquareCrop(400, 200)).toEqual({
			height: 200,
			sourceX: 100,
			sourceY: 0,
			width: 200,
		});
	});

	test("uses a fixed 200x200 output size", () => {
		expect(ITEM_IMAGE_SIZE).toBe(200);
	});

	test("accepts a generated image data url", () => {
		expect(validateProcessedImageDataUrl("data:image/webp;base64,Zm9v")).toBe(
			"data:image/webp;base64,Zm9v",
		);
	});

	test("rejects invalid processed image payloads", () => {
		expect(() => validateProcessedImageDataUrl("not-an-image")).toThrow(
			"Arquivo de imagem invalido.",
		);
	});

	test("converts a processed data url to a file", async () => {
		const file = processedImageDataUrlToFile("data:image/webp;base64,Zm9v");

		expect(file.type).toBe("image/webp");
		expect(file.name).toBe("menu-item-image.webp");
		expect(Buffer.from(await file.arrayBuffer()).toString("utf8")).toBe("foo");
	});

	test("builds a proxy url for storage-backed menu images", () => {
		expect(buildMenuImageProxyUrl("menu-items/hotel 1/item.webp")).toBe(
			"/api/storage/menu-images/object/menu-items/hotel%201/item.webp",
		);
	});

	test("prefers the proxy route when a storage key is available", () => {
		expect(
			resolveMenuItemImageSrc({
				imageStorageKey: "menu-items/hotel-1/item.webp",
				imageUrl: "https://cdn.example.com/menu-items/hotel-1/item.webp",
			}),
		).toBe("/api/storage/menu-images/object/menu-items/hotel-1/item.webp");
	});

	test("falls back to the raw image url when there is no storage key", () => {
		expect(
			resolveMenuItemImageSrc({
				imageStorageKey: null,
				imageUrl: "data:image/webp;base64,Zm9v",
			}),
		).toBe("data:image/webp;base64,Zm9v");
	});

	test("uploads the processed image through the app route", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () =>
			new Response(
				JSON.stringify({
					key: "menu-items/hotel-1/item.webp",
					url: "https://cdn.example.com/menu-items/hotel-1/item.webp",
				}),
				{ status: 200 },
			);

		try {
			await expect(
				uploadProcessedMenuItemImage(
					new File([Buffer.from("image")], "item.webp", {
						type: "image/webp",
					}),
				),
			).resolves.toEqual({
				key: "menu-items/hotel-1/item.webp",
				url: "https://cdn.example.com/menu-items/hotel-1/item.webp",
			});
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("surfaces a friendly upload error", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () =>
			new Response(
				JSON.stringify({
					error: "Storage indisponivel.",
				}),
				{ status: 503 },
			);

		try {
			await expect(
				uploadProcessedMenuItemImage(
					new File([Buffer.from("image")], "item.webp", {
						type: "image/webp",
					}),
				),
			).rejects.toThrow("Storage indisponivel.");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
