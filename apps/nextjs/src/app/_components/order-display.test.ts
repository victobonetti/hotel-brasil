import { describe, expect, test } from "bun:test";

import {
	formatOrderReference,
	formatRoomReference,
	getOrderDisplayMeta,
} from "./order-display";

describe("formatOrderReference", () => {
	test("uses the first eight characters of long ids to create a friendly order number", () => {
		expect(formatOrderReference("3410b709-3e6a-403a-8c18-294c29cd2aaf")).toBe(
			"#3410B709",
		);
	});

	test("keeps shorter ids readable", () => {
		expect(formatOrderReference("abc123")).toBe("#ABC123");
	});
});

describe("formatRoomReference", () => {
	test("prefers the explicit room label when it exists", () => {
		expect(
			formatRoomReference({
				roomId: "100e8080-f6d4-4a71-9d8a-fafd61b1bc2f",
				roomLabel: "305",
			}),
		).toBe("Quarto 305");
	});

	test("falls back to a shortened room id when the label is missing", () => {
		expect(
			formatRoomReference({
				roomId: "100e8080-f6d4-4a71-9d8a-fafd61b1bc2f",
			}),
		).toBe("Quarto 100E8080");
	});
});

describe("getOrderDisplayMeta", () => {
	test("returns a friendly headline and room reference together", () => {
		expect(
			getOrderDisplayMeta({
				orderId: "3410b709-3e6a-403a-8c18-294c29cd2aaf",
				roomId: "100e8080-f6d4-4a71-9d8a-fafd61b1bc2f",
				roomLabel: "1204",
			}),
		).toEqual({
			orderReference: "#3410B709",
			orderTitle: "Pedido #3410B709",
			roomReference: "Quarto 1204",
		});
	});
});
