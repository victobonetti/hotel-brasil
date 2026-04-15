import { describe, expect, test } from "bun:test";

import {
	assertGuestSessionCanOrder,
	assertMenuItemsBelongToHotel,
	buildOrderItemSnapshots,
	calculateOrderTotal,
	canTransitionOrderStatus,
	createInitialStatusHistory,
	isMenuItemAvailable,
	transitionOrderStatus,
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
		expect(() => validateOrderCreation({ items: [] })).toThrow(/at least one item/);
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
					{ available: true, menuItemId: "item_1", notes: "No ice", quantity: 1 },
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

describe("canTransitionOrderStatus", () => {
	test("allows the happy path status sequence", () => {
		expect(canTransitionOrderStatus("pending", "accepted")).toBe(true);
		expect(canTransitionOrderStatus("accepted", "preparing")).toBe(true);
		expect(canTransitionOrderStatus("preparing", "out_for_delivery")).toBe(true);
		expect(canTransitionOrderStatus("out_for_delivery", "delivered")).toBe(true);
	});

	test("allows cancellation before delivery", () => {
		expect(canTransitionOrderStatus("pending", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("accepted", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("preparing", "cancelled")).toBe(true);
		expect(canTransitionOrderStatus("out_for_delivery", "cancelled")).toBe(true);
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
