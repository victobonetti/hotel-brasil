import { expect, test } from "bun:test";

import { belongsToHotel } from "./tenancy";

test("belongsToHotel returns true when hotel IDs match", () => {
	expect(belongsToHotel("hotel_1", "hotel_1")).toBe(true);
});

test("belongsToHotel returns false when hotel IDs differ", () => {
	expect(belongsToHotel("hotel_1", "hotel_2")).toBe(false);
});

test("belongsToHotel returns false when either hotel ID is missing", () => {
	expect(belongsToHotel(null, "hotel_1")).toBe(false);
	expect(belongsToHotel("hotel_1", undefined)).toBe(false);
});
