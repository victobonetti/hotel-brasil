import { describe, expect, test } from "bun:test";

import {
	getCenteredSquareCrop,
	ITEM_IMAGE_SIZE,
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
});
