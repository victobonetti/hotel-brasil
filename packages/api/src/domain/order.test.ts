import { describe, expect, test } from "bun:test";

import {
	assertGuestSessionCanOrder,
	assertMenuItemsBelongToHotel,
	assertOrderExists,
	assertUserCanManageHotel,
	buildOrderItemSnapshots,
	buildOrderStatusEvent,
	calculateOrderTotal,
	canTransitionOrderStatus,
	createInitialStatusHistory,
	createOrderAuditContext,
	isMenuItemAvailable,
	listOperationalOrders,
	shouldNotifyGuest,
	transitionOrderStatus,
	transitionOrderStatusWithAudit,
	validateOrderCreation,
} from "./order";

describe("calculateOrderTotal", () => {
	test("sums multiple line items with different quantities", () => {
		expect(
			calculateOrderTotal([
				{ quantity: 2, unitPriceSnapshotInCents: 3500 },
				{ quantity: 1, unitPriceSnapshotInCents: 1200 },
			]),
		).toBe(8200);
	});

	test("returns zero for an empty list", () => {
		expect(calculateOrderTotal([])).toBe(0);
	});

	test("throws when quantity is zero or negative", () => {
		expect(() =>
			calculateOrderTotal([{ quantity: 0, unitPriceSnapshotInCents: 500 }]),
		).toThrow(/quantity/);
	});

	test("throws when snapshot price is invalid", () => {
		expect(() =>
			calculateOrderTotal([{ quantity: 1, unitPriceSnapshotInCents: -1 }]),
		).toThrow(/unitPriceSnapshotInCents/);
	});
});

describe("validateOrderCreation", () => {
	test("throws when there are no items", () => {
		expect(() => validateOrderCreation({ items: [] })).toThrow(
			/at least one item/,
		);
	});

	test("throws when quantity is zero or negative", () => {
		expect(() =>
			validateOrderCreation({
				items: [{ available: true, menuItemId: "item_1", quantity: 0 }],
			}),
		).toThrow(/quantity/);
	});

	test("throws when an item is unavailable", () => {
		expect(() =>
			validateOrderCreation({
				items: [{ available: false, menuItemId: "item_1", quantity: 1 }],
			}),
		).toThrow(/unavailable/);
	});

	test("accepts empty order notes", () => {
		expect(
			validateOrderCreation({
				items: [{ available: true, menuItemId: "item_1", quantity: 1 }],
				orderNotes: "",
			}),
		).toEqual({
			items: [{ available: true, menuItemId: "item_1", quantity: 1 }],
			orderNotes: "",
		});
	});

	test("accepts multiple valid items", () => {
		expect(
			validateOrderCreation({
				items: [
					{
						available: true,
						menuItemId: "item_1",
						notes: "No ice",
						quantity: 1,
					},
					{ available: true, menuItemId: "item_2", quantity: 3 },
				],
			}),
		).toEqual({
			items: [
				{ available: true, menuItemId: "item_1", notes: "No ice", quantity: 1 },
				{ available: true, menuItemId: "item_2", quantity: 3 },
			],
		});
	});
});

describe("buildOrderItemSnapshots", () => {
	test("copies item snapshots and calculates line totals", () => {
		expect(
			buildOrderItemSnapshots(
				[
					{
						available: true,
						hotelId: "hotel-1",
						id: "item-1",
						name: "Burger",
						priceInCents: 4200,
					},
				],
				[{ menuItemId: "item-1", notes: "No onions", quantity: 2 }],
			),
		).toEqual([
			{
				itemNameSnapshot: "Burger",
				lineTotalInCents: 8400,
				menuItemId: "item-1",
				notes: "No onions",
				quantity: 2,
				unitPriceSnapshotInCents: 4200,
			},
		]);
	});

	test("throws if any item does not exist", () => {
		expect(() =>
			buildOrderItemSnapshots([], [{ menuItemId: "missing", quantity: 1 }]),
		).toThrow(/not found/);
	});

	test("throws if any item is unavailable", () => {
		expect(() =>
			buildOrderItemSnapshots(
				[
					{
						available: false,
						hotelId: "hotel-1",
						id: "item-1",
						name: "Burger",
						priceInCents: 4200,
					},
				],
				[{ menuItemId: "item-1", quantity: 1 }],
			),
		).toThrow(/unavailable/);
	});
});

