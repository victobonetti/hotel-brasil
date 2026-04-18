import { describe, expect, test } from "bun:test";

import { partitionGuestOrders } from "./guest-orders-display";

const sampleOrders = [
	{
		id: "order-pending",
		placedAt: new Date("2026-04-18T10:00:00.000Z"),
		status: "pending" as const,
	},
	{
		id: "order-delivered",
		placedAt: new Date("2026-04-18T09:00:00.000Z"),
		status: "delivered" as const,
	},
	{
		id: "order-preparing",
		placedAt: new Date("2026-04-18T08:00:00.000Z"),
		status: "preparing" as const,
	},
	{
		id: "order-cancelled",
		placedAt: new Date("2026-04-18T07:00:00.000Z"),
		status: "cancelled" as const,
	},
];

describe("partitionGuestOrders", () => {
	test("separates active orders from history while preserving order", () => {
		const result = partitionGuestOrders(sampleOrders);

		expect(result.activeOrders.map((order) => order.id)).toEqual([
			"order-pending",
			"order-preparing",
		]);
		expect(result.historyOrders.map((order) => order.id)).toEqual([
			"order-delivered",
			"order-cancelled",
		]);
	});

	test("returns empty sections when there are no orders", () => {
		const result = partitionGuestOrders([]);

		expect(result.activeOrders).toEqual([]);
		expect(result.historyOrders).toEqual([]);
	});
});
