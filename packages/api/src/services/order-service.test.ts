import { describe, expect, test } from "bun:test";

import {
	createOrderFromGuestSession,
	getOrderTracking,
	listActiveOrders,
	listOrderStatusHistory,
	type PersistedOrderHistoryRecord,
	type PersistedOrderItemRecord,
	type PersistedOrderRecord,
	transitionStaffOrderStatus,
} from "./order-service";

const guestSession = {
	expiresAt: new Date("2099-04-17T12:00:00.000Z"),
	hotelActive: true,
	hotelId: "hotel-1",
	id: "session-1",
	roomActive: true,
	roomId: "room-101",
	token: "token-1",
};

const menuItems = [
	{
		available: true,
		hotelId: "hotel-1",
		id: "item-1",
		name: "Burger",
		priceInCents: 4200,
	},
];

describe("createOrderFromGuestSession", () => {
	test("creates a pending order with items, total and initial history", async () => {
		const created: {
			history?: PersistedOrderHistoryRecord;
			items?: Array<PersistedOrderItemRecord>;
			order?: PersistedOrderRecord;
		} = {};

		const result = await createOrderFromGuestSession(
			{
				createOrder: (order, items, history) => {
					created.order = order;
					created.items = items;
					created.history = history;
				},
				findGuestSessionByToken: () => guestSession,
				findOrderTrackingByGuestSession: () => null,
				listGuestOrders: () => [],
				loadMenuItems: () => menuItems,
				now: () => new Date("2099-04-16T10:00:00.000Z"),
			},
			{
				guestSessionToken: "token-1",
				items: [{ menuItemId: "item-1", notes: "No onions", quantity: 2 }],
				orderNotes: "Leave at the door",
			},
		);

		expect(result.status).toBe("pending");
		expect(result.totalAmountInCents).toBe(8400);
		expect(result.auditContext).toMatchObject({
			guestSessionId: "session-1",
			hotelId: "hotel-1",
			orderId: expect.any(String),
			roomId: "room-101",
			status: "pending",
		});
		expect(created.order?.status).toBe("pending");
		expect(created.items?.[0]).toMatchObject({
			itemNameSnapshot: "Burger",
			lineTotalInCents: 8400,
			notes: "No onions",
			quantity: 2,
			unitPriceSnapshotInCents: 4200,
		});
		expect(created.history).toMatchObject({
			fromStatus: null,
			toStatus: "pending",
		});
	});

	test("rejects an invalid session", async () => {
		await expect(
			createOrderFromGuestSession(
				{
					createOrder: () => undefined,
					findGuestSessionByToken: () => null,
					findOrderTrackingByGuestSession: () => null,
					listGuestOrders: () => [],
					loadMenuItems: () => menuItems,
				},
				{
					guestSessionToken: "missing",
					items: [{ menuItemId: "item-1", quantity: 1 }],
				},
			),
		).rejects.toMatchObject({ code: "GUEST_SESSION_NOT_FOUND" });
	});

	test("rejects unavailable items", async () => {
		await expect(
			createOrderFromGuestSession(
				{
					createOrder: () => undefined,
					findGuestSessionByToken: () => guestSession,
					findOrderTrackingByGuestSession: () => null,
					listGuestOrders: () => [],
					loadMenuItems: () => [{ ...menuItems[0], available: false }],
					now: () => new Date("2099-04-16T10:00:00.000Z"),
				},
				{
					guestSessionToken: "token-1",
					items: [{ menuItemId: "item-1", quantity: 1 }],
				},
			),
		).rejects.toMatchObject({ code: "MENU_ITEM_UNAVAILABLE" });
	});

	test("rejects items from another hotel", async () => {
		await expect(
			createOrderFromGuestSession(
				{
					createOrder: () => undefined,
					findGuestSessionByToken: () => guestSession,
					findOrderTrackingByGuestSession: () => null,
					listGuestOrders: () => [],
					loadMenuItems: () => [{ ...menuItems[0], hotelId: "hotel-2" }],
					now: () => new Date("2099-04-16T10:00:00.000Z"),
				},
				{
					guestSessionToken: "token-1",
					items: [{ menuItemId: "item-1", quantity: 1 }],
				},
			),
		).rejects.toMatchObject({ code: "TENANT_MISMATCH" });
	});
});

