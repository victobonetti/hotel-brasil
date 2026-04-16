import { randomUUID } from "node:crypto";

import type { OrderStatus } from "@finchat/db/schema";
import {
	assertGuestSessionCanOrder,
	assertOrderExists,
	assertMenuItemsBelongToHotel,
	assertUserCanManageHotel,
	buildOrderStatusEvent,
	buildOrderItemSnapshots,
	calculateOrderTotal,
	createOrderAuditContext,
	createInitialStatusHistory,
	listOperationalOrders,
	shouldNotifyGuest,
	transitionOrderStatusWithAudit,
	validateOrderCreation,
	type RequestedOrderItem,
	type OrderAuditContext,
	type TransitionableOrder,
} from "../domain/order";

export type GuestSessionOrderLookup = {
	expiresAt: Date;
	hotelActive: boolean;
	hotelId: string;
	id: string;
	roomActive: boolean;
	roomId: string;
	token: string;
};

export type MenuItemOrderLookup = {
	available: boolean;
	hotelId: string;
	id: string;
	name: string;
	priceInCents: number;
};

export type PersistedOrderRecord = {
	acceptedAt: Date | null;
	cancelledAt: Date | null;
	deliveredAt: Date | null;
	deliveringAt: Date | null;
	guestSessionId: string;
	hotelId: string;
	id: string;
	notes: string | null;
	placedAt: Date;
	preparingAt: Date | null;
	roomId: string;
	status: OrderStatus;
	totalAmountInCents: number;
};

export type PersistedOrderItemRecord = {
	id: string;
	itemNameSnapshot: string;
	lineTotalInCents: number;
	menuItemId: string;
	notes: string | null;
	orderId: string;
	quantity: number;
	unitPriceSnapshotInCents: number;
};

export type PersistedOrderHistoryRecord = {
	changedAt: Date;
	changedByUserId: string | null;
	fromStatus: OrderStatus | null;
	id: string;
	orderId: string;
	reason: string | null;
	toStatus: OrderStatus;
};

export type OrderTrackingView = {
	history: PersistedOrderHistoryRecord[];
	order: PersistedOrderRecord & {
		items: PersistedOrderItemRecord[];
	};
};

export type StaffHotelMembership = {
	hotelId: string;
	role: "admin" | "frontdesk" | "kitchen" | "manager";
	userId: string;
};

export type InAppOrderStatusNotification = {
	guest: {
		shouldNotify: boolean;
	};
	staff: {
		shouldRefetchActiveOrders: boolean;
	};
	event: ReturnType<typeof buildOrderStatusEvent>;
};

export type OrderAuditLogEntry = {
	action: string;
	auditContext: OrderAuditContext;
	actorUserId: string | null;
};

type OrderServiceDeps = {
	createOrder: (
		order: PersistedOrderRecord,
		items: PersistedOrderItemRecord[],
		history: PersistedOrderHistoryRecord,
	) => Promise<void> | void;
	findGuestSessionByToken: (
		token: string,
	) => Promise<GuestSessionOrderLookup | null> | GuestSessionOrderLookup | null;
	findOrderTrackingByGuestSession: (
		guestSessionId: string,
		orderId: string,
	) => Promise<OrderTrackingView | null> | OrderTrackingView | null;
	listGuestOrders: (
		guestSessionId: string,
	) => Promise<PersistedOrderRecord[]> | PersistedOrderRecord[];
	loadMenuItems: (
		menuItemIds: string[],
	) => Promise<MenuItemOrderLookup[]> | MenuItemOrderLookup[];
	logAuditEvent?: (entry: OrderAuditLogEntry) => Promise<void> | void;
	now?: () => Date;
};

export class OrderServiceError extends Error {
	constructor(
		public readonly code:
			| "GUEST_SESSION_EXPIRED"
			| "GUEST_SESSION_NOT_FOUND"
			| "HOTEL_INACTIVE"
			| "MENU_ITEM_NOT_FOUND"
			| "MENU_ITEM_UNAVAILABLE"
			| "ORDER_NOT_FOUND"
			| "ORDER_TRANSITION_INVALID"
			| "ROOM_INACTIVE"
			| "STAFF_MEMBERSHIP_REQUIRED"
			| "TENANT_MISMATCH",
		message: string,
	) {
		super(message);
		this.name = "OrderServiceError";
	}
}

