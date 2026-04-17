import type { OrderStatus } from "@finchat/db/schema";

export interface OrderTotalLineItem {
	quantity: number;
	unitPriceSnapshotInCents: number;
}

export interface OrderCreationItem {
	available: boolean;
	menuItemId: string;
	notes?: string;
	quantity: number;
}

export interface OrderCreationPayload {
	items: Array<OrderCreationItem>;
	orderNotes?: string;
}

export interface MenuItemSnapshotSource {
	available: boolean;
	hotelId: string;
	id: string;
	name: string;
	priceInCents: number;
}

export interface RequestedOrderItem {
	menuItemId: string;
	notes?: string;
	quantity: number;
}

export interface OrderItemSnapshot {
	itemNameSnapshot: string;
	lineTotalInCents: number;
	menuItemId: string;
	notes?: string;
	quantity: number;
	unitPriceSnapshotInCents: number;
}

export interface GuestSessionOrderContext {
	expiresAt: Date;
	hotelActive: boolean;
	roomActive: boolean;
}

export interface InitialStatusHistory {
	changedAt: Date;
	changedByUserId: null;
	fromStatus: null;
	orderId: string;
	reason: null;
	toStatus: "pending";
}

export interface TransitionableOrder {
	acceptedAt?: Date | null;
	cancelledAt?: Date | null;
	deliveredAt?: Date | null;
	deliveringAt?: Date | null;
	id?: string;
	preparingAt?: Date | null;
	status: OrderStatus;
}

export type AuditableOrder = TransitionableOrder & {
	guestSessionId?: string | null;
	hotelId: string;
	id: string;
	placedAt?: Date | null;
	roomId: string;
};

export interface OrderAuditContext {
	acceptedAt?: Date | null;
	cancelledAt?: Date | null;
	deliveredAt?: Date | null;
	guestSessionId?: string | null;
	hotelId: string;
	orderId: string;
	placedAt?: Date | null;
	preparingAt?: Date | null;
	roomId: string;
	status: OrderStatus;
}

const orderStatusTransitions: Record<OrderStatus, Array<OrderStatus>> = {
	accepted: ["preparing", "cancelled"],
	cancelled: [],
	delivered: [],
	out_for_delivery: ["delivered", "cancelled"],
	pending: ["accepted", "cancelled"],
	preparing: ["out_for_delivery", "cancelled"],
};

function assertPositiveInteger(value: number, fieldName: string) {
	if (!Number.isInteger(value) || value <= 0) {
		throw new Error(`${fieldName} must be a positive integer`);
	}
}

