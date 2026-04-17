import { expect, test } from "bun:test";

import {
	assertResourceBelongsToTenant,
	belongsToHotel,
	createTenantScope,
} from "./tenancy";

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

test("createTenantScope returns the normalized tenant scope", () => {
	expect(
		createTenantScope({
			guestSessionId: "session-1",
			hotelId: "hotel_1",
			roomId: "room-101",
		}),
	).toEqual({
		guestSessionId: "session-1",
		hotelId: "hotel_1",
		roomId: "room-101",
	});
});

test("assertResourceBelongsToTenant accepts matching hotel IDs", () => {
	expect(
		assertResourceBelongsToTenant(
			"hotel_1",
			{ hotelId: "hotel_1" },
			"Category",
		),
	).toBe("hotel_1");
});

test("assertResourceBelongsToTenant rejects cross-tenant access", () => {
	expect(() =>
		assertResourceBelongsToTenant(
			"hotel_2",
			{ hotelId: "hotel_1" },
			"Category",
		),
	).toThrow(/does not belong/);
});