function toOrderServiceError(error: unknown): never {
	if (error instanceof Error) {
		if (error.message.includes("expired")) {
			throw new OrderServiceError("GUEST_SESSION_EXPIRED", error.message);
		}

		if (error.message.includes("Room is inactive")) {
			throw new OrderServiceError("ROOM_INACTIVE", error.message);
		}

		if (error.message.includes("Hotel is inactive")) {
			throw new OrderServiceError("HOTEL_INACTIVE", error.message);
		}

		if (error.message.includes("does not belong")) {
			throw new OrderServiceError("TENANT_MISMATCH", error.message);
		}

		if (
			error.message.includes("not assigned") ||
			error.message.includes("cannot manage another hotel")
		) {
			throw new OrderServiceError("STAFF_MEMBERSHIP_REQUIRED", error.message);
		}

		if (error.message.includes("unavailable")) {
			throw new OrderServiceError("MENU_ITEM_UNAVAILABLE", error.message);
		}

		if (error.message.includes("Order") && error.message.includes("not found")) {
			throw new OrderServiceError("ORDER_NOT_FOUND", error.message);
		}

		if (error.message.includes("not found")) {
			throw new OrderServiceError("MENU_ITEM_NOT_FOUND", error.message);
		}

		if (error.message.includes("Cannot transition order")) {
			throw new OrderServiceError("ORDER_TRANSITION_INVALID", error.message);
		}
	}

	throw error;
}

export async function createOrderFromGuestSession(
	deps: OrderServiceDeps,
	input: {
		guestSessionToken: string;
		items: RequestedOrderItem[];
		orderNotes?: string;
	},
) {
	const guestSession = await deps.findGuestSessionByToken(input.guestSessionToken);
	if (!guestSession) {
		throw new OrderServiceError(
			"GUEST_SESSION_NOT_FOUND",
			"Guest session token is invalid",
		);
	}

	try {
		validateOrderCreation({
			items: input.items.map((item) => ({
				available: true,
				menuItemId: item.menuItemId,
				notes: item.notes,
				quantity: item.quantity,
			})),
			orderNotes: input.orderNotes,
		});
		assertGuestSessionCanOrder({
			expiresAt: guestSession.expiresAt,
			hotelActive: guestSession.hotelActive,
			roomActive: guestSession.roomActive,
		});
	} catch (error) {
		toOrderServiceError(error);
	}

	const menuItemIds = [...new Set(input.items.map((item) => item.menuItemId))];
	const menuItems = await deps.loadMenuItems(menuItemIds);

	try {
		assertMenuItemsBelongToHotel(guestSession.hotelId, menuItems);
	} catch (error) {
		toOrderServiceError(error);
	}

	if (menuItems.length !== menuItemIds.length) {
		throw new OrderServiceError(
			"MENU_ITEM_NOT_FOUND",
			"One or more menu items were not found",
		);
	}

	let snapshots;
	try {
		snapshots = buildOrderItemSnapshots(menuItems, input.items);
	} catch (error) {
		toOrderServiceError(error);
	}

	const now = deps.now?.() ?? new Date();
	const orderId = randomUUID();
	const totalAmountInCents = calculateOrderTotal(snapshots);
	const order: PersistedOrderRecord = {
		acceptedAt: null,
		cancelledAt: null,
		deliveredAt: null,
		deliveringAt: null,
		guestSessionId: guestSession.id,
		hotelId: guestSession.hotelId,
		id: orderId,
		notes: input.orderNotes ?? null,
		placedAt: now,
		preparingAt: null,
		roomId: guestSession.roomId,
		status: "pending",
		totalAmountInCents,
	};

	const orderItems: PersistedOrderItemRecord[] = snapshots.map((snapshot) => ({
		...snapshot,
		id: randomUUID(),
		notes: snapshot.notes ?? null,
		orderId,
	}));

	const initialHistoryData = createInitialStatusHistory(orderId, now);
	const history: PersistedOrderHistoryRecord = {
		...initialHistoryData,
		id: randomUUID(),
	};

	await deps.createOrder(order, orderItems, history);
	const auditContext = createOrderAuditContext(order);
	await deps.logAuditEvent?.({
		action: "order.created",
		auditContext,
		actorUserId: null,
	});

	return {
		auditContext,
		orderId,
		status: order.status,
		totalAmountInCents,
	};
}

export async function getOrderTracking(
	deps: OrderServiceDeps,
	input: {
		guestSessionToken: string;
		orderId: string;
	},
) {
	const guestSession = await deps.findGuestSessionByToken(input.guestSessionToken);
	if (!guestSession) {
		throw new OrderServiceError(
			"GUEST_SESSION_NOT_FOUND",
			"Guest session token is invalid",
		);
	}

	try {
		assertGuestSessionCanOrder({
			expiresAt: guestSession.expiresAt,
			hotelActive: guestSession.hotelActive,
			roomActive: guestSession.roomActive,
		});
	} catch (error) {
		toOrderServiceError(error);
	}

	let tracking: OrderTrackingView;
	try {
		tracking = assertOrderExists(
			await deps.findOrderTrackingByGuestSession(guestSession.id, input.orderId),
			input.orderId,
		);
	} catch (error) {
		toOrderServiceError(error);
	}

	return {
		history: [...tracking.history].sort(
			(left, right) => left.changedAt.getTime() - right.changedAt.getTime(),
		),
		order: tracking.order,
	};
}