function assertNonNegativeInteger(value: number, fieldName: string) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${fieldName} must be a non-negative integer`);
	}
}

export function calculateOrderTotal(items: Array<OrderTotalLineItem>) {
	return items.reduce((total, item) => {
		assertPositiveInteger(item.quantity, "quantity");
		assertNonNegativeInteger(
			item.unitPriceSnapshotInCents,
			"unitPriceSnapshotInCents",
		);
		return total + item.quantity * item.unitPriceSnapshotInCents;
	}, 0);
}

export function validateOrderCreation(payload: OrderCreationPayload) {
	if (payload.items.length === 0) {
		throw new Error("Order must include at least one item");
	}

	for (const item of payload.items) {
		assertPositiveInteger(item.quantity, "quantity");
		if (!item.available) {
			throw new Error(`Menu item ${item.menuItemId} is unavailable`);
		}
	}

	return payload;
}

export function buildOrderItemSnapshots(
	menuItems: Array<MenuItemSnapshotSource>,
	requestedItems: Array<RequestedOrderItem>,
) {
	const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));

	return requestedItems.map((requestedItem) => {
		assertPositiveInteger(requestedItem.quantity, "quantity");

		const menuItem = menuItemsById.get(requestedItem.menuItemId);
		if (!menuItem) {
			throw new Error(`Menu item ${requestedItem.menuItemId} was not found`);
		}

		if (!menuItem.available) {
			throw new Error(`Menu item ${requestedItem.menuItemId} is unavailable`);
		}

		const unitPriceSnapshotInCents = menuItem.priceInCents;
		assertNonNegativeInteger(
			unitPriceSnapshotInCents,
			"unitPriceSnapshotInCents",
		);

		return {
			itemNameSnapshot: menuItem.name,
			lineTotalInCents: requestedItem.quantity * unitPriceSnapshotInCents,
			menuItemId: requestedItem.menuItemId,
			notes: requestedItem.notes,
			quantity: requestedItem.quantity,
			unitPriceSnapshotInCents,
		} satisfies OrderItemSnapshot;
	});
}

export function assertGuestSessionCanOrder(session: GuestSessionOrderContext) {
	if (session.expiresAt <= new Date()) {
		throw new Error("Guest session has expired");
	}

	if (!session.roomActive) {
		throw new Error("Room is inactive");
	}

	if (!session.hotelActive) {
		throw new Error("Hotel is inactive");
	}

	return session;
}

export function assertMenuItemsBelongToHotel(
	hotelId: string,
	items: Array<{ hotelId: string; id: string }>,
) {
	for (const item of items) {
		if (item.hotelId !== hotelId) {
			throw new Error(
				`Menu item ${item.id} does not belong to hotel ${hotelId}`,
			);
		}
	}

	return items;
}

export function createInitialStatusHistory(
	orderId: string,
	changedAt = new Date(),
): InitialStatusHistory {
	return {
		changedAt,
		changedByUserId: null,
		fromStatus: null,
		orderId,
		reason: null,
		toStatus: "pending",
	};
}

export function assertUserCanManageHotel(
	userId: string,
	membership: { hotelId: string; userId: string } | null,
	hotelId: string,
) {
	if (!membership || membership.userId !== userId) {
		throw new Error("User is not assigned to this hotel");
	}

	if (membership.hotelId !== hotelId) {
		throw new Error("User cannot manage another hotel");
	}

	return membership;
}

export function assertOrderExists<TOrder>(
	order: TOrder | null | undefined,
	orderId?: string,
) {
	if (!order) {
		if (orderId) {
			throw new Error(`Order ${orderId} was not found`);
		}

		throw new Error("Order was not found");
	}

	return order;
}

export function listOperationalOrders<
	TOrder extends { hotelId: string; placedAt: Date; status: OrderStatus },
>(
	orders: Array<TOrder>,
	filters: { hotelId: string; includeCompleted?: boolean },
) {
	return orders
		.filter((order) => {
			if (order.hotelId !== filters.hotelId) {
				return false;
			}

			if (filters.includeCompleted) {
				return true;
			}

			return order.status !== "cancelled" && order.status !== "delivered";
		})
		.sort((left, right) => left.placedAt.getTime() - right.placedAt.getTime());
}

export function transitionOrderStatusWithAudit(
	order: TransitionableOrder & { id: string },
	nextStatus: OrderStatus,
	actorId: string,
	changedAt = new Date(),
) {
	const nextOrder = transitionOrderStatus(order, nextStatus, changedAt);

	return {
		history: {
			changedAt,
			changedByUserId: actorId,
			fromStatus: order.status,
			orderId: order.id,
			reason: null,
			toStatus: nextStatus,
		},
		order: nextOrder,
	};
}

export function createOrderAuditContext(
	order: AuditableOrder,
): OrderAuditContext {
	return {
		acceptedAt: order.acceptedAt ?? null,
		cancelledAt: order.cancelledAt ?? null,
		deliveredAt: order.deliveredAt ?? null,
		guestSessionId: order.guestSessionId ?? null,
		hotelId: order.hotelId,
		orderId: order.id,
		placedAt: order.placedAt ?? null,
		preparingAt: order.preparingAt ?? null,
		roomId: order.roomId,
		status: order.status,
	};
}

export interface OrderStatusEvent {
	hotelId: string;
	orderId: string;
	roomId: string;
	status: OrderStatus;
	timestamp: Date;
}

export function buildOrderStatusEvent(input: {
	changedAt?: Date;
	hotelId: string;
	orderId: string;
	roomId: string;
	status: OrderStatus;
}) {
	return {
		hotelId: input.hotelId,
		orderId: input.orderId,
		roomId: input.roomId,
		status: input.status,
		timestamp: input.changedAt ?? new Date(),
	} satisfies OrderStatusEvent;
}

export function shouldNotifyGuest(status: OrderStatus) {
	return (
		status === "accepted" ||
		status === "preparing" ||
		status === "out_for_delivery" ||
		status === "delivered" ||
		status === "cancelled"
	);
}

export function canTransitionOrderStatus(
	currentStatus: OrderStatus,
	nextStatus: OrderStatus,
) {
	return orderStatusTransitions[currentStatus].includes(nextStatus);
}

export function transitionOrderStatus(
	order: TransitionableOrder,
	nextStatus: OrderStatus,
	changedAt = new Date(),
) {
	if (!canTransitionOrderStatus(order.status, nextStatus)) {
		throw new Error(
			`Cannot transition order from ${order.status} to ${nextStatus}`,
		);
	}

	const nextOrder: TransitionableOrder = {
		...order,
		status: nextStatus,
	};

	if (nextStatus === "accepted") {
		nextOrder.acceptedAt = order.acceptedAt ?? changedAt;
	}

	if (nextStatus === "preparing") {
		nextOrder.preparingAt = order.preparingAt ?? changedAt;
	}

	if (nextStatus === "out_for_delivery") {
		nextOrder.deliveringAt = order.deliveringAt ?? changedAt;
	}

	if (nextStatus === "delivered") {
		nextOrder.deliveredAt = order.deliveredAt ?? changedAt;
	}

	if (nextStatus === "cancelled") {
		nextOrder.cancelledAt = order.cancelledAt ?? changedAt;
	}

	return nextOrder;
}

export function isMenuItemAvailable(item: { available: boolean }) {
	return item.available;
}