describe("getOrderTracking", () => {
	test("returns only the order linked to the guest session with history ordered", async () => {
		const tracking = await getOrderTracking(
			{
				createOrder: () => undefined,
				findGuestSessionByToken: () => guestSession,
				findOrderTrackingByGuestSession: () => ({
					history: [
						{
							changedAt: new Date("2026-04-16T11:00:00.000Z"),
							changedByUserId: null,
							fromStatus: "pending",
							id: "history-2",
							orderId: "order-1",
							reason: null,
							toStatus: "accepted",
						},
						{
							changedAt: new Date("2026-04-16T10:00:00.000Z"),
							changedByUserId: null,
							fromStatus: null,
							id: "history-1",
							orderId: "order-1",
							reason: null,
							toStatus: "pending",
						},
					],
					order: {
						acceptedAt: null,
						cancelledAt: null,
						deliveredAt: null,
						deliveringAt: null,
						guestSessionId: "session-1",
						hotelId: "hotel-1",
						id: "order-1",
						items: [
							{
								id: "order-item-1",
								itemNameSnapshot: "Burger",
								lineTotalInCents: 4200,
								menuItemId: "item-1",
								notes: null,
								orderId: "order-1",
								quantity: 1,
								unitPriceSnapshotInCents: 4200,
							},
						],
						notes: "Leave at the door",
						placedAt: new Date("2026-04-16T10:00:00.000Z"),
						preparingAt: null,
						roomId: "room-101",
						status: "accepted",
						totalAmountInCents: 4200,
					},
				}),
				listGuestOrders: () => [],
				loadMenuItems: () => menuItems,
			},
			{ guestSessionToken: "token-1", orderId: "order-1" },
		);

		expect(tracking.order.items).toHaveLength(1);
		expect(tracking.history.map((entry) => entry.id)).toEqual([
			"history-1",
			"history-2",
		]);
	});

	test("fails when the order belongs to another session or is missing", async () => {
		await expect(
			getOrderTracking(
				{
					createOrder: () => undefined,
					findGuestSessionByToken: () => guestSession,
					findOrderTrackingByGuestSession: () => null,
					listGuestOrders: () => [],
					loadMenuItems: () => menuItems,
				},
				{ guestSessionToken: "token-1", orderId: "order-404" },
			),
		).rejects.toMatchObject({ code: "ORDER_NOT_FOUND" });
	});
});

describe("listOrderStatusHistory", () => {
	test("returns only ordered events for the requested order", async () => {
		const history = await listOrderStatusHistory(
			{
				createOrder: () => undefined,
				findGuestSessionByToken: () => guestSession,
				findOrderTrackingByGuestSession: () => ({
					history: [
						{
							changedAt: new Date("2026-04-16T10:00:00.000Z"),
							changedByUserId: null,
							fromStatus: null,
							id: "history-1",
							orderId: "order-1",
							reason: null,
							toStatus: "pending",
						},
					],
					order: {
						acceptedAt: null,
						cancelledAt: null,
						deliveredAt: null,
						deliveringAt: null,
						guestSessionId: "session-1",
						hotelId: "hotel-1",
						id: "order-1",
						items: [],
						notes: null,
						placedAt: new Date("2026-04-16T10:00:00.000Z"),
						preparingAt: null,
						roomId: "room-101",
						status: "pending",
						totalAmountInCents: 0,
					},
				}),
				listGuestOrders: () => [],
				loadMenuItems: () => menuItems,
			},
			{ guestSessionToken: "token-1", orderId: "order-1" },
		);

		expect(history).toHaveLength(1);
		expect(history[0]?.orderId).toBe("order-1");
	});
});

describe("listActiveOrders", () => {
	test("returns paginated operational orders", async () => {
		const orders = Array.from({ length: 9 }, (_, index) => ({
			acceptedAt: null,
			cancelledAt: null,
			deliveredAt: null,
			deliveringAt: null,
			guestSessionId: `session-${index + 1}`,
			hotelId: "hotel-1",
			id: `order-${index + 1}`,
			notes: null,
			placedAt: new Date(`2026-04-16T10:0${index}:00.000Z`),
			preparingAt: null,
			roomId: `room-${index + 1}`,
			status: "pending" as const,
			totalAmountInCents: 1000 + index,
		}));

		const result = await listActiveOrders(
			{
				countOrdersByHotelId: () => orders.length,
				findMembershipByUserId: () => ({
					hotelId: "hotel-1",
					role: "manager",
					userId: "user-1",
				}),
				listOrdersByHotelId: (_hotelId, input) =>
					orders.slice(input.offset, input.offset + input.limit),
			},
			{ page: 2, pageSize: 8, userId: "user-1" },
		);

		expect(result.items.map((order) => order.id)).toEqual(["order-9"]);
		expect(result.pagination).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: true,
			page: 2,
			pageSize: 8,
			totalItems: 9,
			totalPages: 2,
		});
	});
});

describe("transitionStaffOrderStatus", () => {
	test("returns history, notification and audit context for a valid transition", async () => {
		const result = await transitionStaffOrderStatus(
			{
				createHistoryEntry: () => undefined,
				findMembershipByUserId: () => ({
					hotelId: "hotel-1",
					role: "manager",
					userId: "user-1",
				}),
				findOrderById: () => ({
					acceptedAt: null,
					cancelledAt: null,
					deliveredAt: null,
					deliveringAt: null,
					guestSessionId: "session-1",
					hotelId: "hotel-1",
					id: "order-1",
					notes: null,
					placedAt: new Date("2026-04-16T10:00:00.000Z"),
					preparingAt: null,
					roomId: "room-101",
					status: "pending",
					totalAmountInCents: 4200,
				}),
				now: () => new Date("2026-04-16T10:05:00.000Z"),
				updateOrder: () => undefined,
			},
			{
				nextStatus: "accepted",
				orderId: "order-1",
				userId: "user-1",
			},
		);

		expect(result.auditContext).toMatchObject({
			guestSessionId: "session-1",
			hotelId: "hotel-1",
			orderId: "order-1",
			roomId: "room-101",
			status: "accepted",
		});
		expect(result.notification.event.status).toBe("accepted");
		expect(result.history.changedByUserId).toBe("user-1");
	});
});
