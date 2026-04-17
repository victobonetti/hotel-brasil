import { describe, expect, test } from "bun:test";

import { getStaffAccessSummary } from "./auth-access";

describe("getStaffAccessSummary", () => {
	test("returns a waiting state when the user has no hotel membership", () => {
		expect(getStaffAccessSummary(null)).toMatchObject({
			canAccessCatalog: false,
			canAccessOrders: false,
			title: "Aguardando vinculacao a um hotel",
		});
	});

	test("allows admins and managers to access orders and catalog", () => {
		expect(
			getStaffAccessSummary({
				hotelName: "Hotel Brasil",
				role: "admin",
			}),
		).toMatchObject({
			canAccessCatalog: true,
			canAccessOrders: true,
			title: "Acesso liberado para Hotel Brasil",
		});
	});

	test("limits kitchen and frontdesk roles to order operations", () => {
		expect(
			getStaffAccessSummary({
				hotelName: "Hotel Brasil",
				role: "kitchen",
			}),
		).toMatchObject({
			canAccessCatalog: false,
			canAccessOrders: true,
		});
	});
});
