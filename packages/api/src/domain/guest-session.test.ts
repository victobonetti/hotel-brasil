import { expect, test } from "bun:test";

import {
	assertGuestSessionIsActive,
	assertRoomCanCreateGuestSession,
	generateGuestSessionToken,
} from "./guest-session";

test("generateGuestSessionToken returns a non-empty URL-safe token", () => {
	const token = generateGuestSessionToken();

	expect(token.length).toBeGreaterThan(0);
	expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
});

test("generateGuestSessionToken returns distinct values", () => {
	expect(generateGuestSessionToken()).not.toBe(generateGuestSessionToken());
});

test("assertGuestSessionIsActive accepts an active session", () => {
	expect(
		assertGuestSessionIsActive({
			expiresAt: new Date(Date.now() + 60_000),
			hotelActive: true,
			roomActive: true,
		}),
	).toEqual({
		expiresAt: expect.any(Date),
		hotelActive: true,
		roomActive: true,
	});
});

test("assertGuestSessionIsActive rejects expired sessions", () => {
	expect(() =>
		assertGuestSessionIsActive({
			expiresAt: new Date(Date.now() - 60_000),
			hotelActive: true,
			roomActive: true,
		}),
	).toThrow(/expired/);
});

test("assertRoomCanCreateGuestSession rejects inactive room or hotel", () => {
	expect(() =>
		assertRoomCanCreateGuestSession({
			hotelActive: true,
			roomActive: false,
		}),
	).toThrow(/Room is inactive/);
	expect(() =>
		assertRoomCanCreateGuestSession({
			hotelActive: false,
			roomActive: true,
		}),
	).toThrow(/Hotel is inactive/);
});