describe("assertGuestSessionCanOrder", () => {
	test("accepts a valid session", () => {
		expect(
			assertGuestSessionCanOrder({
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

	test("fails for an expired session", () => {
		expect(() =>
			assertGuestSessionCanOrder({
				expiresAt: new Date(Date.now() - 60_000),
				hotelActive: true,
				roomActive: true,
			}),
		).toThrow(/expired/);
	});

	test("fails for an inactive room", () => {
		expect(() =>
			assertGuestSessionCanOrder({
				expiresAt: new Date(Date.now() + 60_000),
				hotelActive: true,
				roomActive: false,
			}),
		).toThrow(/Room is inactive/);
	});

	test("fails for an inactive hotel", () => {
		expect(() =>
			assertGuestSessionCanOrder({
				expiresAt: new Date(Date.now() + 60_000),
				hotelActive: false,
				roomActive: true,
			}),
		).toThrow(/Hotel is inactive/);
	});
});

describe("assertMenuItemsBelongToHotel", () => {
	test("accepts items from the same hotel", () => {
		expect(
			assertMenuItemsBelongToHotel("hotel-1", [
				{ hotelId: "hotel-1", id: "item-1" },
				{ hotelId: "hotel-1", id: "item-2" },
			]),
		).toHaveLength(2);
	});

	test("rejects items from another hotel", () => {
		expect(() =>
			assertMenuItemsBelongToHotel("hotel-1", [
				{ hotelId: "hotel-2", id: "item-1" },
			]),
		).toThrow(/does not belong/);
	});
});

describe("createInitialStatusHistory", () => {
	test("creates the initial pending status history record", () => {
		const changedAt = new Date("2026-04-16T10:00:00.000Z");

		expect(createInitialStatusHistory("order-1", changedAt)).toEqual({
			changedAt,
			changedByUserId: null,
			fromStatus: null,
			orderId: "order-1",
			reason: null,
			toStatus: "pending",
		});
	});
});

describe("assertUserCanManageHotel", () => {
	test("accepts a matching membership", () => {
		expect(
			assertUserCanManageHotel(
				"user-1",
				{ hotelId: "hotel-1", userId: "user-1" },
				"hotel-1",
			),
		).toEqual({ hotelId: "hotel-1", userId: "user-1" });
	});

	test("rejects missing or wrong membership", () => {
		expect(() => assertUserCanManageHotel("user-1", null, "hotel-1")).toThrow(
			/not assigned/,
		);
		expect(() =>
			assertUserCanManageHotel(
				"user-1",
				{ hotelId: "hotel-2", userId: "user-1" },
				"hotel-1",
			),
		).toThrow(/another hotel/);
	});
});

describe("assertOrderExists", () => {
	test("returns the order when it exists", () => {
		expect(assertOrderExists({ id: "order-1" }, "order-1")).toEqual({
			id: "order-1",
		});
	});

	test("throws when the order is missing", () => {
		expect(() => assertOrderExists(null, "order-404")).toThrow(/order-404/);
	});
});

describe("listOperationalOrders", () => {
	test("returns only active orders for the selected hotel sorted by placedAt", () => {
		expect(
			listOperationalOrders(
				[
					{
						hotelId: "hotel-1",
						id: "order-2",
						placedAt: new Date("2026-04-16T11:00:00.000Z"),
						status: "accepted" as const,
					},
					{
						hotelId: "hotel-1",
						id: "order-1",
						placedAt: new Date("2026-04-16T10:00:00.000Z"),
						status: "pending" as const,
					},
					{
						hotelId: "hotel-1",
						id: "order-3",
						placedAt: new Date("2026-04-16T12:00:00.000Z"),
						status: "delivered" as const,
					},
					{
						hotelId: "hotel-2",
						id: "order-4",
						placedAt: new Date("2026-04-16T09:00:00.000Z"),
						status: "pending" as const,
					},
				],
				{ hotelId: "hotel-1" },
			).map((order) => order.id),
		).toEqual(["order-1", "order-2"]);
	});
});

describe("transitionOrderStatusWithAudit", () => {
	test("updates the order and creates an audit history entry", () => {
		const changedAt = new Date("2026-04-16T10:00:00.000Z");

		expect(
			transitionOrderStatusWithAudit(
				{
					id: "order-1",
					status: "pending",
				},
				"accepted",
				"user-1",
				changedAt,
			),
		).toEqual({
			history: {
				changedAt,
				changedByUserId: "user-1",
				fromStatus: "pending",
				orderId: "order-1",
				reason: null,
				toStatus: "accepted",
			},
			order: {
				acceptedAt: changedAt,
				id: "order-1",
				status: "accepted",
			},
		});
	});

	test("fails on invalid transitions", () => {
		expect(() =>
			transitionOrderStatusWithAudit(
				{ id: "order-1", status: "pending" },
				"delivered",
				"user-1",
			),
		).toThrow(/Cannot transition/);
	});
});

describe("createOrderAuditContext", () => {
	test("creates a correlatable audit payload from an order", () => {
		expect(
			createOrderAuditContext({
				acceptedAt: null,
				guestSessionId: "session-1",
				hotelId: "hotel-1",
				id: "order-1",
				placedAt: new Date("2026-04-16T10:00:00.000Z"),
				roomId: "room-101",
				status: "pending",
			}),
		).toEqual({
			acceptedAt: null,
			cancelledAt: null,
			deliveredAt: null,
			guestSessionId: "session-1",
			hotelId: "hotel-1",
			orderId: "order-1",
			placedAt: new Date("2026-04-16T10:00:00.000Z"),
			preparingAt: null,
			roomId: "room-101",
			status: "pending",
		});
	});
});

describe("buildOrderStatusEvent", () => {
	test("builds the minimum payload for in-app status updates", () => {
		const changedAt = new Date("2026-04-16T10:00:00.000Z");

		expect(
			buildOrderStatusEvent({
				changedAt,
				hotelId: "hotel-1",
				orderId: "order-1",
				roomId: "room-101",
				status: "accepted",
			}),
		).toEqual({
			hotelId: "hotel-1",
			orderId: "order-1",
			roomId: "room-101",
			status: "accepted",
			timestamp: changedAt,
		});
	});
});

describe("shouldNotifyGuest", () => {
	test("returns true for guest-visible operational transitions", () => {
		expect(shouldNotifyGuest("accepted")).toBe(true);
		expect(shouldNotifyGuest("preparing")).toBe(true);
		expect(shouldNotifyGuest("out_for_delivery")).toBe(true);
		expect(shouldNotifyGuest("delivered")).toBe(true);
		expect(shouldNotifyGuest("cancelled")).toBe(true);
	});

	test("returns false for internal or initial states", () => {
		expect(shouldNotifyGuest("pending")).toBe(false);
	});
});

describe("canTransitionOrderStatus", () => {
	test("allows the happy path status sequence", () => {
		expect(canTransitionOrderStatus("pending", "accepted")).toBe(true);
		expect(canTransitionOrderStatus("accepted", "preparing")).toBe(true);
		expect(canTransitionOrderStatus("preparing", "out_for_delivery")).toBe(
			true,
		);
		expect(canTransitionOrderStatus("out_for_delivery", "delivered")).toBe(
			true,
		);
	});

	test("allows cancellation before delivery", () => {
		expect(canTransitionOrderStatus("pending", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("accepted", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("preparing", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("out_for_delivery", "cancelled")).toBe(
			true,
		);
	});

	test("blocks invalid skips and terminal transitions", () => {
		expect(canTransitionOrderStatus("pending", "delivered")).toBe(false);
		expect(canTransitionOrderStatus("cancelled", "pending")).toBe(false);
		expect(canTransitionOrderStatus("delivered", "cancelled")).toBe(false);
	});
});

describe("transitionOrderStatus", () => {
	test("updates the status and the matching timestamp only", () => {
		const changedAt = new Date("2026-04-15T12:00:00.000Z");
		const order = {
			acceptedAt: new Date("2026-04-15T10:00:00.000Z"),
			deliveredAt: null,
			deliveringAt: null,
			preparingAt: null,
			status: "accepted" as const,
		};

		expect(transitionOrderStatus(order, "preparing", changedAt)).toEqual({
			acceptedAt: new Date("2026-04-15T10:00:00.000Z"),
			deliveredAt: null,
			deliveringAt: null,
			preparingAt: changedAt,
			status: "preparing",
		});
	});

	test("preserves pre-existing timestamps", () => {
		const originalTimestamp = new Date("2026-04-15T11:00:00.000Z");
		const changedAt = new Date("2026-04-15T12:00:00.000Z");

		expect(
			transitionOrderStatus(
				{
					deliveredAt: null,
					deliveringAt: null,
					preparingAt: originalTimestamp,
					status: "accepted",
				},
				"preparing",
				changedAt,
			),
		).toEqual({
			deliveredAt: null,
			deliveringAt: null,
			preparingAt: originalTimestamp,
			status: "preparing",
		});
	});

	test("throws on invalid transitions", () => {
		expect(() =>
			transitionOrderStatus({ status: "pending" }, "delivered"),
		).toThrow(/Cannot transition/);
	});
});

describe("isMenuItemAvailable", () => {
	test("returns true when the item is available", () => {
		expect(isMenuItemAvailable({ available: true })).toBe(true);
	});

	test("returns false when the item is unavailable", () => {
		expect(isMenuItemAvailable({ available: false })).toBe(false);
	});
});
