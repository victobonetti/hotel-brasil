import { describe, expect, test } from "bun:test";

import { getStaffAccessSummary } from "./auth-access";

describe("auth showcase access links", () => {
	test("admin access exposes the three expected destinations", () => {
		const access = getStaffAccessSummary({
			hotelName: "Hotel Brasil Demo",
			role: "admin",
		});

		expect(access.canAccessOrders).toBe(true);
		expect(access.canAccessCatalog).toBe(true);
	});

	test("users without membership do not expose staff destinations", () => {
		const access = getStaffAccessSummary(null);

		expect(access.canAccessOrders).toBe(false);
		expect(access.canAccessCatalog).toBe(false);
	});
});