export async function getOrderByGuestSession(
	deps: OrderServiceDeps,
	input: {
		guestSessionToken: string;
		orderId: string;
	},
) {
	return getOrderTracking(deps, input);
}

export async function listOrderStatusHistory(
	deps: OrderServiceDeps,
	input: {
		guestSessionToken: string;
		orderId: string;
	},
) {
	const tracking = await getOrderTracking(deps, input);
	return tracking.history;
}

export async function listGuestOrders(
	deps: OrderServiceDeps,
	input: { guestSessionToken: string },
) {
	const guestSession = await deps.findGuestSessionByToken(input.guestSessionToken);
	if (!guestSession) {
		throw new OrderServiceError(
			"GUEST_SESSION_NOT_FOUND",
			"Guest session token is invalid",
		);
	}

	try {
		assertGuestSessionCanOrder({
			expiresAt: guestSession.expiresAt,
			hotelActive: guestSession.hotelActive,
			roomActive: guestSession.roomActive,
		});
	} catch (error) {
		toOrderServiceError(error);
	}

	return await deps.listGuestOrders(guestSession.id);
}

export async function listActiveOrders(
	deps: {
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		listOrdersByHotelId: (
			hotelId: string,
		) => Promise<PersistedOrderRecord[]> | PersistedOrderRecord[];
	},
	input: { userId: string },
) {
	const membership = await deps.findMembershipByUserId(input.userId);
	if (!membership) {
		throw new OrderServiceError(
			"STAFF_MEMBERSHIP_REQUIRED",
			"User is not assigned to this hotel",
		);
	}

	const orders = await deps.listOrdersByHotelId(membership.hotelId);
	return listOperationalOrders(orders, { hotelId: membership.hotelId });
}

export async function transitionStaffOrderStatus(
	deps: {
		createHistoryEntry: (
			history: PersistedOrderHistoryRecord,
		) => Promise<void> | void;
		findMembershipByUserId: (
			userId: string,
		) => Promise<StaffHotelMembership | null> | StaffHotelMembership | null;
		findOrderById: (
			orderId: string,
		) => Promise<PersistedOrderRecord | null> | PersistedOrderRecord | null;
		logAuditEvent?: (entry: OrderAuditLogEntry) => Promise<void> | void;
		now?: () => Date;
		updateOrder: (
			orderId: string,
			order: Partial<PersistedOrderRecord>,
		) => Promise<void> | void;
	},
	input: { nextStatus: OrderStatus; orderId: string; userId: string },
) {
	let order: PersistedOrderRecord;
	try {
		order = assertOrderExists(await deps.findOrderById(input.orderId), input.orderId);
	} catch (error) {
		toOrderServiceError(error);
	}

	const membership = await deps.findMembershipByUserId(input.userId);
	try {
		assertUserCanManageHotel(input.userId, membership, order.hotelId);
	} catch (error) {
		toOrderServiceError(error);
	}

	const changedAt = deps.now?.() ?? new Date();
	let transition: ReturnType<typeof transitionOrderStatusWithAudit>;
	try {
		transition = transitionOrderStatusWithAudit(
			order as TransitionableOrder & { id: string },
			input.nextStatus,
			input.userId,
			changedAt,
		);
	} catch (error) {
		toOrderServiceError(error);
	}

	const history: PersistedOrderHistoryRecord = {
		...transition.history,
		id: randomUUID(),
	};

	await deps.updateOrder(order.id, {
		acceptedAt: transition.order.acceptedAt ?? null,
		cancelledAt: transition.order.cancelledAt ?? null,
		deliveredAt: transition.order.deliveredAt ?? null,
		deliveringAt: transition.order.deliveringAt ?? null,
		preparingAt: transition.order.preparingAt ?? null,
		status: transition.order.status,
	});
	await deps.createHistoryEntry(history);
	const nextOrder = {
		...order,
		...transition.order,
	};
	const auditContext = createOrderAuditContext(nextOrder);
	await deps.logAuditEvent?.({
		action: `order.${transition.order.status}`,
		auditContext,
		actorUserId: input.userId,
	});

	return {
		auditContext,
		notification: {
			event: buildOrderStatusEvent({
				changedAt,
				hotelId: order.hotelId,
				orderId: order.id,
				roomId: order.roomId,
				status: transition.order.status,
			}),
			guest: {
				shouldNotify: shouldNotifyGuest(transition.order.status),
			},
			staff: {
				shouldRefetchActiveOrders: true,
			},
		} satisfies InAppOrderStatusNotification,
		history,
		order: nextOrder,
	};
}
