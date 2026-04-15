import { expect, test } from "bun:test";

import { generateGuestSessionToken } from "./guest-session";

test("generateGuestSessionToken returns a non-empty URL-safe token", () => {
	const token = generateGuestSessionToken();

	expect(token.length).toBeGreaterThan(0);
	expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
});

test("generateGuestSessionToken returns distinct values", () => {
	expect(generateGuestSessionToken()).not.toBe(generateGuestSessionToken());
});
